export const timeSlots = ['morning', 'afternoon', 'any'] as const;
export type TimeSlot = (typeof timeSlots)[number];
