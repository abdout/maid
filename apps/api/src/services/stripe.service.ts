import Stripe from 'stripe';

// Note: Stripe SDK will be added via npm, for now this is a type-safe interface
// Run: npm install stripe

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
}

export interface CreatePaymentIntentParams {
  amount: number; // in fils (1 AED = 100 fils)
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
  idempotencyKey?: string;
}

export interface CreateCheckoutSessionParams {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2025-12-15.clover',
    });
    this.webhookSecret = config.webhookSecret;
  }

  // Customer Management
  async getOrCreateCustomer(params: {
    userId: string;
    email?: string;
    phone?: string;
    name?: string;
  }): Promise<Stripe.Customer> {
    // Search for existing customer by metadata
    const existing = await this.stripe.customers.search({
      query: `metadata['userId']:'${params.userId}'`,
      limit: 1,
    });

    if (existing.data.length > 0) {
      return existing.data[0];
    }

    // Create new customer
    return this.stripe.customers.create({
      email: params.email,
      phone: params.phone,
      name: params.name,
      metadata: {
        userId: params.userId,
      },
    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) return null;
      return customer as Stripe.Customer;
    } catch {
      return null;
    }
  }

  // Customer Sessions (for secure mobile payment sheet)
  async createCustomerSession(customerId: string): Promise<Stripe.CustomerSession> {
    return this.stripe.customerSessions.create({
      customer: customerId,
      components: {
        mobile_payment_element: {
          enabled: true,
          features: {
            payment_method_save: 'enabled',
            payment_method_redisplay: 'enabled',
            payment_method_remove: 'enabled',
          },
        },
      },
    });
  }

  // Payment Intents (for CV unlock one-time payments)
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    const options: Stripe.PaymentIntentCreateParams = {
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      metadata: params.metadata,
      description: params.description,
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Use idempotency key to prevent duplicate charges
    const requestOptions = params.idempotencyKey
      ? { idempotencyKey: params.idempotencyKey }
      : undefined;

    return this.stripe.paymentIntents.create(options, requestOptions);
  }

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  // Subscriptions (for office subscriptions)
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: 'subscription',
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });
  }

  async createSubscription(params: {
    customerId: string;
    priceId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      return this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    return this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  // Webhook handling
  constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }

  // Payment Methods
  async listPaymentMethods(customerId: string, type: Stripe.PaymentMethodListParams.Type = 'card'): Promise<Stripe.PaymentMethod[]> {
    const methods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type,
    });
    return methods.data;
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.detach(paymentMethodId);
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.Customer> {
    return this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }
}
