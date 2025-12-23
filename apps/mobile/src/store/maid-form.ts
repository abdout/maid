import { create } from 'zustand';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type Religion = 'muslim' | 'non_muslim';
export type MaidStatus = 'available' | 'inactive';

export interface MaidFormData {
  // Step 1: Basic Info
  name: string;
  nameAr: string;
  nationalityId: string;
  dateOfBirth: string; // YYYY-MM-DD format
  maritalStatus: MaritalStatus;
  religion: Religion;

  // Step 2: Experience & Salary
  experienceYears: number;
  salary: string;
  skills: string[];

  // Step 3: Languages
  languageIds: string[];

  // Step 4: Documents & Photos
  photoUrl: string;
  additionalPhotos: string[];
  passportUrl: string;

  // Step 5: Review & Publish
  bio: string;
  bioAr: string;
  status: MaidStatus;
}

export const INITIAL_FORM_DATA: MaidFormData = {
  // Step 1
  name: '',
  nameAr: '',
  nationalityId: '',
  dateOfBirth: '',
  maritalStatus: 'single',
  religion: 'muslim',

  // Step 2
  experienceYears: 0,
  salary: '',
  skills: [],

  // Step 3
  languageIds: [],

  // Step 4
  photoUrl: '',
  additionalPhotos: [],
  passportUrl: '',

  // Step 5
  bio: '',
  bioAr: '',
  status: 'available',
};

export const TOTAL_STEPS = 5;

export const STEP_TITLES = {
  1: { en: 'Basic Info', ar: 'المعلومات الأساسية' },
  2: { en: 'Experience', ar: 'الخبرة' },
  3: { en: 'Languages', ar: 'اللغات' },
  4: { en: 'Documents', ar: 'المستندات' },
  5: { en: 'Review', ar: 'المراجعة' },
};

interface MaidFormState {
  // State
  currentStep: number;
  formData: MaidFormData;
  isEditing: boolean;
  editingMaidId: string | null;
  errors: Record<string, string>;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<MaidFormData>) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  reset: () => void;
  initializeForEdit: (maidId: string, data: Partial<MaidFormData>) => void;
  getStepProgress: () => number;
}

export const useMaidForm = create<MaidFormState>((set, get) => ({
  // Initial state
  currentStep: 1,
  formData: { ...INITIAL_FORM_DATA },
  isEditing: false,
  editingMaidId: null,
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

  updateFormData: (data: Partial<MaidFormData>) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  setErrors: (errors: Record<string, string>) => {
    set({ errors });
  },

  clearErrors: () => {
    set({ errors: {} });
  },

  reset: () => {
    set({
      currentStep: 1,
      formData: { ...INITIAL_FORM_DATA },
      isEditing: false,
      editingMaidId: null,
      errors: {},
    });
  },

  initializeForEdit: (maidId: string, data: Partial<MaidFormData>) => {
    set({
      currentStep: 1,
      formData: { ...INITIAL_FORM_DATA, ...data },
      isEditing: true,
      editingMaidId: maidId,
      errors: {},
    });
  },

  getStepProgress: () => {
    const { currentStep } = get();
    return (currentStep / TOTAL_STEPS) * 100;
  },
}));

// Skills options
export const SKILL_OPTIONS = [
  { id: 'cleaning', labelEn: 'Cleaning', labelAr: 'التنظيف' },
  { id: 'cooking', labelEn: 'Cooking', labelAr: 'الطبخ' },
  { id: 'childcare', labelEn: 'Childcare', labelAr: 'رعاية الأطفال' },
  { id: 'elderly_care', labelEn: 'Elderly Care', labelAr: 'رعاية المسنين' },
  { id: 'laundry', labelEn: 'Laundry', labelAr: 'الغسيل' },
  { id: 'ironing', labelEn: 'Ironing', labelAr: 'الكي' },
] as const;
