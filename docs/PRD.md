# Product Requirements Document (PRD)

**Product**: Maid UAE - Domestic Worker Hiring Platform
**Version**: 1.0 (MVP)
**Date**: 2024-12-21
**Owner**: Product Team
**Status**: Draft

---

## 1. Product Overview

### 1.1 Product Vision

Maid UAE is a mobile-first platform that connects UAE recruitment offices with customers seeking domestic workers, enabling seamless discovery, comparison, and quotation requests through a modern digital experience.

### 1.2 Product Goals

| Goal | Metric | Target |
|------|--------|--------|
| Digitize maid discovery | Listings searchable online | 100% of partner offices |
| Reduce hiring friction | Time from search to quotation | < 5 minutes |
| Enable office efficiency | Manual work reduction | 50% less WhatsApp inquiries |
| Mobile-first experience | Mobile usage rate | > 90% |

### 1.3 Target Users

| User Type | Description | Primary Goal |
|-----------|-------------|--------------|
| **Office Admin** | Recruitment agency staff | Manage listings, respond to quotations |
| **Customer** | UAE resident seeking domestic help | Find and request maid |

---

## 2. Functional Requirements

### 2.1 Authentication Module

#### FR-AUTH-001: Phone Number Registration
**Priority**: P0 (MVP)

**Description**: Users register using UAE mobile number with OTP verification.

**Acceptance Criteria**:
- [ ] User enters phone number in format +971XXXXXXXXX
- [ ] System validates UAE mobile number format
- [ ] OTP is sent via SMS within 30 seconds
- [ ] OTP expires after 5 minutes
- [ ] Maximum 3 OTP attempts before cooldown (15 min)
- [ ] Successful verification creates user account
- [ ] JWT access token (15 min) and refresh token (7 days) issued

**User Flow**:
```
[Enter Phone] → [Receive OTP] → [Enter OTP] → [Verify] → [Dashboard/Home]
```

#### FR-AUTH-002: User Role Selection
**Priority**: P0 (MVP)

**Description**: New users select their role (Office or Customer) during registration.

**Acceptance Criteria**:
- [ ] After OTP verification, role selection screen appears
- [ ] Two options: "I'm a Recruitment Office" / "I'm Looking for a Maid"
- [ ] Office selection requires license number input
- [ ] Customer selection proceeds directly to app
- [ ] Role stored and cannot be changed (contact support)

#### FR-AUTH-003: Session Management
**Priority**: P0 (MVP)

**Description**: Maintain user sessions securely across app restarts.

**Acceptance Criteria**:
- [ ] Access token stored securely (SecureStore)
- [ ] Automatic token refresh before expiry
- [ ] Logout clears all tokens
- [ ] Session persists across app restarts
- [ ] Force logout on password change (future)

---

### 2.2 Office Management Module

#### FR-OFFICE-001: Office Profile Setup
**Priority**: P0 (MVP)

**Description**: Recruitment offices create and manage their business profile.

**Acceptance Criteria**:
- [ ] Required fields: Name, License Number, Phone, Emirates
- [ ] Optional fields: Logo, Description (AR/EN), Address, Email
- [ ] License number validated for format
- [ ] Logo upload with crop functionality
- [ ] Profile visible to customers after setup complete
- [ ] Arabic and English name support

**Data Model**:
```
Office {
  id, name, nameAr, licenseNumber, phone, email,
  address, addressAr, emirate, logoUrl,
  isActive, isVerified, subscriptionTier,
  createdAt, updatedAt
}
```

#### FR-OFFICE-002: Dashboard Overview
**Priority**: P1 (Post-MVP)

**Description**: Office admins see key metrics on dashboard.

**Acceptance Criteria**:
- [ ] Total active listings count
- [ ] New quotation requests (last 7 days)
- [ ] Profile views (last 30 days)
- [ ] Quick actions: Add Maid, View Quotations

---

### 2.3 Maid Profile Module

#### FR-MAID-001: Create Maid Profile
**Priority**: P0 (MVP)

**Description**: Office admins create detailed maid profiles.

**Acceptance Criteria**:
- [ ] Required: Name, Nationality, Age, Photo
- [ ] Optional: Name (Arabic), Religion, Marital Status, Experience, Skills, Languages, Salary, Notes
- [ ] Photo upload with preview
- [ ] Age auto-calculated from DOB or manual entry
- [ ] Skills multi-select from predefined list
- [ ] Languages multi-select from predefined list
- [ ] Validation: Age 21-60, Salary > 0
- [ ] Profile saved as draft or published immediately

