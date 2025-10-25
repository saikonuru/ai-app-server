import cors, {type CorsOptions} from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import router from './routes';
dotenv.config();

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(router);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
