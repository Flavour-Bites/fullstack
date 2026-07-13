const ADDIS_ABABA_TZ = 'Africa/Addis_Ababa';

export function formatRequestDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: ADDIS_ABABA_TZ,
  });
}
