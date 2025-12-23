import type { Bindings } from '../types';

interface TwilioResponse {
  sid?: string;
  status?: string;
  error_code?: string;
  error_message?: string;
}

// Demo phone patterns for testing without real SMS
const DEMO_PHONE_PATTERNS = [
  /^\+971555000\d{3}$/,  // UAE demo: +971555000XXX
  /^\+1555000\d{4}$/,    // US demo: +1555000XXXX
  /^demo/i,              // Any phone starting with "demo"
];

// Fixed OTP code for demo phones (4 digits)
const DEV_OTP_CODE = '1234';

export class OtpService {
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;

  constructor(env: Bindings) {
    this.accountSid = env.TWILIO_ACCOUNT_SID;
    this.authToken = env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = env.TWILIO_PHONE_NUMBER;
  }

  // Check if phone number is a demo phone
  isDemoPhone(phone: string): boolean {
    const normalized = this.normalizePhone(phone);
    return DEMO_PHONE_PATTERNS.some(pattern => pattern.test(normalized));
  }

  // Generate OTP code - fixed for demo phones, random for real phones
  generateCode(phone?: string): string {
    if (phone && this.isDemoPhone(phone)) {
      return DEV_OTP_CODE;
    }
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async sendSms(to: string, code: string): Promise<{ success: boolean; error?: string; isDemo?: boolean }> {
    // Normalize phone number
    const normalizedPhone = this.normalizePhone(to);

    // Skip SMS for demo phones - they use fixed code
    if (this.isDemoPhone(to)) {
      console.log(`[DEMO] OTP for ${normalizedPhone}: ${code}`);
      return { success: true, isDemo: true };
    }

    // In development, log the code instead of sending
    if (!this.accountSid || this.accountSid === 'test') {
      console.log(`[DEV] OTP for ${normalizedPhone}: ${code}`);
      return { success: true };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    const body = new URLSearchParams({
      To: normalizedPhone,
      From: this.phoneNumber,
      Body: `Your Maid UAE verification code is: ${code}. Valid for 5 minutes.`,
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
        console.error('Twilio error:', data);
        return {
          success: false,
          error: data.error_message || 'Failed to send SMS',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        error: 'Failed to send SMS',
      };
    }
  }

  private normalizePhone(phone: string): string {
    // Remove spaces and dashes
    let normalized = phone.replace(/[\s-]/g, '');

    // Add + if missing
    if (!normalized.startsWith('+')) {
      // Assume UAE if no country code
      if (normalized.startsWith('0')) {
        normalized = '+971' + normalized.slice(1);
      } else if (normalized.startsWith('971')) {
        normalized = '+' + normalized;
      } else {
        normalized = '+' + normalized;
      }
    }

    return normalized;
  }
}
