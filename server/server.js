import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js'
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import serverless from 'serverless-http';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// DB connection
await connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Server is connected');
});

app.use('/api/inngest', serve({ client: inngest, functions }));

// Export as serverless function for Vercel
export default serverless(app);
