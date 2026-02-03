/**
 * Wheel Picker Types
 * Apple-style scrollable date picker for iOS, Android, and Web
 */

export interface WheelColumnItem {
  value: number | string;
  label: string;
}

export interface WheelColumnProps {
  items: WheelColumnItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  itemHeight?: number;
  visibleItems?: number;
  testID?: string;
}

export interface WheelDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  locale?: string;
}

export interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
  title?: string;
  cancelText?: string;
  confirmText?: string;
  ageDisplay?: { age: number; valid: boolean } | null;
}

// Month names for localization
export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Default item height for consistent snap behavior
export const ITEM_HEIGHT = 44;
export const VISIBLE_ITEMS = 5;
