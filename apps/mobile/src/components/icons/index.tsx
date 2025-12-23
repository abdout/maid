import React from 'react';
import { useTranslation } from 'react-i18next';

// Import all icons
import HomeIcon from './home';
import SearchIcon from './search';
import HeartIcon from './heart';
import HeartFilledIcon from './heart-filled';
import UserIcon from './user';
import FilterIcon from './filter';
import PlusIcon from './plus';
import ChevronLeftIcon from './chevron-left';
import ChevronRightIcon from './chevron-right';
import CameraIcon from './camera';
import GlobeIcon from './globe';
import BuildingIcon from './building';
import FileTextIcon from './file-text';
import DashboardIcon from './dashboard';
import CheckIcon from './check';
import XIcon from './x';
import TrashIcon from './trash';
import PencilIcon from './pencil';
import SmartphoneIcon from './smartphone';
import StarIcon from './star';
import BellIcon from './bell';
import MessageIcon from './message';
import LogOutIcon from './log-out';
import UsersIcon from './users';
import LockClosedIcon from './lock-closed';
import PhoneIcon from './phone';
import EmailIcon from './email';
import MapPinIcon from './map-pin';
import CheckBadgeIcon from './check-badge';
import BriefcaseIcon from './briefcase';
import ShareIcon from './share';
import DirhamIcon from './dirham';

// Icon map for easy access
const icons = {
  home: HomeIcon,
  search: SearchIcon,
  heart: HeartIcon,
  'heart-filled': HeartFilledIcon,
  user: UserIcon,
  filter: FilterIcon,
  plus: PlusIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  camera: CameraIcon,
  globe: GlobeIcon,
  building: BuildingIcon,
  'file-text': FileTextIcon,
  dashboard: DashboardIcon,
  check: CheckIcon,
  x: XIcon,
  trash: TrashIcon,
  pencil: PencilIcon,
  smartphone: SmartphoneIcon,
  star: StarIcon,
  bell: BellIcon,
  message: MessageIcon,
  'log-out': LogOutIcon,
  users: UsersIcon,
  'lock-closed': LockClosedIcon,
  phone: PhoneIcon,
  email: EmailIcon,
  'map-pin': MapPinIcon,
  'check-badge': CheckBadgeIcon,
  briefcase: BriefcaseIcon,
  share: ShareIcon,
  dirham: DirhamIcon,
} as const;

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
}

export function Icon({
  name,
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  filled = false
}: IconProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Directional icons that should flip in RTL
  const directionalIcons = ['chevron-left', 'chevron-right', 'log-out'];
  const shouldFlip = isRTL && directionalIcons.includes(name);

  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      filled={filled}
      style={shouldFlip ? { transform: [{ scaleX: -1 }] } : undefined}
    />
  );
}

// Re-export individual icons for direct usage
export {
  HomeIcon,
  SearchIcon,
  HeartIcon,
  HeartFilledIcon,
  UserIcon,
  FilterIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CameraIcon,
  GlobeIcon,
  BuildingIcon,
  FileTextIcon,
  DashboardIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  PencilIcon,
  SmartphoneIcon,
  StarIcon,
  BellIcon,
  MessageIcon,
  LogOutIcon,
  UsersIcon,
  LockClosedIcon,
  PhoneIcon,
  EmailIcon,
  MapPinIcon,
  CheckBadgeIcon,
  BriefcaseIcon,
  ShareIcon,
  DirhamIcon,
};

export default Icon;
