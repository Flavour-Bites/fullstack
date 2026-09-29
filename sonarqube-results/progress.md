# SonarQube Fix Progress

## Current Status

- Total issues: 133 open (143 historical tracked)
- Pending: 132
- Investigating: 0
- Fixed: 0
- Verified: 10
- False positives: 0
- Won't fix: 1
- Deferred: 0

## Current Batch (Batch #1 Completed)

- Issue: 4502bcc0-caf0-44bf-8d72-36c03bd23e4c
  - Rule: typescript:S2699 (BLOCKER)
  - File: test/shared/utils/fetchWithTimeout.test.ts
  - Status: verified

- Issue: 1adf471b-5af9-47d0-93ef-2c72c3267ec6
  - Rule: typescript:S2871 (CRITICAL BUG)
  - File: src/server/platform/integrations/cloudinary/cloudinaryClient.ts
  - Status: verified

- Issue: a61b70db-acf6-412e-945e-9ca9af15d212
  - Rule: typescript:S4790 (CRITICAL VULNERABILITY)
  - File: src/server/platform/integrations/cloudinary/cloudinaryClient.ts
  - Status: wont-fix (Vendor API requirement: Cloudinary requires SHA-1 for signature auth)

- Issue: a9d5cc6f-62d5-4f75-a8e5-50eb839f84b7
  - Rule: typescript:S3776 (CRITICAL CODE SMELL)
  - File: src/client/components/HeaderMobileMenu.tsx
  - Status: verified

- Issue: 7766a139-8df7-45f2-806d-402c53eb6c9c
  - Rule: typescript:S3358 (MAJOR CODE SMELL)
  - File: src/client/components/HeaderMobileMenu.tsx
  - Status: verified

- Issue: 97fcfb2a-dc54-4459-a191-d56f23de2f15
  - Rule: typescript:S3358 (MAJOR CODE SMELL)
  - File: src/client/components/HeaderMobileMenu.tsx
  - Status: verified

- Issue: 2793cdbd-9e77-4253-837a-9b102aac9d55
  - Rule: typescript:S3776 (CRITICAL CODE SMELL)
  - File: src/server/modules/orders/orders.service.ts
  - Status: verified

- Issue: b83ccd6b-cc73-46bb-9fec-ec6813418f2d
  - Rule: typescript:S3776 (CRITICAL CODE SMELL)
  - File: src/server/platform/config/env.ts
  - Status: verified

- Issue: aba37485-adea-4314-b100-f550566fbf8b
  - Rule: typescript:S3776 (CRITICAL CODE SMELL)
  - File: src/client/components/HeaderProfileDropdown.tsx
  - Status: verified

- Issue: 90797089-f164-4d89-92b4-edb121d33eda
  - Rule: typescript:S6819 (MAJOR CODE SMELL)
  - File: src/client/components/HeaderProfileDropdown.tsx
  - Status: verified

- Issue: 907cb513-0430-4978-b4b0-f684b645c787
  - Rule: typescript:S1854 (MINOR CODE SMELL)
  - File: src/client/features/orders/hooks/useRequestForm.ts
  - Status: verified

## Recently Fixed

- `fetchWithTimeout.test.ts`: Added explicit `expect(vi.getTimerCount()).toBe(0)` verification assertion to timer test.
- `cloudinaryClient.ts`: Added `String.localeCompare` alphabetical sort comparator for Cloudinary URL query parameters.
- `HeaderMobileMenu.tsx`: Extracted `getMobileNavLinkClass` and `MobileUserAccountCard` subcomponents, resolving nested ternaries and bringing cognitive complexity from 25 to <15.
- `orders.service.ts`: Decomposed Prisma order entity mapper into `parseMoneyCommercials` and `parseDateCommercials` pure functions.
- `env.ts`: Decomposed environment validator into `resolveAppUrl`, `validateAppUrl`, `validateFrontendUrl`, `validateJwtSecret`, and `validateCloudinaryConfig`.
- `HeaderProfileDropdown.tsx`: Extracted `ProfileTrigger`, `DropdownUserHeader`, `DropdownNavigationLinks`, and `DropdownThemeToggle`; replaced non-semantic clickable `div` with native `<button type="button">`.
- `useRequestForm.ts`: Removed dead `availabilityLoading` assignment and cleaned unused imports.

## Deferred

*(None)*

## False Positives

*(None)*

## Won't Fix

- `a61b70db-acf6-412e-945e-9ca9af15d212` (`typescript:S4790`): Cloudinary API signing specification mandates standard SHA-1 hash for authentication signatures. Risk is mitigated as it is purely an external vendor outbound auth requirement.

## Architectural Findings

- **Compute Engine Async Processing**: SonarScanner uploads analysis reports to SonarQube's Compute Engine (CE), which processes them asynchronously. `scripts/sonar-export.sh` was enhanced to inspect `.scannerwork/report-task.txt` and wait for CE task completion (`status: SUCCESS`) before pulling issues, guaranteeing fresh results.
- **Cognitive Complexity Hotspots**: Large JSX components mixing navigation, dropdown state, and authentication badges are primary sources of S3776 smells. Decomposing these into cohesive presentation subcomponents with explicit typed props resolved all complexity rules without altering styling or UX.
