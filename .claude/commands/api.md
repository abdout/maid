# Generate Hono API Route

Generate a new Hono API route with validation.

## Usage
`/api maids` - Create maids CRUD route

## Argument: $ARGUMENTS

## Instructions

1. Parse resource name from arguments
2. Create schema at `apps/api/src/validators/{name}.schema.ts`
3. Create route at `apps/api/src/routes/{name}.ts`
4. Register in `apps/api/src/routes/index.ts`

## Schema Template

```typescript
import { z } from 'zod';

export const create{Name}Schema = z.object({
  // Define fields
});

export type Create{Name}Input = z.infer<typeof create{Name}Schema>;
```

## Route Template

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';

const {name} = new Hono()
  .use('*', authMiddleware)
  .get('/', async (c) => {
    // List
  })
  .get('/:id', async (c) => {
    // Get by ID
  })
  .post('/', zValidator('json', schema), async (c) => {
    // Create
  })
  .put('/:id', zValidator('json', schema), async (c) => {
    // Update
  })
  .delete('/:id', async (c) => {
    // Delete
  });

export default {name};
```

## Requirements

- Validate all inputs with Zod
- Include auth middleware
- Include officeId for tenant queries
- Export types for RPC client
