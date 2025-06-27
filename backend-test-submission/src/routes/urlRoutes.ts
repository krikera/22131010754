import { Router, Request, Response } from 'express';
import { urlService } from '../services/UrlService';
import { CreateUrlRequest } from '../models/UrlModel';
import logger from '../utils/logger';

const router = Router();
router.post('/', async (req: Request, res: Response) => {
  try {
    logger.Log('backend', 'info', 'controller', 'Creating short URL');

    const data: CreateUrlRequest = req.body;

    if (!data.url) {
      logger.Log('backend', 'error', 'controller', 'Missing URL in request');
      return res.status(400).json({
        error: 'Missing URL',
        message: 'URL is required'
      });
    }

    const hostname = req.get('host') || 'localhost:8080';
    const result = await urlService.createShortUrl(data, hostname);
logger.Log('backend', 'info', 'controller', 'URL created');
    res.status(201).json(result);

  } catch (error: any) {
    logger.Log('backend', 'error', 'controller', `Failed to create URL: ${error.message}`);
    res.status(400).json({
      error: 'Creation failed',
      message: error.message
    });
  }
});
router.get('/:shortcode', async (req: Request, res: Response) => {
  try {
    const { shortcode } = req.params;
    logger.Log('backend', 'info', 'controller', `Getting stats for ${shortcode}`);

if (!shortcode) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Shortcode required'
      });
    }

    const stats = await urlService.getUrlStats(shortcode);
    res.json(stats);

  } catch (error: any) {
    logger.Log('backend', 'error', 'controller', `Stats error: ${error.message}`);
    
    if (error.message === 'Shortcode not found') {
      res.status(404).json({
        error: 'Not found',
        message: 'Shortcode does not exist'
      });
    } else {
      res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
});
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.Log('backend', 'info', 'controller', 'Listing all URLs');
    const urls = await urlService.getAllUrls();
    res.json(urls);

  } catch (error: any) {
    logger.Log('backend', 'error', 'controller', `List error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to get URLs',
      message: error.message
    });
  }
});
export { router as urlRouter }; 