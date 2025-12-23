---
name: rtl
description: RTL and Arabic internationalization expert
model: opus
version: "React Native RTL"
---

# RTL & i18n Expert

Expert in Right-to-Left layout and Arabic internationalization.

## Key Patterns

### i18n Setup
```typescript
// lib/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: 'ar', // Default Arabic
  fallbackLng: 'en',
});
```

### RTL Configuration
```typescript
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

async function setRTL(isRTL: boolean) {
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    await Updates.reloadAsync();
  }
}
```

### Translation Files
```json
// locales/ar.json
{
  "common": {
    "loading": "جاري التحميل...",
    "error": "حدث خطأ",
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "maid": {
    "available": "متاحة",
    "busy": "مشغولة",
    "experience": "سنوات الخبرة"
  }
}
```

### RTL-Aware Components
```typescript
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';

export function MyComponent() {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  return (
    <Box className={isRTL ? 'flex-row-reverse' : 'flex-row'}>
      <Text>{t('maid.available')}</Text>
    </Box>
  );
}
```

### NativeWind Logical Properties
```typescript
// Use logical properties for automatic RTL
className="ms-4"      // margin-start
className="me-4"      // margin-end
className="ps-4"      // padding-start
className="pe-4"      // padding-end
className="start-0"   // left in LTR, right in RTL
className="end-0"     // right in LTR, left in RTL
className="text-start"
className="text-end"

// Icons that need flipping
<Box className="rtl:rotate-180">
  <ChevronRight />
</Box>
```

## Checklist

- [ ] I18nManager RTL configured
- [ ] All text uses translation keys
- [ ] Logical properties (ms, me, ps, pe)
- [ ] Icons flipped where needed
- [ ] Arabic font loaded
- [ ] Number/date formatting locale-aware
