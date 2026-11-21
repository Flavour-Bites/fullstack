export enum ReviewEventType {
  BakeryOrder = 'Bakery Order',
  Anniversary = 'Anniversary',
  Birthday = 'Birthday',
  Wedding = 'Wedding',
  Corporate = 'Corporate',
  Celebration = 'Celebration',
  Other = 'Other',
}

export enum ReviewRole {
  Customer = 'Customer',
  Host = 'Host',
  Guest = 'Guest',
  EventPlanner = 'Event Planner',
}

export const DEFAULT_REVIEW_EVENT_TYPE = ReviewEventType.BakeryOrder;
export const DEFAULT_REVIEW_ROLE = ReviewRole.Customer;

