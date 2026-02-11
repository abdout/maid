import { create } from 'zustand';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type Religion = 'muslim' | 'non_muslim' | 'christian' | 'other';
export type MaidStatus = 'available' | 'inactive';

// New types from client requirements
export type PackageType = 'traditional' | 'flexible' | 'hourly';
export type CookingSkill = 'good' | 'average' | 'willing_to_learn' | 'none';
// Legacy availability type (keeping for backward compatibility)
export type Availability = 'inside_uae' | 'outside_uae';
export type Education = 'college' | 'high_school' | 'primary';
// Service type replaces jobType - matches filter modal categories
export type ServiceType = 'cleaning' | 'cooking' | 'babysitter' | 'elderly';
// Legacy jobType kept for backward compatibility
export type JobType = 'domestic_worker' | 'nurse_caregiver' | 'driver';
export type Sex = 'male' | 'female';

export interface MaidFormData {
  // Phase 1: Personal Info
  // Step 1: Name & Nationality
  name: string;
  nameAr: string;
  nationalityId: string;
  // Step 2: Personal Details
  sex: Sex;
  dateOfBirth: string; // YYYY-MM-DD format
  maritalStatus: MaritalStatus;
  hasChildren: boolean;
  // Step 3: Background
  education: Education;
  religion: Religion;

  // Phase 2: Work Info
  // Step 4: Service Type (replaces jobType)
  serviceType: ServiceType;
  // Step 5: Package
  packageType: PackageType;
  // Step 6: Experience
  hasExperience: boolean;
  experienceYears: number;
  experienceDetails: string; // 70 chars max
  // Step 7: Skills & Salary
  skillsDetails: string; // 70 chars max
  cookingSkills: CookingSkill;
  babySitter: boolean;
  salary: string;
  officeFees: string;
  availability: Availability;

  // Phase 3: Documents
  // Step 8: Languages
  languageIds: string[];
  // Step 9: Photo
  photoUrl: string;
  // Step 10: Contact & Review
  whatsappNumber: string;
  contactNumber: string;
  cvReference: string;
  bio: string;
  bioAr: string;
  status: MaidStatus;

  // Legacy fields (kept for backward compatibility)
  jobType: JobType;
  skills: string[];
}

export const INITIAL_FORM_DATA: MaidFormData = {
  // Phase 1: Personal Info
  // Step 1: Name & Nationality
  name: '',
  nameAr: '',
  nationalityId: '',
  // Step 2: Personal Details
  sex: 'female',
  dateOfBirth: '',
  maritalStatus: 'single',
  hasChildren: false,
  // Step 3: Background
  education: 'primary',
  religion: 'muslim',

  // Phase 2: Work Info
  // Step 4: Service Type
  serviceType: 'cleaning',
  // Step 5: Package
  packageType: 'traditional',
  // Step 6: Experience
  hasExperience: false,
  experienceYears: 0,
  experienceDetails: '',
  // Step 7: Skills & Salary
  skillsDetails: '',
  cookingSkills: 'none',
  babySitter: false,
  salary: '',
  officeFees: '',
  availability: 'inside_uae',

  // Phase 3: Documents
  // Step 8: Languages
  languageIds: [],
  // Step 9: Photo
  photoUrl: '',
  // Step 10: Contact & Review
  whatsappNumber: '',
  contactNumber: '',
  cvReference: '',
  bio: '',
  bioAr: '',
  status: 'available',

  // Legacy fields
  jobType: 'domestic_worker',
  skills: [],
};

export const TOTAL_STEPS = 10;

