import { Hono } from 'hono';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { LookupService } from '../services/lookup.service';

const lookupsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get all nationalities
lookupsRoute.get('/nationalities', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const lookupService = new LookupService(db);

    const nationalities = await lookupService.getAllNationalities();

    return c.json({ success: true, data: nationalities });
  } catch (error) {
    console.error('Get nationalities error:', error);
    return c.json({ success: false, error: 'Failed to get nationalities' }, 500);
  }
});

// Get all languages
lookupsRoute.get('/languages', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const lookupService = new LookupService(db);

    const languages = await lookupService.getAllLanguages();

    return c.json({ success: true, data: languages });
  } catch (error) {
    console.error('Get languages error:', error);
    return c.json({ success: false, error: 'Failed to get languages' }, 500);
  }
});

// Seed defaults (protected, for initial setup)
lookupsRoute.post('/seed', async (c) => {
  // Only allow in development
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ success: false, error: 'Not allowed in production' }, 403);
  }

  try {
    const db = createDb(c.env.DATABASE_URL);
    const lookupService = new LookupService(db);

    await lookupService.seedDefaults();

    return c.json({ success: true, message: 'Seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return c.json({ success: false, error: 'Failed to seed data' }, 500);
  }
});

export default lookupsRoute;
