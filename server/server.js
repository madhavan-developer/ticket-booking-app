import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import serverless from 'serverless-http';

const app = express();
const port = process.env.PORT || 3000;

// ===== Environment checks =====
if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
  console.warn(
    '⚠️ Clerk keys are missing! Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your .env file.'
  );
}
if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MongoDB URI is missing! Set MONGODB_URI in your .env file.');
}

// ===== Middleware =====
app.use(express.json());
app.use(cors());

// Only use Clerk middleware if keys exist
if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
}

// ===== Connect to DB =====
await connectDB();

// ===== Routes =====
app.get('/', (req, res) => {
  res.send('Server is connected');
});

app.use('/api/inngest', serve({ client: inngest, functions }));

// ===== Local development =====
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
}

// ===== Export for Vercel serverless =====
export default serverless(app);
