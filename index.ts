import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import router from './routes';
dotenv.config();

const app = express();
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || origin.startsWith('http://localhost')) {
        return callback(null, true);
      }
      const allowed = ['https://ai-app-client.onrender.com'];
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(router);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