**Data Model**:
```
Maid {
  id, officeId, fullName, fullNameAr,
  dateOfBirth, age, nationalityId,
  passportNumber, passportExpiry,
  status (available|busy|reserved|inactive),
  maritalStatus (single|married|divorced|widowed),
  religion (muslim|non_muslim),
  numberOfChildren, experienceYears,
  previousCountries[], skills[],
  height, weight, photoUrl, videoUrl,
  monthlySalary, contractFee,
  notes, notesAr, isActive,
  createdAt, updatedAt
}
```

#### FR-MAID-002: Maid Photo Management
**Priority**: P0 (MVP)

**Description**: Upload and manage maid profile photos.

**Acceptance Criteria**:
- [ ] Upload up to 5 photos per maid
- [ ] Primary photo displayed in listings
- [ ] Supported formats: JPEG, PNG, WebP
- [ ] Max file size: 5MB per image
- [ ] Auto-compression for mobile
- [ ] Reorder photos via drag-drop
- [ ] Delete photos with confirmation

#### FR-MAID-003: Maid Status Management
**Priority**: P0 (MVP)

**Description**: Office updates maid availability status.

**Acceptance Criteria**:
- [ ] Status options: Available, Busy, Reserved, Inactive
- [ ] One-tap status toggle from listing
- [ ] Status change reflected immediately
- [ ] Only "Available" maids shown to customers by default
- [ ] Status history logged (optional)

#### FR-MAID-004: Edit Maid Profile
**Priority**: P0 (MVP)

**Description**: Modify existing maid profiles.

**Acceptance Criteria**:
- [ ] All fields editable except ID
- [ ] Changes saved immediately
- [ ] Validation same as create
- [ ] Audit trail of changes (optional P2)

#### FR-MAID-005: Delete Maid Profile
**Priority**: P1 (MVP)

**Description**: Remove maid profile from system.

**Acceptance Criteria**:
- [ ] Soft delete (set inactive) by default
- [ ] Confirmation dialog required
- [ ] Associated quotations preserved
- [ ] Hard delete available for admins only

---

### 2.4 Search & Discovery Module

#### FR-SEARCH-001: Browse Maid Listings
**Priority**: P0 (MVP)

**Description**: Customers browse available maid profiles.

**Acceptance Criteria**:
- [ ] Grid/list view of available maids
- [ ] Card shows: Photo, Name, Nationality, Experience, Salary
- [ ] Pagination (20 items per page)
- [ ] Pull-to-refresh functionality
- [ ] Skeleton loading states
- [ ] Empty state when no results

#### FR-SEARCH-002: Filter Maids
**Priority**: P0 (MVP)

**Description**: Apply filters to narrow maid search.

**Filters**:
| Filter | Type | Options |
|--------|------|---------|
| Nationality | Multi-select | Philippines, Indonesia, Ethiopia, India, Bangladesh, Sri Lanka, Nepal, Kenya, Uganda |
| Age | Range (21-60) | Min-Max slider |
| Marital Status | Single-select | Any, Single, Married, Divorced, Widowed |
| Religion | Single-select | Any, Muslim, Non-Muslim |
| Experience | Range (0-15+) | Min-Max slider |
| Languages | Multi-select | Arabic, English, Hindi, Tagalog, Amharic, Urdu |
| Skills | Multi-select | Cooking, Cleaning, Childcare, Eldercare, Laundry, Ironing |
| Salary | Range | Min-Max AED/month |

**Acceptance Criteria**:
- [ ] Filter panel slides from bottom (actionsheet)
- [ ] Filters persist during session
- [ ] "Clear All" resets filters
- [ ] Active filter count shown on button
- [ ] Results update on "Apply"
- [ ] URL-safe filter state for sharing

#### FR-SEARCH-003: Sort Results
**Priority**: P1 (MVP)

**Description**: Sort maid listings by various criteria.

**Sort Options**:
- Newest First (default)
- Price: Low to High
- Price: High to Low
- Experience: Most First
- Age: Youngest First
- Age: Oldest First

**Acceptance Criteria**:
- [ ] Sort dropdown in header
- [ ] Default: Newest First
- [ ] Sort persists with filters

#### FR-SEARCH-004: Search by Text
**Priority**: P1 (Post-MVP)

**Description**: Free-text search for maids.

**Acceptance Criteria**:
- [ ] Search bar at top of listings
- [ ] Searches: Name, Skills, Notes
- [ ] Debounced input (300ms)
- [ ] Highlights matching text
- [ ] Recent searches saved

---

### 2.5 Maid Profile View Module

#### FR-PROFILE-001: View Maid Details
**Priority**: P0 (MVP)

**Description**: Customers view full maid profile.

**Acceptance Criteria**:
- [ ] Hero section with main photo
- [ ] Photo gallery with swipe/zoom
- [ ] Personal info: Name, Age, Nationality, Religion, Marital Status
- [ ] Work info: Experience, Skills, Languages, Previous Countries
- [ ] Pricing: Monthly Salary, Contract Fee (if shown)
- [ ] Office info: Office name, location
- [ ] CTA: "Request Quotation" button
- [ ] Share profile via deep link

