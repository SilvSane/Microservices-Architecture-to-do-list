import express, { Request, Response } from 'express';
import { taskRouter } from './routes/task.routes';
import { errorHandler } from './middlewares/errorHandler';
import { PORT } from './config/config';

const app = express();

app.use(express.json());

app.get('/health', (req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    service: 'task-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/', taskRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Task Service started at http://localhost:${PORT}/`);
});
