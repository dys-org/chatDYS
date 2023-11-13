import cors from 'cors';
import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import OpenAI from 'openai';

import * as middlewares from './middlewares';
import router from './router';

dotenvConfig();
dotenvConfig({ path: `.env.local`, override: true });

const port = process.env.API_PORT || 3000;
const app = express();
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
