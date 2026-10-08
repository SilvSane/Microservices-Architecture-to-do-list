export interface Task {
  id: number;
  userId: number;
  title: string;
  done: boolean;
  createdAt: string;
}

export type CreateTaskInput = Pick<Task, 'title'>;
export type UpdateTaskInput = Pick<Task, 'title' | 'done'>;
