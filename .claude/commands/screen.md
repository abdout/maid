# Generate Expo Screen

Generate a new Expo Router screen.

## Usage
`/screen maids` - Create maids listing screen
`/screen maid/[id]` - Create dynamic maid detail

## Argument: $ARGUMENTS

## Instructions

1. Parse screen path from arguments
2. Create at `apps/mobile/app/{path}.tsx`
3. Add layout if needed

## Template

```typescript
import { Stack } from 'expo-router';
import { Box, Text } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function {Name}Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Stack.Screen options={{ title: 'Title' }} />
      <Box className="flex-1 p-4">
        {/* Content */}
      </Box>
    </SafeAreaView>
  );
}
```

## Requirements

- Use Expo Router conventions
- Include Stack.Screen options
- Handle loading/error states
- Apply safe area