#### FR-PROFILE-002: Photo Gallery
**Priority**: P0 (MVP)

**Description**: View all maid photos in gallery format.

**Acceptance Criteria**:
- [ ] Full-screen gallery view
- [ ] Swipe between photos
- [ ] Pinch-to-zoom support
- [ ] Photo counter (1/5)
- [ ] Close button returns to profile

#### FR-PROFILE-003: Save to Favorites
**Priority**: P1 (MVP)

**Description**: Customers save maids for later.

**Acceptance Criteria**:
- [ ] Heart icon on profile card and detail
- [ ] Tap to toggle favorite
- [ ] Favorites accessible from profile tab
- [ ] Favorites persist across sessions
- [ ] Notify if favorited maid becomes unavailable

---

### 2.6 Quotation Module

#### FR-QUOTE-001: Request Quotation
**Priority**: P0 (MVP)

**Description**: Customer requests quotation for a maid.

**Acceptance Criteria**:
- [ ] "Request Quotation" button on maid profile
- [ ] Form fields: Name, Phone (pre-filled), Message (optional)
- [ ] Terms acceptance checkbox
- [ ] Submit creates quotation request
- [ ] Office receives notification
- [ ] Customer sees "Request Sent" confirmation
- [ ] Status: Pending

**Data Model**:
```
Quotation {
  id, quotationNumber, officeId, customerId, maidId,
  status (draft|sent|accepted|rejected|expired),
  baseSalary, contractFee, visaFee, medicalFee,
  otherFees, discount, totalAmount, vatAmount, grandTotal,
  contractDuration, startDate, notes, terms,
  validUntil, sentAt, acceptedAt,
  createdAt, updatedAt
}
```

#### FR-QUOTE-002: View Quotation Status (Customer)
**Priority**: P0 (MVP)

**Description**: Customer tracks quotation request status.

**Acceptance Criteria**:
- [ ] "My Requests" tab in profile
- [ ] List of quotation requests
- [ ] Status badge: Pending, Responded, Accepted, Rejected
- [ ] Tap to view quotation details
- [ ] Office response visible when provided

#### FR-QUOTE-003: Respond to Quotation (Office)
**Priority**: P0 (MVP)

**Description**: Office responds to quotation requests.

**Acceptance Criteria**:
- [ ] "Quotations" tab in office dashboard
- [ ] List of pending requests
- [ ] View customer details and selected maid
- [ ] Enter pricing breakdown:
  - Base Salary
  - Contract Fee
  - Visa Fee
  - Medical Fee
  - Other Fees
  - Discount
  - Total (auto-calculated)
- [ ] Add notes/terms
- [ ] Set validity period
- [ ] Send quotation to customer
- [ ] Status: Sent

#### FR-QUOTE-004: Accept/Reject Quotation (Customer)
**Priority**: P1 (MVP)

**Description**: Customer responds to quotation.

**Acceptance Criteria**:
- [ ] View received quotation details
- [ ] "Accept" button (marks as accepted)
- [ ] "Reject" button with optional reason
- [ ] Accepted quotation triggers office notification
- [ ] Status updates reflect in both apps

---

### 2.7 Internationalization Module

#### FR-I18N-001: Language Selection
**Priority**: P0 (MVP)

**Description**: Users switch between Arabic and English.

**Acceptance Criteria**:
- [ ] Language toggle in settings
- [ ] Arabic = RTL layout, English = LTR layout
- [ ] Default: Arabic (can be changed)
- [ ] Language preference persisted
- [ ] All UI text translated
- [ ] Data displayed in both (name + nameAr)

#### FR-I18N-002: RTL Layout Support
**Priority**: P0 (MVP)

**Description**: Full RTL support for Arabic.

**Acceptance Criteria**:
- [ ] Layout mirrors for RTL
- [ ] Text alignment follows direction
- [ ] Icons flip where appropriate
- [ ] Navigation gestures respect direction
- [ ] Input fields support RTL text

---

### 2.8 Notification Module

#### FR-NOTIFY-001: Push Notifications
**Priority**: P1 (MVP)

**Description**: Users receive push notifications for key events.

**Notification Types**:
| Event | Recipient | Message |
|-------|-----------|---------|
| New Quotation Request | Office | "New request for [Maid Name]" |
| Quotation Received | Customer | "[Office] sent you a quotation" |
| Quotation Accepted | Office | "[Customer] accepted your quotation" |
| Maid Status Change | Customer (favorited) | "[Maid] is now available" |

**Acceptance Criteria**:
- [ ] Permission request on first launch
- [ ] Notifications work when app backgrounded
- [ ] Tap notification opens relevant screen
- [ ] Notification preferences in settings

---

## 3. Non-Functional Requirements

### 3.1 Performance

