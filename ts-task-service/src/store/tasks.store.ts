import { Task, UpdateTaskInput } from '../types/task';

const tasks: Task[] = [];
let nextId = 1;

export function findAllByUser(userId: number): Task[] {
  return tasks.filter((t) => t.userId === userId);
}

export function findById(id: number): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function create(userId: number, title: string): Task {
  const task: Task = {
    id: nextId++,
    userId,
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

export function update(id: number, patch: UpdateTaskInput): Task | null {
  const task = findById(id);
  if (!task) return null;
  Object.assign(task, patch);
  return task;
}

export function remove(id: number): boolean {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}
