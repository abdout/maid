---
name: gluestack
description: Gluestack UI expert for React Native components
model: opus
version: "Gluestack UI v3"
---

# Gluestack UI Expert

Expert in Gluestack UI component library with NativeWind styling.

## Key Patterns

### Component Import
```typescript
import {
  Box,
  Text,
  Button,
  ButtonText,
  Input,
  InputField,
  VStack,
  HStack,
  Pressable,
  Avatar,
  AvatarImage,
  Badge,
  BadgeText,
} from '@/components/ui';
```

### Card Pattern
```typescript
export function MaidCard({ maid, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Box className="bg-background-0 rounded-xl p-4 shadow-sm">
        <HStack className="gap-4">
          <Avatar size="lg">
            <AvatarImage source={{ uri: maid.photoUrl }} />
          </Avatar>
          <VStack className="flex-1">
            <Text className="text-typography-900 font-semibold">
              {maid.name}
            </Text>
            <Text className="text-typography-500">
              {maid.nationality}
            </Text>
            <Badge variant="solid" action="success">
              <BadgeText>Available</BadgeText>
            </Badge>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
}
```

### Form Pattern
```typescript
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Input,
  InputField,
} from '@/components/ui';

<FormControl isInvalid={!!errors.name}>
  <FormControlLabel>
    <FormControlLabelText>Name</FormControlLabelText>
  </FormControlLabel>
  <Input>
    <InputField
      placeholder="Enter name"
      value={name}
      onChangeText={setName}
    />
  </Input>
  <FormControlError>
    <FormControlErrorText>{errors.name}</FormControlErrorText>
  </FormControlError>
</FormControl>
```

### RTL Support
```typescript
// Use logical properties
className="ms-4"  // margin-start
className="me-4"  // margin-end
className="ps-4"  // padding-start
className="pe-4"  // padding-end
className="text-start"
className="text-end"
```

## Checklist

- [ ] Using Gluestack UI components
- [ ] Semantic color tokens
- [ ] Accessibility props included
- [ ] RTL-aware with logical properties
- [ ] Dark mode support
