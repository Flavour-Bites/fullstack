import { businessAvailabilityRepository } from './businessAvailability.repository';

export interface AvailabilityPolicy {
  isEnabled: boolean;
  timezone: string;
  minimumLeadTimeHours: number;
  mondayEnabled: boolean;
  tuesdayEnabled: boolean;
  wednesdayEnabled: boolean;
  thursdayEnabled: boolean;
  fridayEnabled: boolean;
  saturdayEnabled: boolean;
  sundayEnabled: boolean;
}

export interface AvailabilityResponse {
  isEnabled: boolean;
  timezone: string;
  minimumLeadTimeHours: number;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

async function getPolicy(): Promise<{
  isEnabled: boolean;
  timezone: string;
  minimumLeadTimeHours: number;
  mondayEnabled: boolean;
  tuesdayEnabled: boolean;
  wednesdayEnabled: boolean;
  thursdayEnabled: boolean;
  fridayEnabled: boolean;
  saturdayEnabled: boolean;
  sundayEnabled: boolean;
}> {
  const policy = await businessAvailabilityRepository.findFirst();
  
  if (!policy) {
    return {
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
    };
  }
  
  return {
    isEnabled: policy.isEnabled,
    timezone: policy.timezone,
    minimumLeadTimeHours: policy.minimumLeadTimeHours,
    mondayEnabled: policy.mondayEnabled,
    tuesdayEnabled: policy.tuesdayEnabled,
    wednesdayEnabled: policy.wednesdayEnabled,
    thursdayEnabled: policy.thursdayEnabled,
    fridayEnabled: policy.fridayEnabled,
    saturdayEnabled: policy.saturdayEnabled,
    sundayEnabled: policy.sundayEnabled,
  };
}

export interface DateValidationResult {
  valid: boolean;
  normalizedDate?: string;
  error?: string;
  errorCode?: string;
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

function parseDateComponents(input: string): { year: number; month: number; day: number; originalDate?: Date } | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();
  if (!clean) return null;

  // 1. ISO YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  if (isoMatch) {
    const year = Number.parseInt(isoMatch[1], 10);
    const month = Number.parseInt(isoMatch[2], 10);
    const day = Number.parseInt(isoMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day, originalDate: new Date(clean) };
    }
  }

  // 2. Month Day, Year (e.g. "July 15, 2026", "jul 15 2026", "July 15th, 2026")
  const mdyMatch = clean.toLowerCase().match(/^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);
  if (mdyMatch && MONTH_NAMES[mdyMatch[1]]) {
    const month = MONTH_NAMES[mdyMatch[1]];
    const day = Number.parseInt(mdyMatch[2], 10);
    const year = Number.parseInt(mdyMatch[3], 10);
    if (day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  // 3. Day Month Year (e.g. "15 July 2026", "15th July, 2026")
  const dmyMatch = clean.toLowerCase().match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+),?\s+(\d{4})$/);
  if (dmyMatch && MONTH_NAMES[dmyMatch[2]]) {
    const day = Number.parseInt(dmyMatch[1], 10);
    const month = MONTH_NAMES[dmyMatch[2]];
    const year = Number.parseInt(dmyMatch[3], 10);
    if (day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  // 4. Fallback to standard JS Date parsing
  const parsed = new Date(clean);
  if (!Number.isNaN(parsed.getTime())) {
    if (clean.includes('T') || clean.endsWith('Z')) {
      return {
        year: parsed.getUTCFullYear(),
        month: parsed.getUTCMonth() + 1,
        day: parsed.getUTCDate(),
        originalDate: parsed,
      };
    }
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
      originalDate: parsed,
    };
  }

  return null;
}

