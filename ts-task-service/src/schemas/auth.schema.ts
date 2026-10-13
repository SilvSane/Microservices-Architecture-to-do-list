import { z } from 'zod';

export const tokenPayloadSchema = z.object({
  sub: z.number().int().positive(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
