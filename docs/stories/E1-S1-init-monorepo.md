# Story: E1-S1 Initialize Monorepo

## Description

As a **developer**, I want a properly configured monorepo so that I can work on API and mobile apps in one codebase.

## Acceptance Criteria

- [ ] Root package.json with pnpm workspaces configured
- [ ] `apps/api` directory with Hono project
- [ ] `apps/mobile` directory with Expo project
- [ ] `packages/shared` for shared types
- [ ] `pnpm dev` runs both API and mobile
- [ ] TypeScript configured for all workspaces
- [ ] ESLint and Prettier configured

## Technical Notes

### Directory Structure
```
maid/
├── apps/
│   ├── api/
│   └── mobile/
├── packages/
│   └── shared/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

### Root package.json
```json
{
  "name": "maid",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.7.0"
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## Dependencies

- None (first story)

## Blocks

- E1-S2, E1-S3, E1-S4

## Estimates

- **Points**: 2
- **Priority**: P0
- **Sprint**: 1
