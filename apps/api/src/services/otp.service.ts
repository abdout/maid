import type { Bindings } from '../types';

interface TwilioResponse {
  sid?: string;
  status?: string;
  error_code?: string;
  error_message?: string;
}

// Demo phone patterns - ONLY active in development/staging
const DEMO_PHONE_PATTERNS = [
  /^\+971555000\d{3}$/,  // UAE demo: +971555000XXX
  /^\+1555000\d{4}$/,    // US demo: +1555000XXXX
];

// E.164 phone validation pattern
const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

export class OtpService {
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;
  private environment: string;
  private readonly OTP_LENGTH = 4;

  constructor(env: Bindings) {
    this.accountSid = env.TWILIO_ACCOUNT_SID;
    this.authToken = env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = env.TWILIO_PHONE_NUMBER;
    this.environment = env.ENVIRONMENT || 'development';
  }

  /**
   * Check if phone number is a demo phone
   * Demo phones are DISABLED in production for security
   */
  isDemoPhone(phone: string): boolean {
    // Never allow demo phones in production
    if (this.environment === 'production') {
      return false;
    }

    const normalized = this.normalizePhone(phone);
    return DEMO_PHONE_PATTERNS.some(pattern => pattern.test(normalized));
  }

  /**
   * Validate phone number format
   * Returns true if valid E.164 format
   */
  isValidPhoneNumber(phone: string): boolean {
    const normalized = this.normalizePhone(phone);
    return E164_PATTERN.test(normalized);
  }

  /**
   * Generate cryptographically secure OTP code
   * Returns fixed code for demo phones (non-production only)
   */
  generateCode(phone?: string): string {
    // Demo phones get fixed code (only in development/staging)
    if (phone && this.isDemoPhone(phone)) {
      return '1234';
    }

    // Generate cryptographically secure random code
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = (array[0] % 9000) + 1000; // 4-digit code (1000-9999)
    return code.toString();
  }

  /**
   * Send OTP via SMS
   * Includes rate limiting awareness and error handling
   */
  async sendSms(
    to: string,
    code: string
  ): Promise<{ success: boolean; error?: string; isDemo?: boolean }> {
    const normalizedPhone = this.normalizePhone(to);

    // Validate phone number format
    if (!this.isValidPhoneNumber(to)) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    // Skip SMS for demo phones (non-production only)
    if (this.isDemoPhone(to)) {
      // Log masked phone in development only
      if (this.environment === 'development') {
        console.log(`[DEMO] OTP requested for ${this.maskPhone(normalizedPhone)}`);
      }
      return { success: true, isDemo: true };
    }

    // Development mode without Twilio configured
    if (!this.accountSid || this.accountSid === 'test') {
      if (this.environment === 'development') {
        console.log(`[DEV] OTP requested for ${this.maskPhone(normalizedPhone)}`);
      }
      return { success: true };
    }

    // Production SMS sending via Twilio
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    const body = new URLSearchParams({
      To: normalizedPhone,
      From: this.phoneNumber,
      Body: `Your Maid UAE verification code is: ${code}. Valid for 5 minutes. Do not share this code.`,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json() as TwilioResponse;

      if (!response.ok) {
        // Log error without sensitive data
        console.error('SMS delivery failed:', {
          status: response.status,
          errorCode: data.error_code,
          phone: this.maskPhone(normalizedPhone),
        });

        return {
          success: false,
          error: this.getTwilioErrorMessage(data.error_code),
        };
      }

      return { success: true };
    } catch (error) {
      console.error('SMS send error:', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: 'Failed to send SMS. Please try again.',
      };
    }
  }

  /**
   * Normalize phone number to E.164 format
   */
  normalizePhone(phone: string): string {
    // Remove spaces, dashes, and parentheses
    let normalized = phone.replace(/[\s\-()]/g, '');

    // Handle UAE-specific formats
    if (!normalized.startsWith('+')) {
      if (normalized.startsWith('0')) {
        // Local UAE format: 0501234567 -> +971501234567
        normalized = '+971' + normalized.slice(1);
      } else if (normalized.startsWith('971')) {
        // Missing +: 971501234567 -> +971501234567
        normalized = '+' + normalized;
      } else if (/^\d{9,10}$/.test(normalized)) {
        // Assume UAE local number without leading zero
        normalized = '+971' + normalized;
      } else {
        // Add + prefix for other formats
        normalized = '+' + normalized;
      }
    }

    return normalized;
  }

  /**
   * Mask phone number for logging (show only last 4 digits)
   */
  private maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
  }

  /**
   * Get user-friendly error message from Twilio error code
   */
  private getTwilioErrorMessage(errorCode?: string): string {
    const errorMessages: Record<string, string> = {
      '21211': 'Invalid phone number format',
      '21214': 'Phone number is not reachable',
      '21217': 'Phone number is not mobile',
      '21408': 'Permission denied for this region',
      '21610': 'Phone number is unsubscribed',
      '21614': 'Invalid destination number',
      '30003': 'Phone is unreachable',
      '30004': 'Message blocked',
      '30005': 'Unknown destination',
      '30006': 'Landline number not supported',
    };

    return errorMessages[errorCode || ''] || 'Failed to send verification code';
  }
}
