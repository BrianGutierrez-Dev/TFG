import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';
import router from './routes';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api', router);

app.use(errorHandler);

export default app;
