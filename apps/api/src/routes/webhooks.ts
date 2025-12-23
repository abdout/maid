import { Hono } from 'hono';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { PaymentService } from '../services/payment.service';
import { StripeService } from '../services/stripe.service';

const webhooksRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Stripe webhook handler
webhooksRoute.post('/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');

  if (!signature) {
    return c.json({ error: 'Missing stripe-signature header' }, 400);
  }

  if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: 'Stripe not configured' }, 500);
  }

  try {
    const rawBody = await c.req.text();

    const stripeService = new StripeService({
      secretKey: c.env.STRIPE_SECRET_KEY,
      webhookSecret: c.env.STRIPE_WEBHOOK_SECRET,
      publishableKey: c.env.STRIPE_PUBLISHABLE_KEY || '',
    });

    // Verify and construct the event
    const event = stripeService.constructWebhookEvent(rawBody, signature);

    const db = createDb(c.env.DATABASE_URL);
    const paymentService = new PaymentService(db, stripeService);

    // Process the webhook event
    await paymentService.processStripeWebhook(event as {
      type: string;
      data: {
        object: {
          id: string;
          metadata?: Record<string, string>;
          status?: string;
          last_payment_error?: { message?: string };
        };
      };
    });

    return c.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    return c.json({ error: message }, 400);
  }
});

// Tabby webhook handler (placeholder for future implementation)
webhooksRoute.post('/tabby', async (c) => {
  // TODO: Implement Tabby webhook handling
  const body = await c.req.json();
  console.log('Tabby webhook received:', body);

  return c.json({ received: true });
});

export default webhooksRoute;
