import { create } from 'zustand';

export interface OfficeFormData {
  // Step 1: Basic Info (required)
  name: string;
  nameAr: string;
  phone: string;
  email: string;
  scopes: ('recruitment' | 'leasing' | 'typing')[];

  // Step 2: Location & Details (optional)
  address: string;
  addressAr: string;
  emirate: string;
  googleMapsUrl: string;
  licenseNumber: string;
  licenseExpiry: string;
  website: string;
  managerPhone1: string;
  managerPhone2: string;

  // Step 3: Review & Logo
  licenseImageUrl: string;
  logoUrl: string;
}

export const INITIAL_FORM_DATA: OfficeFormData = {
  // Step 1: Basic Info
  name: '',
  nameAr: '',
  phone: '',
  email: '',
  scopes: ['recruitment'],

  // Step 2: Location & Details
  address: '',
  addressAr: '',
  emirate: '',
  googleMapsUrl: '',
  licenseNumber: '',
  licenseExpiry: '',
  website: '',
  managerPhone1: '',
  managerPhone2: '',

  // Step 3: Review & Logo
  licenseImageUrl: '',
  logoUrl: '',
};

export const TOTAL_STEPS = 3;

export const STEP_TITLES = {
  1: { en: 'Basic Info', ar: 'المعلومات الأساسية' },
  2: { en: 'Details', ar: 'التفاصيل' },
  3: { en: 'Review', ar: 'المراجعة' },
};

// UAE Emirates options
export const EMIRATE_OPTIONS = [
  { id: 'abu_dhabi', labelEn: 'Abu Dhabi', labelAr: 'أبوظبي' },
  { id: 'dubai', labelEn: 'Dubai', labelAr: 'دبي' },
  { id: 'sharjah', labelEn: 'Sharjah', labelAr: 'الشارقة' },
  { id: 'ajman', labelEn: 'Ajman', labelAr: 'عجمان' },
  { id: 'ras_al_khaimah', labelEn: 'Ras Al Khaimah', labelAr: 'رأس الخيمة' },
  { id: 'fujairah', labelEn: 'Fujairah', labelAr: 'الفجيرة' },
  { id: 'umm_al_quwain', labelEn: 'Umm Al Quwain', labelAr: 'أم القيوين' },
] as const;

// Office scope options (service types)
export const OFFICE_SCOPE_OPTIONS = [
  { id: 'recruitment' as const, labelEn: 'Recruitment', labelAr: 'استقدام', descEn: 'Bring workers from abroad', descAr: 'استقدام عمالة من الخارج' },
  { id: 'leasing' as const, labelEn: 'Leasing', labelAr: 'تأجير', descEn: 'Workers available locally', descAr: 'عمالة متوفرة محلياً' },
  { id: 'typing' as const, labelEn: 'Typing Office', labelAr: 'طباعة', descEn: 'Document processing & visa paperwork', descAr: 'معاملات وطباعة' },
] as const;

// Validation rules
export const validateStep = (step: number, data: OfficeFormData, isRTL: boolean): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!data.name.trim()) {
      errors.name = isRTL ? 'اسم المكتب مطلوب' : 'Office name is required';
    }
    if (!data.phone.trim()) {
      errors.phone = isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (!/^[\d+\-\s()]+$/.test(data.phone)) {
      errors.phone = isRTL ? 'رقم هاتف غير صالح' : 'Invalid phone number';
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = isRTL ? 'بريد إلكتروني غير صالح' : 'Invalid email address';
    }
    if (!data.scopes || data.scopes.length === 0) {
      errors.scopes = isRTL ? 'اختر نوع خدمة واحد على الأقل' : 'Select at least one service type';
    }
  }

  if (step === 2) {
    if (data.licenseExpiry && !/^\d{4}-\d{2}-\d{2}$/.test(data.licenseExpiry)) {
      errors.licenseExpiry = isRTL ? 'صيغة التاريخ غير صحيحة (YYYY-MM-DD)' : 'Invalid date format (YYYY-MM-DD)';
    }
    if (data.website && !data.website.match(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+/)) {
      errors.website = isRTL ? 'رابط غير صالح' : 'Invalid website URL';
    }
  }

  return errors;
};

interface OfficeFormState {
  // State
  currentStep: number;
  formData: OfficeFormData;
  errors: Record<string, string>;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OfficeFormData>) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  reset: () => void;
  getStepProgress: () => number;
}

export const useOfficeForm = create<OfficeFormState>((set, get) => ({
  // Initial state
  currentStep: 1,
  formData: { ...INITIAL_FORM_DATA },
  errors: {},

  // Actions
  setStep: (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      set({ currentStep: step, errors: {} });
    }
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < TOTAL_STEPS) {
      set({ currentStep: currentStep + 1, errors: {} });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1, errors: {} });
    }
  },

  updateFormData: (data: Partial<OfficeFormData>) => {
    const { errors } = get();
    // Clear errors for updated fields
    const updatedErrors = { ...errors };
    Object.keys(data).forEach(key => {
      delete updatedErrors[key];
    });
    set((state) => ({
      formData: { ...state.formData, ...data },
      errors: updatedErrors,
    }));
  },

  setErrors: (errors: Record<string, string>) => {
    set({ errors });
  },

  clearErrors: () => {
    set({ errors: {} });
  },

  clearFieldError: (field: string) => {
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      return { errors: newErrors };
    });
  },

  reset: () => {
    set({
      currentStep: 1,
      formData: { ...INITIAL_FORM_DATA },
      errors: {},
    });
  },

  getStepProgress: () => {
    const { currentStep } = get();
    return (currentStep / TOTAL_STEPS) * 100;
  },
}));