export const businessAvailabilityService = {
  async getPolicy() {
    return getPolicy();
  },

  async getAvailabilityResponse() {
    const policy = await getPolicy();
    
    return {
      isEnabled: policy.isEnabled,
      timezone: policy.timezone,
      minimumLeadTimeHours: policy.minimumLeadTimeHours,
      days: {
        monday: policy.mondayEnabled,
        tuesday: policy.tuesdayEnabled,
        wednesday: policy.wednesdayEnabled,
        thursday: policy.thursdayEnabled,
        friday: policy.fridayEnabled,
        saturday: policy.saturdayEnabled,
        sunday: policy.sundayEnabled,
      },
    };
  },

  async updatePolicy(input: {
    isEnabled?: boolean;
    timezone?: string;
    minimumLeadTimeHours?: number;
    mondayEnabled?: boolean;
    tuesdayEnabled?: boolean;
    wednesdayEnabled?: boolean;
    thursdayEnabled?: boolean;
    fridayEnabled?: boolean;
    saturdayEnabled?: boolean;
    sundayEnabled?: boolean;
  }) {
    const existing = await businessAvailabilityRepository.findFirst();
    
    if (!existing) {
      throw new Error('Business availability policy not found');
    }
    
    const updated = await businessAvailabilityRepository.update(existing.id, {
      ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
      ...(input.timezone !== undefined && { timezone: input.timezone }),
      ...(input.minimumLeadTimeHours !== undefined && { minimumLeadTimeHours: input.minimumLeadTimeHours }),
      ...(input.mondayEnabled !== undefined && { mondayEnabled: input.mondayEnabled }),
      ...(input.tuesdayEnabled !== undefined && { tuesdayEnabled: input.tuesdayEnabled }),
      ...(input.wednesdayEnabled !== undefined && { wednesdayEnabled: input.wednesdayEnabled }),
      ...(input.thursdayEnabled !== undefined && { thursdayEnabled: input.thursdayEnabled }),
      ...(input.fridayEnabled !== undefined && { fridayEnabled: input.fridayEnabled }),
      ...(input.saturdayEnabled !== undefined && { saturdayEnabled: input.saturdayEnabled }),
      ...(input.sundayEnabled !== undefined && { sundayEnabled: input.sundayEnabled }),
    });
    
    return {
      isEnabled: updated.isEnabled,
      timezone: updated.timezone,
      minimumLeadTimeHours: updated.minimumLeadTimeHours,
      mondayEnabled: updated.mondayEnabled,
      tuesdayEnabled: updated.tuesdayEnabled,
      wednesdayEnabled: updated.wednesdayEnabled,
      thursdayEnabled: updated.thursdayEnabled,
      fridayEnabled: updated.fridayEnabled,
      saturdayEnabled: updated.saturdayEnabled,
      sundayEnabled: updated.sundayEnabled,
    };
  },

  async validateOrderDate(eventDate: string): Promise<DateValidationResult> {
    const policy = await this.getPolicy();
    
    if (!policy.isEnabled) {
      return { valid: false, error: 'Ordering is currently disabled. Please check back later.', errorCode: 'ORDERING_DISABLED' };
    }
    
    const components = parseDateComponents(eventDate);
    if (!components) {
      return { valid: false, error: 'Invalid date format', errorCode: 'INVALID_DATE' };
    }

    const normalizedDate = `${components.year}-${String(components.month).padStart(2, '0')}-${String(components.day).padStart(2, '0')}`;
    const utcDate = new Date(Date.UTC(components.year, components.month - 1, components.day, 12, 0, 0));
    const dayOfWeek = utcDate.getUTCDay();
    
    const isEnabled = (() => {
      switch (dayOfWeek) {
        case 0: return policy.sundayEnabled;
        case 1: return policy.mondayEnabled;
        case 2: return policy.tuesdayEnabled;
        case 3: return policy.wednesdayEnabled;
        case 4: return policy.thursdayEnabled;
        case 5: return policy.fridayEnabled;
        case 6: return policy.saturdayEnabled;
        default: return false;
      }
    })();
    
    if (!isEnabled) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[dayOfWeek];
      return { 
        valid: false, 
        error: `Orders for ${dayName} are not currently accepted. Please choose an available day.`, 
        errorCode: 'DAY_NOT_AVAILABLE',
        normalizedDate,
      };
    }
    
    // Check if date is in the past (before start of today in business timezone)
    const now = new Date();
    const todayStart = new Date(now.toLocaleString('en-US', { timeZone: policy.timezone }));
    todayStart.setHours(0, 0, 0, 0);
    
    let requestedDateTime: Date;
    if (components.originalDate && (eventDate.includes('T') || eventDate.endsWith('Z'))) {
      requestedDateTime = components.originalDate;
    } else {
      requestedDateTime = new Date(`${normalizedDate}T00:00:00`);
      if (Number.isNaN(requestedDateTime.getTime())) {
        requestedDateTime = new Date(Date.UTC(components.year, components.month - 1, components.day, 0, 0, 0));
      }
    }
    
    if (requestedDateTime < todayStart) {
      return { 
        valid: false, 
        error: 'The date you entered is in the past. Please choose a future date.', 
        errorCode: 'DATE_IN_PAST',
        normalizedDate,
      };
    }
    
    const minAllowedTime = new Date(Date.now() + policy.minimumLeadTimeHours * 60 * 60 * 1000);
    
    if (requestedDateTime < minAllowedTime) {
      const hours = policy.minimumLeadTimeHours;
      return { 
        valid: false, 
        error: `Minimum notice of ${hours} hours is required. Please choose a later date.`, 
        errorCode: 'MINIMUM_LEAD_TIME_NOT_MET',
        normalizedDate,
      };
    }
    
    return { valid: true, normalizedDate };
  },
};