export const STEP_TITLES = {
  // Phase 1: Personal Info (Steps 1-3)
  1: { en: 'Name & Nationality', ar: 'الاسم والجنسية', descEn: 'Basic identification details', descAr: 'بيانات التعريف الأساسية' },
  2: { en: 'Personal Details', ar: 'البيانات الشخصية', descEn: 'Age, gender and family status', descAr: 'العمر والجنس والحالة العائلية' },
  3: { en: 'Background', ar: 'الخلفية', descEn: 'Education and religion', descAr: 'التعليم والدين' },
  // Phase 2: Work Info (Steps 4-7)
  4: { en: 'Service Type', ar: 'نوع الخدمة', descEn: 'Primary work category', descAr: 'فئة العمل الرئيسية' },
  5: { en: 'Package', ar: 'الباقة', descEn: 'Employment arrangement', descAr: 'ترتيب التوظيف' },
  6: { en: 'Experience & Salary', ar: 'الخبرة والراتب', descEn: 'Work history and compensation', descAr: 'تاريخ العمل والراتب' },
  7: { en: 'Skills', ar: 'المهارات', descEn: 'Skill levels for each service', descAr: 'مستويات المهارة لكل خدمة' },
  // Phase 3: Documents (Steps 8-10)
  8: { en: 'Languages', ar: 'اللغات', descEn: 'Languages spoken', descAr: 'اللغات المتحدثة' },
  9: { en: 'Photo', ar: 'الصورة', descEn: 'Upload a clear profile photo', descAr: 'رفع صورة شخصية واضحة' },
  10: { en: 'Contact & Review', ar: 'التواصل والمراجعة', descEn: 'Contact info and final review', descAr: 'معلومات الاتصال والمراجعة النهائية' },
};

// Per-step validation for 10-step flow
export const validateStep = (step: number, data: MaidFormData, isRTL: boolean): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Phase 1: Personal Info
  if (step === 1) {
    // Name & Nationality - required fields (English only)
    if (!data.name.trim()) {
      errors.name = isRTL ? 'الاسم مطلوب' : 'Name is required';
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.name.trim())) {
      errors.name = isRTL ? 'الاسم يجب أن يكون بالإنجليزية فقط' : 'Name must be in English only';
    }
    if (!data.nationalityId) {
      errors.nationalityId = isRTL ? 'الجنسية مطلوبة' : 'Nationality is required';
    }
  }

  if (step === 2) {
    // Date of birth validation - if provided, must be valid and age 21-50
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      if (isNaN(dob.getTime())) {
        errors.dateOfBirth = isRTL ? 'تاريخ الميلاد غير صحيح' : 'Invalid date of birth';
      } else {
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 21 || age > 50) {
          errors.dateOfBirth = isRTL ? 'العمر يجب أن يكون بين 21 و 50' : 'Age must be between 21 and 50';
        }
      }
    }
  }

  // Step 3: Background - no required fields (education and religion are optional)

  // Phase 2: Work Info
  if (step === 4) {
    // Service Type - required
    if (!data.serviceType) {
      errors.serviceType = isRTL ? 'نوع الخدمة مطلوب' : 'Service type is required';
    }
  }

  if (step === 5) {
    // Package - required
    if (!data.packageType) {
      errors.packageType = isRTL ? 'نوع الباقة مطلوب' : 'Package type is required';
    }
  }

  if (step === 6) {
    // Experience & Salary - salary is required (moved from step 7)
    if (!data.salary || parseFloat(data.salary) <= 0) {
      errors.salary = isRTL ? 'الراتب مطلوب' : 'Salary is required';
    }
    // Optional: salary range validation (500-10000)
    const salaryNum = parseFloat(data.salary);
    if (salaryNum > 0 && (salaryNum < 500 || salaryNum > 10000)) {
      errors.salary = isRTL ? 'الراتب يجب أن يكون بين 500 و 10,000' : 'Salary must be between 500 and 10,000';
    }
  }

  // Step 7: Skills - no required fields (removed salary validation)

  // Phase 3: Documents
  if (step === 9) {
    // Photo - required
    if (!data.photoUrl) {
      errors.photoUrl = isRTL ? 'الصورة مطلوبة' : 'Photo is required';
    }
  }

  if (step === 10) {
    // Contact - required
    if (!data.whatsappNumber) {
      errors.whatsappNumber = isRTL ? 'رقم الواتساب مطلوب' : 'WhatsApp number is required';
    }
    if (!data.contactNumber) {
      errors.contactNumber = isRTL ? 'رقم التواصل مطلوب' : 'Contact number is required';
    }
  }

  return errors;
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
  clearFieldError: (field: string) => void;
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

// Service type options with icon images (matching filter modal)
export const SERVICE_TYPE_OPTIONS = [
  { id: 'cleaning' as const, labelEn: 'Cleaning', labelAr: 'تنظيف', image: 'wipe' },
  { id: 'cooking' as const, labelEn: 'Cooking', labelAr: 'طبخ', image: 'chef-hat' },
  { id: 'babysitter' as const, labelEn: 'Babysitter', labelAr: 'مربية', image: 'baby-stroller' },
  { id: 'elderly' as const, labelEn: 'Elderly', labelAr: 'مسنين', image: 'old-people' },
] as const;
