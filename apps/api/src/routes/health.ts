import { Hono } from 'hono';
import type { Bindings, Variables } from '../types';

const health = new Hono<{ Bindings: Bindings; Variables: Variables }>();

health.get('/', async (c) => {
  const checks = {
    api: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  };

  return c.json({
    success: true,
    data: checks,
  });
});

export default health;
