import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { favorites, maids, nationalities } from '../db/schema';
import { authMiddleware } from '../middleware';

const favoritesRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// List favorites
favoritesRoute.get('/', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const db = createDb(c.env.DATABASE_URL);

    const items = await db
      .select({
        favorite: favorites,
        maid: maids,
        nationality: nationalities,
      })
      .from(favorites)
      .innerJoin(maids, eq(favorites.maidId, maids.id))
      .leftJoin(nationalities, eq(maids.nationalityId, nationalities.id))
      .where(eq(favorites.userId, user.sub))
      .orderBy(desc(favorites.createdAt));

    return c.json({
      success: true,
      data: items.map((row) => ({
        id: row.favorite.id,
        maidId: row.favorite.maidId,
        createdAt: row.favorite.createdAt,
        maid: {
          ...row.maid,
          nationality: row.nationality,
        },
      })),
    });
  } catch (error) {
    console.error('List favorites error:', error);
    return c.json({ success: false, error: 'Failed to list favorites' }, 500);
  }
});

// Add to favorites
favoritesRoute.post(
  '/',
  authMiddleware,
  zValidator('json', z.object({
    maidId: z.string().uuid(),
  })),
  async (c) => {
    const { maidId } = c.req.valid('json');
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);

      // Check if already favorited
      const [existing] = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, user.sub), eq(favorites.maidId, maidId)))
        .limit(1);

      if (existing) {
        return c.json({ success: true, data: existing, message: 'Already in favorites' });
      }

      // Check if maid exists
      const [maid] = await db
        .select()
        .from(maids)
        .where(eq(maids.id, maidId))
        .limit(1);

      if (!maid) {
        return c.json({ success: false, error: 'Maid not found' }, 404);
      }

      const [favorite] = await db
        .insert(favorites)
        .values({ userId: user.sub, maidId })
        .returning();

      return c.json({ success: true, data: favorite }, 201);
    } catch (error) {
      console.error('Add favorite error:', error);
      return c.json({ success: false, error: 'Failed to add favorite' }, 500);
    }
  }
);

// Remove from favorites
favoritesRoute.delete('/:maidId', authMiddleware, async (c) => {
  const maidId = c.req.param('maidId');
  const user = c.get('user');

  try {
    const db = createDb(c.env.DATABASE_URL);

    const [deleted] = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, user.sub), eq(favorites.maidId, maidId)))
      .returning();

    if (!deleted) {
      return c.json({ success: false, error: 'Not in favorites' }, 404);
    }

    return c.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return c.json({ success: false, error: 'Failed to remove favorite' }, 500);
  }
});

// Check if maid is favorited
favoritesRoute.get('/check/:maidId', authMiddleware, async (c) => {
  const maidId = c.req.param('maidId');
  const user = c.get('user');

  try {
    const db = createDb(c.env.DATABASE_URL);

    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.sub), eq(favorites.maidId, maidId)))
      .limit(1);

    return c.json({ success: true, data: { isFavorite: !!favorite } });
  } catch (error) {
    console.error('Check favorite error:', error);
    return c.json({ success: false, error: 'Failed to check favorite' }, 500);
  }
});

export default favoritesRoute;
