import { configDotenv } from 'dotenv';
import { assertExists } from '@todo/shared';

configDotenv();

export const JWT_SECRET = assertExists(process.env.JWT_SECRET, 'JWT environment error!');
export const PORT = process.env.PORT || 3002;
