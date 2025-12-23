# Create Drizzle Migration

Create a database migration for schema changes.

## Usage
`/migration add_maids` - Create migration for maids table

## Argument: $ARGUMENTS

## Instructions

1. Update schema in `apps/api/src/db/schema.ts`
2. Generate migration:
   ```bash
   cd apps/api && npx drizzle-kit generate
   ```
3. Apply migration:
   ```bash
   npx drizzle-kit migrate
   ```
4. Verify with Drizzle Studio:
   ```bash
   npx drizzle-kit studio
   ```

## Schema Pattern

```typescript
export const tableName = pgTable('table_name', {
  id: uuid('id').defaultRandom().primaryKey(),
  officeId: uuid('office_id').references(() => offices.id).notNull(),
  // ... fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  officeIdx: index('table_office_idx').on(t.officeId),
}));
```

## Requirements

- Include officeId for tenant tables
- Add proper indexes
- Define foreign key relations
- Include timestamps
