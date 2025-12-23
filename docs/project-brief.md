# Project Brief: UAE Maid Hiring Platform

**Version**: 1.0
**Date**: 2024-12-21
**Status**: Analysis Phase
**Methodology**: BMAD-METHOD v6

---

## 1. Executive Summary

### 1.1 Vision Statement

Build a modern, mobile-first platform connecting UAE recruitment offices (agencies) with customers seeking domestic workers. The platform will digitize the traditional maid hiring process with real-time availability, transparent pricing, and seamless quotation workflows.

### 1.2 Problem Statement

The UAE domestic worker recruitment market is fragmented with:
- **Offices**: Manual listing management, no digital presence, inefficient customer communication
- **Customers**: Difficulty comparing options, no real-time availability, opaque pricing
- **Process**: Paper-based contracts, manual quotations, no tracking

### 1.3 Solution Overview

A dual-sided platform with:
- **Office Portal (B2B)**: Web/mobile dashboard for managing maid listings, profiles, availability, and quotations
- **Customer App (B2C)**: Mobile app for searching, filtering, and requesting maids with instant quotations

---

## 2. Market Analysis

### 2.1 UAE Domestic Worker Market

- **Market Size**: ~750,000+ domestic workers in UAE
- **Key Emirates**: Dubai, Abu Dhabi, Sharjah
- **Regulated by**: MOHRE (Ministry of Human Resources and Emiratisation)
- **Tadbeer System**: Government-regulated recruitment centers

### 2.2 Competitor Analysis

| Competitor | Strengths | Weaknesses |
|------------|-----------|------------|
| **Tadbeerco.com** | Government-backed, trusted | Limited digital UX, basic search |
| **Dubizzle** | Large user base | Generic platform, no specialization |
| **Direct agencies** | Personal service | No digital presence, fragmented |

### 2.3 Reference Application Analysis

**Source**: `workers.apk` (Flutter app - "DOMESTIC WORKERS")

