import { ImageSourcePropType } from 'react-native';

export type OnboardingServiceType =
  | 'maids'
  | 'typing_office'
  | 'visa_transfer'
  | 'office_registration';

export type ServiceFlow = 'customer' | 'office';

export interface OnboardingService {
  id: OnboardingServiceType;
  icon: ImageSourcePropType;
  flow: ServiceFlow;
  titleAr: string;
  titleEn: string;
}

export const ONBOARDING_SERVICES: OnboardingService[] = [
  { id: 'maids', icon: require('../../assets/images/icons/housekeeper.png'), flow: 'customer', titleAr: 'عاملة منزلية', titleEn: 'Domestic Worker' },
  { id: 'typing_office', icon: require('../../assets/images/icons/printer.png'), flow: 'customer', titleAr: 'مكتب طباعة', titleEn: 'Typing Office' },
  { id: 'visa_transfer', icon: require('../../assets/images/icons/passport.png'), flow: 'customer', titleAr: 'نقل إقامة', titleEn: 'Visa Transfer' },
  { id: 'office_registration', icon: require('../../assets/images/icons/swivel-chair.png'), flow: 'office', titleAr: 'تسجيل مكتب', titleEn: 'Register Office' },
];
