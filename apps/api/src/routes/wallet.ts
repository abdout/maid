import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { wallets, walletTransactions, maids, cvUnlocks } from '../db/schema';
import { authMiddleware } from '../middleware';
import { topUpSchema, cvUnlockSchema, transactionsQuerySchema } from '../validators/wallet.schema';

const CV_UNLOCK_PRICE = 40; // AED

const walletRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Helper to get or create wallet
async function getOrCreateWallet(db: ReturnType<typeof createDb>, userId: string) {
  const existing = await db.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
  });

  if (existing) {
    return existing;
  }

  const [wallet] = await db.insert(wallets).values({
    userId,
    balance: '0',
    currency: 'AED',
  }).returning();

  return wallet;
}

// Get wallet balance
walletRoute.get('/balance', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const wallet = await getOrCreateWallet(db, user.sub);

    return c.json({
      success: true,
      data: {
        balance: parseFloat(wallet.balance),
        currency: wallet.currency,
      },
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return c.json({ success: false, error: 'Failed to get balance' }, 500);
  }
});

// Get transaction history
walletRoute.get('/transactions', authMiddleware, zValidator('query', transactionsQuerySchema), async (c) => {
  const user = c.get('user');
  const { page, limit } = c.req.valid('query');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const wallet = await getOrCreateWallet(db, user.sub);

    const offset = (page - 1) * limit;

    const transactions = await db.query.walletTransactions.findMany({
      where: eq(walletTransactions.walletId, wallet.id),
      orderBy: [desc(walletTransactions.createdAt)],
      limit,
      offset,
    });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, wallet.id));

    return c.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return c.json({ success: false, error: 'Failed to get transactions' }, 500);
  }
});

// Create top-up intent
walletRoute.post('/topup/intent', authMiddleware, zValidator('json', topUpSchema), async (c) => {
  const { amount } = c.req.valid('json');

  try {
    // For demo: return mock intent (production would create Stripe intent)
    return c.json({
      success: true,
      data: {
        intentId: `topup_${Date.now()}`,
        amount,
        currency: 'AED',
      },
    });
  } catch (error) {
    console.error('Create top-up intent error:', error);
    return c.json({ success: false, error: 'Failed to create top-up intent' }, 500);
  }
});

// Confirm top-up
walletRoute.post('/topup/confirm', authMiddleware, zValidator('json', topUpSchema), async (c) => {
  const user = c.get('user');
  const { amount } = c.req.valid('json');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const wallet = await getOrCreateWallet(db, user.sub);
    const currentBalance = parseFloat(wallet.balance);
    const newBalance = currentBalance + amount;

    // Update wallet balance
    await db.update(wallets)
      .set({
        balance: newBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, wallet.id));

    // Record transaction
    const [transaction] = await db.insert(walletTransactions).values({
      walletId: wallet.id,
      type: 'topup',
      amount: amount.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      description: 'Wallet top-up',
    }).returning();

    return c.json({
      success: true,
      data: {
        transaction,
        newBalance,
      },
    });
  } catch (error) {
    console.error('Confirm top-up error:', error);
    return c.json({ success: false, error: 'Failed to confirm top-up' }, 400);
  }
});

// Unlock CV using wallet balance
walletRoute.post('/cv-unlock', authMiddleware, zValidator('json', cvUnlockSchema), async (c) => {
  const user = c.get('user');
  const { maidId } = c.req.valid('json');

  try {
    const db = createDb(c.env.DATABASE_URL);

    // Check if already unlocked
    const existingUnlock = await db.query.cvUnlocks.findFirst({
      where: and(
        eq(cvUnlocks.customerId, user.sub),
        eq(cvUnlocks.maidId, maidId)
      ),
    });

    if (existingUnlock) {
      return c.json({ success: true, data: { alreadyUnlocked: true, cvUnlock: existingUnlock } });
    }

    // Get wallet and check balance
    const wallet = await getOrCreateWallet(db, user.sub);
    const currentBalance = parseFloat(wallet.balance);

    if (currentBalance < CV_UNLOCK_PRICE) {
      return c.json({
        success: false,
        error: `Insufficient balance. You need ${CV_UNLOCK_PRICE} AED to unlock this CV. Current balance: ${currentBalance} AED`,
        data: {
          insufficientBalance: true,
          balance: currentBalance,
          required: CV_UNLOCK_PRICE,
          shortfall: CV_UNLOCK_PRICE - currentBalance,
        },
      }, 400);
    }

    // Verify maid exists
    const maid = await db.query.maids.findFirst({
      where: eq(maids.id, maidId),
    });

    if (!maid) {
      return c.json({ success: false, error: 'Maid not found' }, 404);
    }

    const newBalance = currentBalance - CV_UNLOCK_PRICE;

    // Update wallet balance
    await db.update(wallets)
      .set({
        balance: newBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, wallet.id));

    // Record wallet transaction
    const [transaction] = await db.insert(walletTransactions).values({
      walletId: wallet.id,
      type: 'cv_unlock',
      amount: (-CV_UNLOCK_PRICE).toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      description: `CV unlock - ${maid.name}`,
      referenceId: maidId,
      referenceType: 'maid',
    }).returning();

    // Record CV unlock
    const [cvUnlock] = await db.insert(cvUnlocks).values({
      customerId: user.sub,
      maidId,
    }).returning();

    return c.json({
      success: true,
      data: {
        alreadyUnlocked: false,
        cvUnlock,
        transaction,
        newBalance,
      },
    });
  } catch (error) {
    console.error('Unlock CV error:', error);
    return c.json({ success: false, error: 'Failed to unlock CV' }, 500);
  }
});

// Check if user can unlock CV
walletRoute.get('/can-unlock', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const wallet = await getOrCreateWallet(db, user.sub);
    const currentBalance = parseFloat(wallet.balance);

    return c.json({
      success: true,
      data: {
        canUnlock: currentBalance >= CV_UNLOCK_PRICE,
        balance: currentBalance,
        requiredAmount: CV_UNLOCK_PRICE,
        shortfall: Math.max(0, CV_UNLOCK_PRICE - currentBalance),
      },
    });
  } catch (error) {
    console.error('Check can unlock error:', error);
    return c.json({ success: false, error: 'Failed to check unlock status' }, 500);
  }
});

export default walletRoute;
