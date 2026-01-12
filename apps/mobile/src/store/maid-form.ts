import { create } from 'zustand';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type Religion = 'muslim' | 'non_muslim' | 'christian' | 'other';
export type MaidStatus = 'available' | 'inactive';

// New types from client requirements
export type PackageType = 'traditional' | 'flexible' | 'hourly';
export type CookingSkill = 'good' | 'average' | 'willing_to_learn' | 'none';
export type Availability = 'inside_uae' | 'outside_uae';
export type Education = 'college' | 'high_school' | 'primary';
export type JobType = 'domestic_worker' | 'nurse_caregiver' | 'driver';
export type Sex = 'male' | 'female';

export interface MaidFormData {
  // Step 1: Basic Info
  name: string;
  nameAr: string;
  nationalityId: string;
  dateOfBirth: string; // YYYY-MM-DD format
  sex: Sex;
  maritalStatus: MaritalStatus;
  religion: Religion;
  hasChildren: boolean;
  education: Education;

  // Step 2: Job & Package
  jobType: JobType;
  packageType: PackageType;

  // Step 3: Experience & Skills
  experienceYears: number;
  hasExperience: boolean;
  experienceDetails: string; // 70 chars max
  skillsDetails: string; // 70 chars max
  cookingSkills: CookingSkill;
  babySitter: boolean;
  salary: string;
  officeFees: string;
  availability: Availability;

  // Step 4: Languages
  languageIds: string[];

  // Step 5: Photo
  photoUrl: string;

  // Step 6: Bio & Contact
  bio: string;
  bioAr: string;
  whatsappNumber: string;
  contactNumber: string;
  cvReference: string;

  // Step 7: Review & Publish
  status: MaidStatus;

  // Legacy field (kept for backward compatibility)
  skills: string[];
}

export const INITIAL_FORM_DATA: MaidFormData = {
  // Step 1: Basic Info
  name: '',
  nameAr: '',
  nationalityId: '',
  dateOfBirth: '',
  sex: 'female',
  maritalStatus: 'single',
  religion: 'muslim',
  hasChildren: false,
  education: 'primary',

  // Step 2: Job & Package
  jobType: 'domestic_worker',
  packageType: 'traditional',

  // Step 3: Experience & Skills
  experienceYears: 0,
  hasExperience: false,
  experienceDetails: '',
  skillsDetails: '',
  cookingSkills: 'none',
  babySitter: false,
  salary: '',
  officeFees: '',
  availability: 'inside_uae',

  // Step 4: Languages
  languageIds: [],

  // Step 5: Photo
  photoUrl: '',

  // Step 6: Bio & Contact
  bio: '',
  bioAr: '',
  whatsappNumber: '',
  contactNumber: '',
  cvReference: '',

  // Step 7: Review
  status: 'available',

  // Legacy
  skills: [],
};

export const TOTAL_STEPS = 7;

export const STEP_TITLES = {
  1: { en: 'Basic Info', ar: 'المعلومات الأساسية' },
  2: { en: 'Job & Package', ar: 'الوظيفة والباقة' },
  3: { en: 'Experience & Skills', ar: 'الخبرة والمهارات' },
  4: { en: 'Languages', ar: 'اللغات' },
  5: { en: 'Photo', ar: 'الصورة' },
  6: { en: 'Contact', ar: 'التواصل' },
  7: { en: 'Review', ar: 'المراجعة' },
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

// Package type options (client requirement)
export const PACKAGE_TYPE_OPTIONS = [
  { id: 'traditional', labelEn: 'Traditional Package', labelAr: 'الباقة التقليدية' },
  { id: 'flexible', labelEn: 'Flexible & Temp Package', labelAr: 'الباقة المرنة والمؤقتة' },
  { id: 'hourly', labelEn: 'Daily / Hourly Basis', labelAr: 'نظام الساعات والأيام' },
] as const;

// Job type options (client requirement)
export const JOB_TYPE_OPTIONS = [
  { id: 'domestic_worker', labelEn: 'Domestic Worker', labelAr: 'عاملة منزلية' },
  { id: 'nurse_caregiver', labelEn: 'Nurse / Caregiver', labelAr: 'مساعدة تمريض / ممرضة' },
  { id: 'driver', labelEn: 'Driver', labelAr: 'سائق / سائقة' },
] as const;

// Cooking skill options (client requirement)
export const COOKING_SKILL_OPTIONS = [
  { id: 'good', labelEn: 'Good', labelAr: 'جيد' },
  { id: 'average', labelEn: 'Average', labelAr: 'متوسط' },
  { id: 'willing_to_learn', labelEn: 'Willing to Learn', labelAr: 'مستعدة لتعلم الطبخ' },
  { id: 'none', labelEn: 'No', labelAr: 'لا' },
] as const;

// Education options (client requirement)
export const EDUCATION_OPTIONS = [
  { id: 'college', labelEn: 'College', labelAr: 'جامعي' },
  { id: 'high_school', labelEn: 'High School', labelAr: 'ثانوية' },
  { id: 'primary', labelEn: 'Primary', labelAr: 'ابتدائي' },
] as const;

// Availability options (client requirement)
export const AVAILABILITY_OPTIONS = [
  { id: 'inside_uae', labelEn: 'Inside UAE', labelAr: 'داخل الإمارات' },
  { id: 'outside_uae', labelEn: 'Outside UAE', labelAr: 'خارج الإمارات' },
] as const;

// Religion options (updated per client requirement)
export const RELIGION_OPTIONS = [
  { id: 'muslim', labelEn: 'Islam', labelAr: 'الإسلام' },
  { id: 'christian', labelEn: 'Christianity', labelAr: 'المسيحية' },
  { id: 'other', labelEn: 'Others', labelAr: 'أخرى' },
] as const;

// Sex options (client requirement)
export const SEX_OPTIONS = [
  { id: 'female', labelEn: 'Female', labelAr: 'أنثى' },
  { id: 'male', labelEn: 'Male', labelAr: 'ذكر' },
] as const;

// Legacy: Skills options (kept for backward compatibility)
export const SKILL_OPTIONS = [
  { id: 'cleaning', labelEn: 'Cleaning', labelAr: 'التنظيف' },
  { id: 'cooking', labelEn: 'Cooking', labelAr: 'الطبخ' },
  { id: 'babysitting', labelEn: 'Babysitting', labelAr: 'رعاية الأطفال' },
  { id: 'elderly', labelEn: 'Elderly Care', labelAr: 'رعاية المسنين' },
] as const;
