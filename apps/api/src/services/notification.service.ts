import { eq, sql, and } from 'drizzle-orm';
import type { createDb } from '../db';
import { pushTokens, users, notifications } from '../db/schema';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

interface ExpoPushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: {
    error?: string;
  };
}

export class NotificationService {
  constructor(private db: ReturnType<typeof createDb>) {}

  // Save or update push token for a user
  async savePushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android'
  ): Promise<{ id: string }> {
    // Check if token exists for this user
    const existing = await this.db.query.pushTokens.findFirst({
      where: and(eq(pushTokens.userId, userId), eq(pushTokens.token, token)),
    });

    if (existing) {
      return { id: existing.id };
    }

    // Delete old tokens for this user (keep only one per user for simplicity)
    await this.db.delete(pushTokens).where(eq(pushTokens.userId, userId));

    // Insert new token
    const [result] = await this.db
      .insert(pushTokens)
      .values({
        userId,
        token,
        platform,
      })
      .returning({ id: pushTokens.id });

    return { id: result.id };
  }

  // Remove push token
  async removePushToken(userId: string, token?: string): Promise<void> {
    if (token) {
      await this.db
        .delete(pushTokens)
        .where(and(eq(pushTokens.userId, userId), eq(pushTokens.token, token)));
    } else {
      await this.db.delete(pushTokens).where(eq(pushTokens.userId, userId));
    }
  }

  // Get push tokens for specific users
  async getTokensForUsers(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) return [];

    const tokens = await this.db.query.pushTokens.findMany({
      where: sql`${pushTokens.userId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`,
    });

    return tokens.map((t) => t.token);
  }

  // Get all tokens (optionally filtered by role)
  async getAllTokens(role?: 'customer' | 'office_admin'): Promise<string[]> {
    if (role) {
      // Join with users to filter by role
      const results = await this.db
        .select({ token: pushTokens.token })
        .from(pushTokens)
        .innerJoin(users, eq(pushTokens.userId, users.id))
        .where(eq(users.role, role));

      return results.map((r) => r.token);
    }

    const tokens = await this.db.query.pushTokens.findMany();
    return tokens.map((t) => t.token);
  }

  // Send push notification to specific tokens
  async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<{ successful: number; failed: number }> {
    if (tokens.length === 0) {
      return { successful: 0, failed: 0 };
    }

    // Filter out invalid tokens (Expo push tokens start with 'ExponentPushToken[')
    const validTokens = tokens.filter(
      (t) => t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken[')
    );

    if (validTokens.length === 0) {
      return { successful: 0, failed: tokens.length };
    }

    // Create messages
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      title,
      body,
      sound: 'default',
      data,
    }));

    // Send in batches of 100 (Expo limit)
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);

      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          console.error('Expo push error:', await response.text());
          failed += batch.length;
          continue;
        }

        const result = (await response.json()) as { data: ExpoPushTicket[] };

        for (const ticket of result.data) {
          if (ticket.status === 'ok') {
            successful++;
          } else {
            failed++;
            console.warn('Push notification failed:', ticket.message);
          }
        }
      } catch (error) {
        console.error('Error sending push notifications:', error);
        failed += batch.length;
      }
    }

    return { successful, failed };
  }

  // Send notification to all users (optionally filtered by role)
  async sendMassNotification(
    adminId: string,
    title: string,
    body: string,
    titleAr?: string,
    bodyAr?: string,
    targetRole?: 'customer' | 'office_admin'
  ): Promise<{ sent: number; notificationId: string }> {
    // Get tokens
    const tokens = await this.getAllTokens(targetRole);

    // Send notifications
    const { successful } = await this.sendPushNotifications(tokens, title, body);

    // Record notification
    const [notification] = await this.db
      .insert(notifications)
      .values({
        adminId,
        title,
        titleAr,
        body,
        bodyAr,
        targetRole: targetRole as 'customer' | 'office_admin' | null,
        sentCount: successful,
      })
      .returning();

    return { sent: successful, notificationId: notification.id };
  }

  // Send notification to specific users
  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<{ successful: number; failed: number }> {
    const tokens = await this.getTokensForUsers(userIds);
    return this.sendPushNotifications(tokens, title, body, data);
  }

  // Get notification history
  async getNotificationHistory(
    page = 1,
    pageSize = 20
  ): Promise<{
    items: Array<{
      id: string;
      title: string;
      titleAr: string | null;
      body: string;
      bodyAr: string | null;
      targetRole: string | null;
      sentCount: number;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const offset = (page - 1) * pageSize;

    const [items, countResult] = await Promise.all([
      this.db.query.notifications.findMany({
        orderBy: (n, { desc }) => [desc(n.createdAt)],
        limit: pageSize,
        offset,
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(notifications),
    ]);

    return {
      items: items.map((n) => ({
        id: n.id,
        title: n.title,
        titleAr: n.titleAr,
        body: n.body,
        bodyAr: n.bodyAr,
        targetRole: n.targetRole,
        sentCount: n.sentCount,
        createdAt: n.createdAt,
      })),
      total: Number(countResult[0]?.count) || 0,
    };
  }
}
