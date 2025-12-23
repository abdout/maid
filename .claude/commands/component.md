# Generate Gluestack Component

Generate a new Gluestack UI component.

## Usage
`/component MaidCard` - Create MaidCard component

## Argument: $ARGUMENTS

## Instructions

1. Parse component name from arguments
2. Determine type (Card, Form, List, Modal, etc.)
3. Create at `apps/mobile/src/components/{category}/{name}.tsx`

## Template

```typescript
import { Box, Text } from '@/components/ui';

interface {Name}Props {
  // Define props
}

export function {Name}({ ...props }: {Name}Props) {
  return (
    <Box className="...">
      {/* Content */}
    </Box>
  );
}
```

## Requirements

- Use Gluestack UI components
- Include TypeScript interface
- Support RTL with logical properties
- Add accessibility props
