import { AvailabilityResponse } from '@shared/types';
const x: AvailabilityResponse = {
  isEnabled: true,
  timezone: 'Africa/Addis_Ababa',
  minimumLeadTimeHours: 24,
  days: { monday: true, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: true, sunday: true }
};
console.log(x);
