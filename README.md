# Maid UAE - Domestic Worker Hiring Platform

A full-stack mobile platform connecting UAE recruitment offices with customers seeking domestic workers. Built with modern technologies for optimal performance and developer experience.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Hono 4.x on Cloudflare Workers |
| **Database** | Neon PostgreSQL (Serverless) |
| **ORM** | Drizzle ORM |
| **Mobile** | React Native + Expo SDK 52 |
| **UI** | Gluestack UI + NativeWind |
| **Auth** | Phone OTP (Twilio) + JWT |
| **Storage** | Cloudflare R2 |
| **Languages** | Arabic (RTL) + English |

## Project Structure

```
maid/
├── apps/
│   ├── api/                 # Hono backend
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── services/    # Business logic
│   │   │   ├── middleware/  # Auth, tenant isolation
│   │   │   ├── db/          # Drizzle schema
│   │   │   └── validators/  # Zod schemas
│   │   ├── drizzle/         # Migrations
│   │   └── wrangler.toml    # Cloudflare config
│   │
│   └── mobile/              # Expo React Native app
│       ├── app/             # Expo Router screens
│       │   ├── (customer)/  # Customer tabs
│       │   ├── (office)/    # Office tabs
│       │   ├── maid/        # Maid detail
│       │   └── quotation/   # Quotation detail
│       └── src/
│           ├── components/  # Reusable components
│           ├── hooks/       # React Query hooks
│           ├── lib/         # API client, i18n
│           ├── store/       # Zustand stores
│           └── locales/     # Translations
│
├── packages/
│   └── shared/              # Shared TypeScript types
│
└── scripts/
    └── deploy.sh            # Deployment script
```

## Features

### Customer App
- 📱 Phone OTP authentication
- 🔍 Advanced maid search with 8 filter criteria
- ❤️ Favorites/saved maids
- 📋 Quotation requests and tracking
- 🌍 Arabic (RTL) & English support
- 🌙 Dark mode

### Office Portal
- 👩‍🍳 Maid profile management (CRUD)
- 📸 Photo upload with R2 storage
- 📊 Dashboard with stats
- 📝 Quotation management
- 🔄 Status updates (available/busy/reserved)

### Search Filters
- Nationality (15 countries)
- Age range
- Marital status
- Religion
- Experience years
- Language skills
- Salary range
- Availability status

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Cloudflare account
- Neon PostgreSQL database
- Twilio account (for SMS)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/maid.git
cd maid

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit .env with your credentials
```

### Environment Variables

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-super-secret-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Database Setup

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# View database (optional)
pnpm db:studio
```

### Development

```bash
# Start all services
pnpm dev

# API only (http://localhost:8787)
pnpm --filter api dev

# Mobile only (Expo Dev Server)
pnpm --filter mobile dev
```

### Type Checking

```bash
# Check all packages
pnpm typecheck
```

## API Endpoints

### Authentication
- `POST /auth/otp/request` - Request OTP
- `POST /auth/otp/verify` - Verify OTP & get token
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token

### Maids
- `GET /maids` - List maids (with filters)
- `GET /maids/:id` - Get maid details
- `POST /maids` - Create maid (office)
- `PUT /maids/:id` - Update maid (office)
- `DELETE /maids/:id` - Delete maid (office)
- `PATCH /maids/:id/status` - Update status

### Quotations
- `POST /quotations` - Request quotation
- `GET /quotations/my` - Customer quotations
- `GET /quotations/office` - Office quotations
- `GET /quotations/:id` - Quotation details
- `PATCH /quotations/:id/status` - Update status

### Offices
- `POST /offices/register` - Register office
- `GET /offices/me` - Get my office
- `PUT /offices/me` - Update office
- `GET /offices/stats` - Get statistics

### Favorites
- `GET /favorites` - List favorites
- `POST /favorites` - Add favorite
- `DELETE /favorites/:maidId` - Remove favorite

### Uploads
- `POST /uploads/presign` - Get presigned URL
- `POST /uploads/file` - Direct upload

### Lookups
- `GET /lookups/nationalities` - All nationalities
- `GET /lookups/languages` - All languages

## Deployment

### API (Cloudflare Workers)

```bash
# Configure wrangler.toml with your IDs
# Then deploy:

# Staging
pnpm --filter api exec wrangler deploy --env staging

# Production
pnpm --filter api exec wrangler deploy
```

### Mobile (EAS Build)

```bash
cd apps/mobile

# Development build
eas build --profile development --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform all
```

### Full Deploy Script

```bash
./scripts/deploy.sh production
```

## Database Schema

| Table | Description |
|-------|-------------|
| `offices` | Recruitment agencies |
| `users` | All users with roles |
| `otp_codes` | Phone verification |
| `nationalities` | Country lookup (15 seeded) |
| `languages` | Language lookup (13 seeded) |
| `maids` | Worker profiles |
| `maid_languages` | Languages spoken |
| `maid_documents` | Photos, passport, visa |
| `customers` | Customer profile extras |
| `quotations` | Price quotes |
| `favorites` | Saved maids |

## Mobile App Screens

### Auth Flow
- Onboarding (4 slides)
- Login (phone input)
- Verify (OTP input)
- Register Office (for offices)

### Customer Tabs
- Home (featured, categories)
- Search (filters, results)
- Favorites (saved maids)
- Profile (settings, logout)

### Office Tabs
- Dashboard (stats)
- Maids (list, manage)
- Quotations (manage requests)
- Profile (office settings)

### Shared
- Maid Detail (gallery, request quote)
- Quotation Detail (status, actions)

## Internationalization

The app supports:
- **Arabic (ar)** - RTL layout, primary
- **English (en)** - LTR layout

Translations are in:
- `apps/mobile/src/locales/ar.json`
- `apps/mobile/src/locales/en.json`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please open a GitHub issue.