#### Brand & Visual Identity
- **Primary Color**: Blue (#0066CC)
- **Secondary Color**: Teal/Turquoise (#5BC0BE)
- **Logo**: House silhouette with cleaning woman icon
- **Typography**: Clean, professional sans-serif

#### Identified Features (from asset analysis)
| Asset | Feature Indication |
|-------|-------------------|
| `logo.png` | Branding - house + cleaning woman |
| `details.jpg` | Maid profile display with name badge |
| `contact.jpg` | Customer support (chat, phone, video) |
| `offer1-3` | Promotional offers/packages |
| `Wallet.json` | Payment/wallet feature |
| `search.json` | Search functionality |
| `welcom.json` | Onboarding/welcome flow |
| `no_data.json` | Empty state handling |
| `no_notifications.png` | Notification system |

#### Inferred App Structure
1. **Onboarding**: Welcome animation, registration
2. **Home**: Featured maids, offers, categories
3. **Search**: Filter-based maid discovery
4. **Profile**: Detailed maid information with photos
5. **Booking**: Request/quotation flow
6. **Wallet**: Payment management
7. **Contact**: Support channels
8. **Notifications**: Updates and alerts

---

## 3. User Personas

### 3.1 Persona: Office Admin (Fatima)

**Role**: Recruitment Office Manager
**Age**: 35-50
**Location**: Dubai
**Tech Comfort**: Moderate (smartphone daily, basic computer)

**Goals**:
- Quickly add/update maid listings
- Respond to customer inquiries efficiently
- Track quotation status
- Manage availability in real-time

**Pain Points**:
- Too much WhatsApp back-and-forth
- Manually updating availability across channels
- No centralized customer database
- Paper-based quotation process

**Key Quote**: "I spend half my day answering the same questions on WhatsApp"

### 3.2 Persona: Customer (Ahmed)

**Role**: UAE Resident / Family Head
**Age**: 30-55
**Location**: Abu Dhabi
**Tech Comfort**: High (uses apps for everything)

**Goals**:
- Find a maid matching specific requirements
- Compare options from multiple offices
- Get transparent pricing quickly
- Hire within specific timeframe

**Pain Points**:
- Visiting multiple offices physically
- Unclear pricing until late in process
- No way to verify credentials
- Language barriers

**Key Quote**: "I want to see all options and prices before I commit"

### 3.3 Persona: Customer (Sarah)

**Role**: Working Professional / First-time Employer
**Age**: 28-40
**Location**: Sharjah
**Tech Comfort**: Very High (digital native)

**Goals**:
- Quick, hassle-free hiring process
- Specific criteria (religion, language, experience)
- Mobile-first experience
- Clear contract terms

**Pain Points**:
- Overwhelming choice without guidance
- Unfamiliar with legal requirements
- Privacy concerns with personal info
- Scheduling visits around work

**Key Quote**: "I need someone who speaks Arabic and can cook"

---

## 4. Core Features

### 4.1 Office Portal Features

| Feature | Priority | Description |
|---------|----------|-------------|
| **Office Registration** | P0 | Onboard with license verification |
| **Maid Profile CRUD** | P0 | Create, edit, delete maid listings |
| **Photo Management** | P0 | Upload, crop, reorder photos |
| **Availability Toggle** | P0 | Available/Busy/Reserved status |
| **Quotation Response** | P0 | Respond to customer requests |
| **Dashboard Analytics** | P1 | Views, inquiries, conversions |
| **Customer Database** | P1 | Track previous customers |
| **Invoice Generation** | P2 | Create formal invoices |
| **Contract Templates** | P2 | Standard contract generation |
| **Multi-user Access** | P2 | Staff accounts with roles |

### 4.2 Customer App Features

| Feature | Priority | Description |
|---------|----------|-------------|
| **Phone OTP Auth** | P0 | UAE mobile verification |
| **Browse Listings** | P0 | View available maids |
| **Search & Filter** | P0 | Nationality, age, religion, etc. |
| **Maid Profile View** | P0 | Details, photos, skills |
| **Request Quotation** | P0 | Submit interest with requirements |
| **Favorites** | P1 | Save maids for later |
| **Booking History** | P1 | Track past requests |
| **Push Notifications** | P1 | Updates on quotations |
| **Language Toggle** | P1 | Arabic/English switch |
| **Compare Maids** | P2 | Side-by-side comparison |
| **Reviews/Ratings** | P2 | Office ratings |

### 4.3 Shared Features

| Feature | Priority | Description |
|---------|----------|-------------|
| **RTL Support** | P0 | Arabic right-to-left layout |
| **Image CDN** | P0 | Fast image loading |
| **Real-time Status** | P1 | Live availability updates |
| **Chat/Messaging** | P2 | In-app communication |

---

## 5. Search & Filter Requirements

### 5.1 Filter Criteria

| Filter | Type | Options |
|--------|------|---------|
| **Nationality** | Multi-select | Philippines, Indonesia, Ethiopia, India, Bangladesh, Sri Lanka, Nepal, Kenya, Uganda |
| **Age Range** | Range slider | 21-55 years |
| **Marital Status** | Single-select | Single, Married, Divorced, Widowed |
| **Religion** | Single-select | Muslim, Non-Muslim |
| **Experience** | Range slider | 0-15+ years |
| **Languages** | Multi-select | Arabic, English, Hindi, Tagalog, Amharic, etc. |
| **Skills** | Multi-select | Cooking, Cleaning, Childcare, Eldercare, Driving, Sewing |
| **Salary Range** | Range slider | 1,500-5,000+ AED/month |
| **Availability** | Toggle | Available now only |

### 5.2 Sort Options

- Newest first
- Price: Low to High
- Price: High to Low
- Experience: Most
- Rating: Highest

---

## 6. Technical Strategy

### 6.1 Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Backend** | Hono on Cloudflare Workers | Edge performance, low latency UAE |
| **Database** | Neon PostgreSQL | Serverless, scales with demand |
| **ORM** | Drizzle | Type-safe, lightweight |
| **Mobile** | Expo + React Native | Cross-platform, web deploy |
| **UI** | Gluestack UI + NativeWind | Modern, RTL-ready |
| **Auth** | Phone OTP (Twilio) | UAE standard, no passwords |
| **Storage** | Cloudflare R2 | Fast uploads, CDN included |
| **i18n** | react-i18next | Arabic/English RTL |

### 6.2 Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API Style** | Hono RPC | End-to-end type safety |
| **Multi-tenancy** | Row-level (officeId) | Simple, scalable |
| **Auth** | JWT + Refresh tokens | Stateless, mobile-friendly |
| **File Upload** | Presigned URLs | Direct client upload |
| **Real-time** | Polling (MVP) | Simple, reliable |

### 6.3 Deployment Strategy

| Component | Platform | Region |
|-----------|----------|--------|
| API | Cloudflare Workers | Global (edge) |
| Database | Neon | AWS eu-central-1 |
| Mobile Web | Vercel | Global |
| iOS | App Store | UAE |
| Android | Play Store | UAE |

---

## 7. Success Metrics

### 7.1 Launch Metrics (MVP)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Offices onboarded | 10 | Month 1 |
| Maid profiles listed | 100 | Month 1 |
| Customer registrations | 500 | Month 2 |
| Quotation requests | 200 | Month 2 |
| Conversion rate | 15% | Month 3 |

### 7.2 Growth Metrics (Post-MVP)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Monthly Active Users | 5,000 | Month 6 |
| Offices | 50 | Month 6 |
| Listings | 1,000 | Month 6 |
| App Store Rating | 4.5+ | Month 6 |

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Regulatory compliance** | High | Partner with licensed Tadbeer centers |
| **Office adoption** | High | Free tier, onboarding support |
| **Data privacy** | Medium | UAE data residency, encryption |
| **Competition** | Medium | Superior UX, mobile-first |
| **Payment integration** | Low | Phase 2, start with quotations only |

---

## 9. Constraints

### 9.1 Technical Constraints
- Must support iOS 14+, Android 8+
- Web version for link sharing (Vercel)
- Arabic RTL must be native, not mirrored
- Image optimization for mobile data

### 9.2 Business Constraints
- MVP budget limited
- No payment processing in MVP
- Focus on UAE market initially
- English and Arabic only

### 9.3 Timeline Constraints
- MVP in 8 weeks
- Beta launch with 5 partner offices
- Public launch Month 3

---

## 10. Out of Scope (MVP)

- Payment processing
- In-app chat/messaging
- Video profiles
- Contract generation
- Background checks integration
- Multi-country support
- Super admin panel
- Advanced analytics
- API for third-parties

---

## 11. Next Steps

1. **PRD Creation** → Detail all features with acceptance criteria
2. **Architecture Design** → Database schema, API design, component structure
3. **Epic/Story Breakdown** → Sprint-ready work items
4. **MVP Validation** → Confirm scope with stakeholders
5. **Development Kickoff** → Begin Sprint 1

---

## Appendix A: Workers.apk Asset Inventory

| File | Size | Purpose |
|------|------|---------|
| logo.png | 727KB | Brand logo |
| details.jpg | 1.9MB | Maid profile hero |
| contact.jpg | 132KB | Support illustration |
| offer1.webp | 38KB | Promo banner 1 |
| offer2.jpg | 51KB | Promo banner 2 |
| offer3.jpg | 7KB | Promo banner 3 |
| no_notifications.png | 61KB | Empty notifications |
| Wallet.json | 37KB | Payment animation |
| no_data.json | 83KB | Empty state animation |
| search.json | 105KB | Search animation |
| welcom.json | 99KB | Onboarding animation |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Tadbeer** | UAE government-regulated domestic worker recruitment system |
| **MOHRE** | Ministry of Human Resources and Emiratisation |
| **Office** | Licensed recruitment agency/center |
| **Maid** | Domestic worker (housemaid, nanny, caregiver) |
| **Quotation** | Price estimate for hiring a maid |
| **OTP** | One-Time Password (SMS verification) |
