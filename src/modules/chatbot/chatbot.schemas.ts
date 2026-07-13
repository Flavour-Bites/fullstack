import { z } from 'zod';

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.string(),
      text: z.string().max(2000, 'Message too long. Please keep messages under 2000 characters.'),
    }),
  ).min(1).max(20, 'Too many messages. Please start a new conversation.'),
});
