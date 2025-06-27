import { Router, Request, Response } from 'express';
import { urlService } from '../services/UrlService';
import logger from '../utils/logger';

const router = Router();
router.get('/:shortcode', async (req: Request, res: Response) => {
  try {
    const { shortcode } = req.params;
    logger.Log('backend', 'info', 'controller', `Redirecting ${shortcode}`);
    if (!shortcode) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Shortcode required'
      });
    }

    const originalUrl = await urlService.handleRedirect(shortcode, req);
    res.redirect(302, originalUrl);

  } catch (error: any) {
    logger.Log('backend', 'error', 'controller', `Redirect failed: ${error.message}`);

    if (error.message === 'Shortcode not found') {
      res.status(404).json({
        error: 'Not found',
        message: 'Short URL not found'
      });
    } else if (error.message === 'Short URL has expired') {
      res.status(410).json({
        error: 'Expired',
        message: 'Short URL has expired'
      });
    } else {
      res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
});
export { router as redirectRouter }; 