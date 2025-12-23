---
name: expo
description: Expo and React Native expert for mobile development
model: opus
version: "Expo SDK 54+"
---

# Expo Mobile Expert

Expert in Expo Router, React Native, and mobile development patterns.

## Key Patterns

### Screen Structure
```typescript
// app/(customer)/(tabs)/search.tsx
import { Stack } from 'expo-router';
import { Box, Text } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Stack.Screen options={{ title: 'Search' }} />
      <Box className="flex-1 p-4">
        {/* Content */}
      </Box>
    </SafeAreaView>
  );
}
```

### Tab Layout
```typescript
// app/(customer)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Search, Heart, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
```

### Navigation
```typescript
import { useRouter, Link } from 'expo-router';

const router = useRouter();
router.push('/maid/123');
router.back();

<Link href="/maid/123" asChild>
  <Pressable>{/* ... */}</Pressable>
</Link>
```

## Checklist

- [ ] Expo Router file-based routing
- [ ] Stack.Screen options configured
- [ ] Loading/error states handled
- [ ] Safe area applied
- [ ] RTL support implemented
