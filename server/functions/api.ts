import cors from 'cors';
import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import serverless from 'serverless-http';

import * as middlewares from '../middlewares';
import router from '../router';

dotenvConfig();
dotenvConfig({ path: `.env.local`, override: true });

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export const handler = serverless(app);
