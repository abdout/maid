# Epic Breakdown - Maid UAE Platform

## Epic Overview

| Epic | Name | Priority | Stories | Sprint |
|------|------|----------|---------|--------|
| E1 | Project Foundation | P0 | 5 | 1 |
| E2 | Authentication System | P0 | 5 | 1 |
| E3 | Office Management | P0 | 4 | 2 |
| E4 | Maid Profile System | P0 | 6 | 2 |
| E5 | Customer Experience | P0 | 6 | 3 |
| E6 | Quotation System | P0 | 5 | 3 |
| E7 | Internationalization | P0 | 4 | 4 |

---

## Epic 1: Project Foundation

**Goal**: Establish the technical foundation with monorepo, API, and mobile app structures.

### Stories

| ID | Story | Points | Priority |
|----|-------|--------|----------|
| E1-S1 | Initialize monorepo with pnpm workspaces | 2 | P0 |
| E1-S2 | Setup Hono API project with Cloudflare Workers | 3 | P0 |
| E1-S3 | Setup Expo mobile project with Gluestack UI | 3 | P0 |
| E1-S4 | Configure Drizzle ORM with Neon PostgreSQL | 3 | P0 |
| E1-S5 | Configure Claude Code with project agents | 2 | P0 |

**Acceptance Criteria**:
- [ ] Monorepo runs with `pnpm dev`
- [ ] API responds at localhost:8787
- [ ] Mobile app runs on iOS/Android simulators
- [ ] Database migrations work
- [ ] Claude Code agents configured

---

## Epic 2: Authentication System

**Goal**: Implement phone OTP authentication with JWT tokens.

### Stories

| ID | Story | Points | Priority |
|----|-------|--------|----------|
| E2-S1 | Create OTP request endpoint with Twilio | 3 | P0 |
| E2-S2 | Create OTP verification endpoint with JWT issuance | 3 | P0 |
| E2-S3 | Implement auth middleware with role checking | 2 | P0 |
| E2-S4 | Build login screen with phone input and OTP | 5 | P0 |
| E2-S5 | Implement secure token storage with auto-refresh | 3 | P0 |

**Acceptance Criteria**:
- [ ] User receives OTP via SMS
- [ ] OTP verification returns JWT
- [ ] Protected routes require valid token
- [ ] Login flow works on mobile
- [ ] Session persists across app restarts

---

## Epic 3: Office Management

**Goal**: Enable recruitment offices to register and manage their profile.

### Stories

| ID | Story | Points | Priority |
|----|-------|--------|----------|
| E3-S1 | Create office registration API endpoint | 3 | P0 |
| E3-S2 | Create office profile update API | 2 | P0 |
| E3-S3 | Build office profile setup screen | 5 | P0 |
| E3-S4 | Build office dashboard screen with stats | 3 | P1 |

**Acceptance Criteria**:
- [ ] Office can register with license number
- [ ] Office can update profile with logo
- [ ] Dashboard shows listing count
- [ ] Profile visible to customers

---

## Epic 4: Maid Profile System

**Goal**: Enable offices to create and manage maid listings with photos.

### Stories

| ID | Story | Points | Priority |
|----|-------|--------|----------|
| E4-S1 | Create maid CRUD API endpoints | 5 | P0 |
| E4-S2 | Implement photo upload with R2 presigned URLs | 5 | P0 |
| E4-S3 | Build maid listing screen for office | 5 | P0 |
| E4-S4 | Build maid create/edit form | 8 | P0 |
| E4-S5 | Implement status toggle functionality | 2 | P0 |
| E4-S6 | Build photo gallery management | 5 | P1 |

**Acceptance Criteria**:
- [ ] Office can create maid with all fields
- [ ] Photos upload to R2 successfully
- [ ] Maid list shows with filters
- [ ] Status can be toggled in one tap
- [ ] Multiple photos supported

---

## Epic 5: Customer Experience

**Goal**: Enable customers to search, filter, and view maid profiles.

### Stories

| ID | Story | Points | Priority |
|----|-------|--------|----------|
| E5-S1 | Create public maid listing API with filters | 5 | P0 |
| E5-S2 | Create maid detail API endpoint | 2 | P0 |
| E5-S3 | Build customer home screen | 5 | P0 |
| E5-S4 | Build search screen with filter sheet | 8 | P0 |
| E5-S5 | Build maid detail screen with gallery | 5 | P0 |
| E5-S6 | Implement favorites functionality | 3 | P1 |

**Acceptance Criteria**:
- [ ] Customer can browse available maids
- [ ] All filter criteria work
- [ ] Maid profile shows all information
- [ ] Photo gallery with zoom works
- [ ] Favorites persist across sessions

---

## Epic 6: Quotation System

**Goal**: Enable customers to request quotations and offices to respond.

### Stories

| ID | Story | Points | Priority |
|----|-------|--------|----------|
| E6-S1 | Create quotation CRUD API | 5 | P0 |
| E6-S2 | Build quotation request form (customer) | 5 | P0 |
| E6-S3 | Build quotation list screen (office) | 3 | P0 |
| E6-S4 | Build quotation response form (office) | 5 | P0 |
| E6-S5 | Build quotation detail view (both) | 3 | P0 |

**Acceptance Criteria**:
- [ ] Customer can request quotation for maid
- [ ] Office receives notification
- [ ] Office can respond with pricing
- [ ] Customer can view received quotation
- [ ] Status updates reflect for both

---

## Epic 7: Internationalization

**Goal**: Full Arabic RTL support with language switching.

### Stories

| ID | Story | Points | Priority |
|----|-------|--------|----------|
| E7-S1 | Setup i18n with react-i18next | 3 | P0 |
| E7-S2 | Implement RTL layout support | 5 | P0 |
| E7-S3 | Create Arabic translations | 5 | P0 |
| E7-S4 | Build language switcher component | 2 | P0 |

**Acceptance Criteria**:
- [ ] All UI text translated to Arabic
- [ ] RTL layout works correctly
- [ ] Language toggle persists
- [ ] Data displays in both languages

---

## Sprint Planning

### Sprint 1 (Foundation + Auth)
- E1-S1 to E1-S5 (13 points)
- E2-S1 to E2-S5 (16 points)
- **Total: 29 points**

### Sprint 2 (Office + Maid)
- E3-S1 to E3-S3 (10 points)
- E4-S1 to E4-S5 (25 points)
- **Total: 35 points**

### Sprint 3 (Customer + Quotation)
- E5-S1 to E5-S5 (25 points)
- E6-S1 to E6-S5 (21 points)
- **Total: 46 points**

### Sprint 4 (i18n + Polish)
- E7-S1 to E7-S4 (15 points)
- E3-S4, E4-S6, E5-S6 (11 points)
- Bug fixes, testing
- **Total: 26 points**

---

## Story Template

```markdown
# Story: [E#-S#] [Title]

## Description
As a [role], I want [feature] so that [benefit].

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

## Technical Notes
- Implementation details
- API endpoints affected
- Database changes

## Dependencies
- Depends on: [E#-S#]
- Blocks: [E#-S#]

## Estimates
- Points: X
- Priority: P0/P1/P2
```
