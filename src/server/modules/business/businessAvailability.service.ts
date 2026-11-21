import { getPrisma } from '../../platform/config/prisma';

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
  const prisma = getPrisma();
  let policy = await prisma.businessAvailabilityPolicy.findFirst();
  
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

function getDayOfWeekInTimeZoneSync(date: Date, timeZone: string): number {
  const day = date.toLocaleString('en-US', { timeZone, weekday: 'long' });
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return dayMap[day] ?? date.getDay();
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
    const prisma = getPrisma();
    const existing = await prisma.businessAvailabilityPolicy.findFirst();
    
    if (!existing) {
      throw new Error('Business availability policy not found');
    }
    
    const updated = await prisma.businessAvailabilityPolicy.update({
      where: { id: existing.id },
      data: {
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
      },
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

  async validateOrderDate(eventDate: string): Promise<{ valid: boolean; error?: string; errorCode?: string }> {
    const policy = await this.getPolicy();
    
    if (!policy.isEnabled) {
      return { valid: false, error: 'Ordering is currently disabled. Please check back later.', errorCode: 'ORDERING_DISABLED' };
    }
    
    const requestedDate = new Date(eventDate);
    const dayOfWeek = getDayOfWeekInTimeZoneSync(requestedDate, policy.timezone);
    
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
        errorCode: 'DAY_NOT_AVAILABLE' 
      };
    }
    
    const requestedDateTime = new Date(eventDate);
    
    if (isNaN(requestedDateTime.getTime())) {
      return { valid: false, error: 'Invalid date format', errorCode: 'INVALID_DATE' };
    }
    
    // Check if date is in the past (before start of today in business timezone)
    const now = new Date();
    const todayStart = new Date(now.toLocaleString('en-US', { timeZone: policy.timezone }));
    todayStart.setHours(0, 0, 0, 0);
    
    if (requestedDateTime < todayStart) {
      return { 
        valid: false, 
        error: 'The date you entered is in the past. Please choose a future date.', 
        errorCode: 'DATE_IN_PAST' 
      };
    }
    
    const minAllowedTime = new Date(Date.now() + policy.minimumLeadTimeHours * 60 * 60 * 1000);
    
    if (requestedDateTime < minAllowedTime) {
      const hours = policy.minimumLeadTimeHours;
      return { 
        valid: false, 
        error: `Minimum notice of ${hours} hours is required. Please choose a later date.`, 
        errorCode: 'MINIMUM_LEAD_TIME_NOT_MET' 
      };
    }
    
    return { valid: true };
  },
};