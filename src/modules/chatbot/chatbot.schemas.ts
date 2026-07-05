import { z } from 'zod';

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.string(),
      text: z.string(),
    }),
  ).min(1),
});
