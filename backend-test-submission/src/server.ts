import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { urlRouter } from './routes/urlRoutes';
import { redirectRouter } from './routes/redirectRoutes';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 8080;
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(morgan('combined')); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/shorturls', urlRouter);
app.use('/', redirectRouter); 

app.get('/health', async (req, res) => {
  logger.Log('backend', 'info', 'route', 'Health check');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.Log('backend', 'error', 'middleware', `Oops: ${err.message}`);
  res.status(500).json({
    error: 'Something went wrong',
    message: err.message
  });
});
app.use('/api/*', (req, res) => {
  logger.Log('backend', 'warn', 'route', `Unknown API route: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});
app.listen(PORT, () => {
  logger.Log('backend', 'info', 'config', `server started on port ${PORT}`);
  console.log(`serVer running on the port ${PORT}`);
});

export { logger }; 