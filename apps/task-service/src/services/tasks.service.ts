import * as tasksStore from '../store/tasks.store';
import { AppError, assertExists } from '@todo/shared';
import { Task, UpdateTaskInput } from '../schemas/task.schema';

export function listTasks(userId: number): Task[] {
  return tasksStore.findAllByUser(userId);
}

export function createTask(userId: number, title: string): Task {
  if (!title?.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Title is required!');
  }
  return tasksStore.create(userId, title);
}

export function getTask(userId: number, id: number): Task {
  const task = tasksStore.findById(id);
  if (!task || task.userId !== userId) {
    throw new AppError(404, 'NOT_FOUND', 'Task not found!');
  }
  return task;
}

export function updateTask(userId: number, id: number, patch: UpdateTaskInput): Task {
  const task = getTask(userId, id);
  const updated = tasksStore.update(task.id, patch);
  return assertExists(updated, 'Task update failed!');
}

export function deleteTask(userId: number, id: number): void {
  const task = getTask(userId, id);
  tasksStore.remove(task.id);
}
