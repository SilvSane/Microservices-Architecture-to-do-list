import { Request, Response, NextFunction } from 'express';
import * as tasksService from '../services/tasks.service';
import { assertExists } from '@todo/shared';
import { createTaskSchema, taskIdSchema, updateTaskSchema } from '../schemas/task.schema';

function getAuthedUserId(req: Request): number {
  return assertExists(req.userId, 'Unidentified user!');
}

export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = getAuthedUserId(req);
    const tasks = tasksService.listTasks(userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export function getOne(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = getAuthedUserId(req);
    const taskId = taskIdSchema.parse(req.params.id);
    const task = tasksService.getTask(userId, taskId);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = getAuthedUserId(req);
    const validatedBody = createTaskSchema.parse(req.body);
    const task = tasksService.createTask(userId, validatedBody.title);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = getAuthedUserId(req);
    const taskId = taskIdSchema.parse(req.params.id);
    const validatedBody = updateTaskSchema.parse(req.body);
    const updated = tasksService.updateTask(userId, taskId, validatedBody);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export function remove(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = getAuthedUserId(req);
    const taskId = taskIdSchema.parse(req.params.id);
    tasksService.deleteTask(userId, taskId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
