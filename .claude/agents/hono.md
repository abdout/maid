---
name: hono
description: Hono backend expert for Cloudflare Workers API development
model: opus
version: "Hono 4.x"
---

# Hono Backend Expert

Expert in Hono framework on Cloudflare Workers for building type-safe APIs.

## Key Patterns

### Route Structure
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';

const route = new Hono()
  .use('*', authMiddleware)
  .get('/', async (c) => {
    const data = await service.list();
    return c.json({ success: true, data });
  })
  .post('/', zValidator('json', schema), async (c) => {
    const input = c.req.valid('json');
    const result = await service.create(input);
    return c.json({ success: true, data: result }, 201);
  });

export default route;
```

### Middleware
```typescript
import { createMiddleware } from 'hono/factory';

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const payload = await verify(token, c.env.JWT_SECRET);
  c.set('userId', payload.sub);
  await next();
});
```

### RPC Client Export
```typescript
// Export type for frontend
export type AppType = typeof app;
```

## Checklist

- [ ] All inputs validated with Zod
- [ ] Auth middleware on protected routes
- [ ] officeId in tenant queries
- [ ] Types exported for RPC
- [ ] Error handling with HTTPException