| Metric | Target |
|--------|--------|
| App launch time | < 3 seconds |
| API response time | < 500ms (p95) |
| Image load time | < 2 seconds |
| Search results | < 1 second |

### 3.2 Security

- [ ] All API calls over HTTPS
- [ ] JWT tokens with short expiry
- [ ] Refresh tokens rotated on use
- [ ] Phone numbers validated
- [ ] Rate limiting on OTP requests
- [ ] SQL injection prevention (Drizzle ORM)
- [ ] XSS prevention in rendered content

### 3.3 Scalability

- [ ] Serverless backend (auto-scaling)
- [ ] CDN for static assets
- [ ] Database connection pooling
- [ ] Pagination on all list endpoints

### 3.4 Accessibility

- [ ] WCAG 2.1 AA compliance target
- [ ] Screen reader support
- [ ] Minimum touch targets (44x44)
- [ ] Color contrast ratios
- [ ] Font scaling support

### 3.5 Localization

- [ ] Arabic (ar) - Primary
- [ ] English (en) - Secondary
- [ ] Date format: DD/MM/YYYY
- [ ] Currency: AED (د.إ)
- [ ] Phone format: +971 XX XXX XXXX

---

## 4. User Interface Requirements

### 4.1 Design System

**Colors**:
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | #0066CC | #4D9FFF | Buttons, links |
| Secondary | #5BC0BE | #7DD3D1 | Accents |
| Background | #FFFFFF | #1A1A1A | Main background |
| Surface | #F5F5F5 | #2D2D2D | Cards |
| Text Primary | #1A1A1A | #FFFFFF | Headings |
| Text Secondary | #666666 | #A0A0A0 | Body text |
| Success | #28A745 | #34D058 | Available |
| Warning | #FFC107 | #FFD93D | Reserved |
| Error | #DC3545 | #F85149 | Errors |

**Typography**:
| Style | Arabic | English | Size |
|-------|--------|---------|------|
| H1 | Rubik Bold | Inter Bold | 28px |
| H2 | Rubik SemiBold | Inter SemiBold | 24px |
| H3 | Rubik Medium | Inter Medium | 20px |
| Body | Rubik Regular | Inter Regular | 16px |
| Caption | Rubik Regular | Inter Regular | 14px |

### 4.2 Key Screens

**Office App**:
1. Login/Register (Phone OTP)
2. Role Selection
3. Office Profile Setup
4. Dashboard
5. Maid Listing
6. Add/Edit Maid
7. Quotation List
8. Quotation Detail
9. Settings

**Customer App**:
1. Login/Register (Phone OTP)
2. Home (Featured, Categories)
3. Search/Browse
4. Filters
5. Maid Profile
6. Photo Gallery
7. Request Quotation
8. My Requests
9. Favorites
10. Profile/Settings

---

## 5. Data Requirements

### 5.1 Reference Data

**Nationalities**:
- Philippines, Indonesia, Ethiopia, India, Bangladesh, Sri Lanka, Nepal, Kenya, Uganda, Vietnam, Myanmar

**Languages**:
- Arabic, English, Hindi, Urdu, Tagalog, Indonesian, Amharic, Bengali, Nepali, Swahili

**Skills**:
- Cooking, Cleaning, Childcare, Eldercare, Laundry, Ironing, Driving, Gardening, Pet Care, Sewing

**Emirates**:
- Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah

### 5.2 Data Retention

| Data Type | Retention |
|-----------|-----------|
| User accounts | Until deleted |
| Maid profiles | 2 years after inactive |
| Quotations | 5 years |
| OTP codes | 24 hours |
| Session logs | 90 days |

---

## 6. Release Criteria

### 6.1 MVP Release Checklist

- [ ] All P0 features implemented
- [ ] Arabic and English translations complete
- [ ] RTL layout verified
- [ ] Performance targets met
- [ ] Security review passed
- [ ] 10 test maids created
- [ ] 2 test offices onboarded
- [ ] iOS TestFlight build approved
- [ ] Android internal testing passed
- [ ] Web version deployed to Vercel

### 6.2 Beta Release Checklist

- [ ] 5 real offices onboarded
- [ ] 50 real maid profiles
- [ ] 100 beta testers recruited
- [ ] Feedback collection system active
- [ ] Bug tracking enabled
- [ ] Analytics integrated

---

## 7. Appendix

### 7.1 Glossary

| Term | Definition |
|------|------------|
| Office | Licensed recruitment agency |
| Maid | Domestic worker |
| Quotation | Price proposal for hiring |
| OTP | One-Time Password |
| RTL | Right-to-Left (Arabic layout) |

### 7.2 References

- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [Hono Documentation](https://hono.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Gluestack UI](https://gluestack.io)
- [UAE MOHRE Regulations](https://www.mohre.gov.ae)
