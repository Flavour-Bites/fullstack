import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@server/platform/config/prisma.js', () => ({
  getPrisma: vi.fn(),
}));

import { businessAvailabilityService } from '@server/modules/business/businessAvailability.service.js';
import { getPrisma } from '@server/platform/config/prisma.js';

const mockGetPrisma = vi.mocked(getPrisma);

describe('businessAvailabilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPolicy & getAvailabilityResponse', () => {
    it('returns default policy when no database policy exists', async () => {
      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any);

      const policy = await businessAvailabilityService.getPolicy();
      expect(policy.isEnabled).toBe(true);
      expect(policy.timezone).toBe('Africa/Addis_Ababa');
      expect(policy.minimumLeadTimeHours).toBe(24);
      expect(policy.saturdayEnabled).toBe(true);
      expect(policy.sundayEnabled).toBe(true);
      expect(policy.mondayEnabled).toBe(false);

      const response = await businessAvailabilityService.getAvailabilityResponse();
      expect(response.isEnabled).toBe(true);
      expect(response.days.saturday).toBe(true);
      expect(response.days.sunday).toBe(true);
      expect(response.days.monday).toBe(false);
    });

    it('returns configured policy from database when present', async () => {
      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'bap_123',
            isEnabled: true,
            timezone: 'Africa/Addis_Ababa',
            minimumLeadTimeHours: 48,
            mondayEnabled: true,
            tuesdayEnabled: true,
            wednesdayEnabled: true,
            thursdayEnabled: true,
            fridayEnabled: true,
            saturdayEnabled: true,
            sundayEnabled: true,
          }),
        },
      } as any);

      const response = await businessAvailabilityService.getAvailabilityResponse();
      expect(response.minimumLeadTimeHours).toBe(48);
      expect(response.days.monday).toBe(true);
    });
  });

  describe('updatePolicy', () => {
    it('throws error when no policy exists to update', async () => {
      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any);

      await expect(businessAvailabilityService.updatePolicy({ isEnabled: false }))
        .rejects.toThrow('Business availability policy not found');
    });

    it('updates policy fields in database and returns updated values', async () => {
      const updateMock = vi.fn().mockResolvedValue({
        id: 'bap_123',
        isEnabled: false,
        timezone: 'Africa/Addis_Ababa',
        minimumLeadTimeHours: 72,
        mondayEnabled: false,
        tuesdayEnabled: false,
        wednesdayEnabled: false,
        thursdayEnabled: false,
        fridayEnabled: false,
        saturdayEnabled: true,
        sundayEnabled: true,
      });

      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue({ id: 'bap_123' }),
          update: updateMock,
        },
      } as any);

      const result = await businessAvailabilityService.updatePolicy({
        isEnabled: false,
        minimumLeadTimeHours: 72,
      });

      expect(updateMock).toHaveBeenCalledWith({
        where: { id: 'bap_123' },
        data: {
          isEnabled: false,
          minimumLeadTimeHours: 72,
        },
      });
      expect(result.isEnabled).toBe(false);
      expect(result.minimumLeadTimeHours).toBe(72);
    });
  });

  describe('validateOrderDate', () => {
    it('returns ORDERING_DISABLED if policy is disabled', async () => {
      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'bap_123',
            isEnabled: false,
            timezone: 'Africa/Addis_Ababa',
            minimumLeadTimeHours: 24,
            mondayEnabled: true,
            tuesdayEnabled: true,
            wednesdayEnabled: true,
            thursdayEnabled: true,
            fridayEnabled: true,
            saturdayEnabled: true,
            sundayEnabled: true,
          }),
        },
      } as any);

      const result = await businessAvailabilityService.validateOrderDate('2026-12-01');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('ORDERING_DISABLED');
    });

    it('returns DAY_NOT_AVAILABLE if day of week is disabled', async () => {
      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'bap_123',
            isEnabled: true,
            timezone: 'Africa/Addis_Ababa',
            minimumLeadTimeHours: 24,
            mondayEnabled: false,
            tuesdayEnabled: false,
            wednesdayEnabled: false,
            thursdayEnabled: false,
            fridayEnabled: false,
            saturdayEnabled: true,
            sundayEnabled: true,
          }),
        },
      } as any);

      // 2026-11-23 is a Monday
      const result = await businessAvailabilityService.validateOrderDate('2026-11-23T12:00:00Z');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('DAY_NOT_AVAILABLE');
    });

    it('returns DATE_IN_PAST if date is in the past', async () => {
      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'bap_123',
            isEnabled: true,
            timezone: 'Africa/Addis_Ababa',
            minimumLeadTimeHours: 24,
            mondayEnabled: true,
            tuesdayEnabled: true,
            wednesdayEnabled: true,
            thursdayEnabled: true,
            fridayEnabled: true,
            saturdayEnabled: true,
            sundayEnabled: true,
          }),
        },
      } as any);

      const result = await businessAvailabilityService.validateOrderDate('2020-01-01T12:00:00Z');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('DATE_IN_PAST');
    });

    it('returns MINIMUM_LEAD_TIME_NOT_MET if date does not meet lead time hours', async () => {
      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'bap_123',
            isEnabled: true,
            timezone: 'Africa/Addis_Ababa',
            minimumLeadTimeHours: 48,
            mondayEnabled: true,
            tuesdayEnabled: true,
            wednesdayEnabled: true,
            thursdayEnabled: true,
            fridayEnabled: true,
            saturdayEnabled: true,
            sundayEnabled: true,
          }),
        },
      } as any);

      // 1 hour in the future
      const tooSoon = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();
      const result = await businessAvailabilityService.validateOrderDate(tooSoon);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('MINIMUM_LEAD_TIME_NOT_MET');
    });

    it('returns valid: true for a valid date meeting lead time on an enabled day', async () => {
      mockGetPrisma.mockReturnValue({
        businessAvailabilityPolicy: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'bap_123',
            isEnabled: true,
            timezone: 'Africa/Addis_Ababa',
            minimumLeadTimeHours: 24,
            mondayEnabled: true,
            tuesdayEnabled: true,
            wednesdayEnabled: true,
            thursdayEnabled: true,
            fridayEnabled: true,
            saturdayEnabled: true,
            sundayEnabled: true,
          }),
        },
      } as any);

      // 7 days in future
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const result = await businessAvailabilityService.validateOrderDate(futureDate);
      expect(result.valid).toBe(true);
    });
  });
});

