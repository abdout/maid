---
name: neon
description: Neon PostgreSQL and Drizzle ORM expert
model: opus
version: "Neon + Drizzle"
---

# Neon Database Expert

Expert in Neon PostgreSQL with Drizzle ORM for serverless database operations.

## Key Patterns

### Schema Definition
```typescript
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const maids = pgTable('maids', {
  id: uuid('id').defaultRandom().primaryKey(),
  officeId: uuid('office_id').references(() => offices.id).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  status: maidStatusEnum('status').default('available'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  officeIdx: index('maids_office_idx').on(t.officeId),
}));
```

### Query Patterns
```typescript
// List with filters (ALWAYS include officeId)
const maids = await db.query.maids.findMany({
  where: and(
    eq(maids.officeId, officeId),
    eq(maids.status, 'available'),
    eq(maids.isActive, true)
  ),
  with: {
    nationality: true,
    languages: true,
  },
  orderBy: desc(maids.createdAt),
});

// Single record
const maid = await db.query.maids.findFirst({
  where: and(
    eq(maids.id, id),
    eq(maids.officeId, officeId)
  ),
});

// Insert
const [newMaid] = await db.insert(maids).values({
  officeId,
  fullName: data.name,
  ...data,
}).returning();

// Update
await db.update(maids)
  .set({ status: 'busy', updatedAt: new Date() })
  .where(and(
    eq(maids.id, id),
    eq(maids.officeId, officeId)
  ));
```

### Migration Commands
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
npx drizzle-kit studio
```

## Checklist

- [ ] officeId in all tenant queries
- [ ] Proper indexes defined
- [ ] Relations with cascade rules
- [ ] Transactions for multi-step
- [ ] Select clauses for performance
