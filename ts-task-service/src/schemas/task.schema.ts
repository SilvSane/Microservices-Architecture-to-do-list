import { z } from 'zod';

export const taskIdSchema = z.coerce.number().int().positive();

export const taskSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string().trim().min(1).max(1000),
  done: z.boolean(),
  createdAt: z.string(),
});

export const createTaskSchema = taskSchema.pick({ title: true });
export const updateTaskSchema = taskSchema
  .pick({
    title: true,
    done: true,
  })
  .partial();

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
