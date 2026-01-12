// Tabby Payment Integration Service
// Tabby is a Buy Now Pay Later (BNPL) service popular in the UAE

export interface TabbyConfig {
  publicKey: string;
  secretKey: string;
  merchantCode: string;
}

export interface TabbyBuyer {
  phone: string;
  email?: string;
  name?: string;
  dob?: string; // YYYY-MM-DD
}

export interface TabbyOrder {
  referenceId: string;
  items: TabbyOrderItem[];
  shippingAmount: string;
  taxAmount: string;
  discount: string;
}

export interface TabbyOrderItem {
  title: string;
  description?: string;
  quantity: number;
  unitPrice: string;
  category: string;
  referenceId?: string;
  imageUrl?: string;
}

export interface CreateCheckoutParams {
  amount: string;
  currency: string;
  buyer: TabbyBuyer;
  order: TabbyOrder;
  description?: string;
  merchantUrls: {
    success: string;
    cancel: string;
    failure: string;
  };
  metadata?: Record<string, string>;
}

export interface TabbyCheckoutSession {
  id: string;
  status: 'created' | 'approved' | 'rejected' | 'expired';
  payment: {
    id: string;
    amount: string;
    currency: string;
    status: string;
  };
  configuration: {
    availableProducts: {
      installments: Array<{
        webUrl: string;
        installments: Array<{
          amount: string;
          dueDate: string;
        }>;
      }>;
    };
  };
}

export interface TabbyPayment {
  id: string;
  status: 'authorized' | 'captured' | 'closed' | 'rejected' | 'expired';
  amount: string;
  currency: string;
  createdAt: string;
  capturedAt?: string;
  closedAt?: string;
  buyer: TabbyBuyer;
  order: TabbyOrder;
}

export interface TabbyWebhookEvent {
  id: string;
  type: 'payment.authorized' | 'payment.captured' | 'payment.closed' | 'payment.rejected' | 'payment.expired';
  createdAt: string;
  data: {
    id: string;
    status: string;
    amount: string;
    currency: string;
  };
}

export class TabbyService {
  private baseUrl = 'https://api.tabby.ai/api/v2';
  private secretKey: string;
  private publicKey: string;
  private merchantCode: string;

  constructor(config: TabbyConfig) {
    this.secretKey = config.secretKey;
    this.publicKey = config.publicKey;
    this.merchantCode = config.merchantCode;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.secretKey}`,
        ...options.headers,
      },
    });

    const data = await response.json() as T & { error?: { message?: string } };

    if (!response.ok) {
      console.error('Tabby API error:', data);
      throw new Error(data.error?.message || 'Tabby API error');
    }

    return data as T;
  }

  // Create a checkout session
  async createCheckout(params: CreateCheckoutParams): Promise<TabbyCheckoutSession> {
    const payload = {
      payment: {
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        buyer: {
          phone: params.buyer.phone,
          email: params.buyer.email,
          name: params.buyer.name,
          dob: params.buyer.dob,
        },
        order: {
          reference_id: params.order.referenceId,
          items: params.order.items.map((item) => ({
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            category: item.category,
            reference_id: item.referenceId,
            image_url: item.imageUrl,
          })),
          shipping_amount: params.order.shippingAmount,
          tax_amount: params.order.taxAmount,
          discount: params.order.discount,
        },
      },
      merchant_code: this.merchantCode,
      merchant_urls: {
        success: params.merchantUrls.success,
        cancel: params.merchantUrls.cancel,
        failure: params.merchantUrls.failure,
      },
      lang: 'en', // or 'ar'
      meta: params.metadata,
    };

    return this.request<TabbyCheckoutSession>('/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get payment details
  async getPayment(paymentId: string): Promise<TabbyPayment> {
    return this.request<TabbyPayment>(`/payments/${paymentId}`);
  }

  // Capture a payment (convert authorized to captured)
  async capturePayment(paymentId: string, amount?: string): Promise<TabbyPayment> {
    const payload = amount ? { amount } : {};

    return this.request<TabbyPayment>(`/payments/${paymentId}/captures`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Refund a payment
  async refundPayment(paymentId: string, amount: string, reason?: string): Promise<{ id: string; amount: string }> {
    return this.request<{ id: string; amount: string }>(`/payments/${paymentId}/refunds`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  // Close a payment (cancel an authorized payment)
  async closePayment(paymentId: string): Promise<TabbyPayment> {
    return this.request<TabbyPayment>(`/payments/${paymentId}/close`, {
      method: 'POST',
    });
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string, webhookSecret: string): boolean {
    // Tabby uses HMAC-SHA256 for webhook signatures
    // Note: In production, you would compute HMAC and compare
    // For now, we'll do basic validation
    if (!signature || !webhookSecret) {
      return false;
    }

    try {
      // In a real implementation, compute HMAC-SHA256 of payload with webhookSecret
      // and compare with the provided signature
      // For Cloudflare Workers, you'd use crypto.subtle
      return true; // Placeholder - implement proper HMAC verification
    } catch {
      return false;
    }
  }

  // Parse webhook event
  parseWebhookEvent(payload: string): TabbyWebhookEvent {
    return JSON.parse(payload) as TabbyWebhookEvent;
  }

  // Get checkout URL from session
  getCheckoutUrl(session: TabbyCheckoutSession): string | null {
    const installments = session.configuration?.availableProducts?.installments;
    if (installments && installments.length > 0) {
      return installments[0].webUrl;
    }
    return null;
  }

  // Format amount for Tabby (needs to be string with 2 decimal places)
  static formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  // Parse amount from Tabby (string to number)
  static parseAmount(amount: string): number {
    return parseFloat(amount);
  }
}
