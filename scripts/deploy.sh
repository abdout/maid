#!/bin/bash

# Maid Platform Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}

echo "🚀 Deploying to $ENVIRONMENT..."

# Check for required tools
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required but not installed."; exit 1; }
command -v wrangler >/dev/null 2>&1 || { echo "wrangler is required but not installed."; exit 1; }

# Build all packages
echo "📦 Building packages..."
pnpm build

# Run type checks
echo "🔍 Running type checks..."
pnpm typecheck

# Deploy API
echo "🌐 Deploying API to Cloudflare Workers..."
if [ "$ENVIRONMENT" = "production" ]; then
  pnpm --filter api exec wrangler deploy
else
  pnpm --filter api exec wrangler deploy --env staging
fi

echo "✅ API deployed successfully!"

# Print next steps for mobile
echo ""
echo "📱 Mobile app deployment:"
echo "  1. cd apps/mobile"
echo "  2. eas build --platform all --profile $ENVIRONMENT"
echo "  3. eas submit --platform all"
echo ""
echo "🎉 Deployment complete!"
