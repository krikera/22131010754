import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import geoip from 'geoip-lite';
import { ShortUrl, CreateUrlRequest, CreateUrlResponse, UrlStatsResponse, ClickData } from '../models/UrlModel';
import logger from '../utils/logger';

class UrlService {
  private urls: Map<string, ShortUrl> = new Map(); // simple in-memory storage for now

  async createShortUrl(request: CreateUrlRequest, hostname: string): Promise<CreateUrlResponse> {
    logger.Log('backend', 'info', 'service', 'Creating short URL');

    // basic URL validation
    if (!validator.isURL(request.url)) {
      logger.Log('backend', 'error', 'service', 'Invalid URL');
      throw new Error('Invalid URL format');
    }

    const validityMinutes = request.validity || 30; // default 30 mins
    
    const now = new Date();
    const expiryDate = new Date(now.getTime() + validityMinutes * 60 * 1000);

    let shortcode = request.shortcode;
    
    if (shortcode) {
      // check custom shortcode
      if (!/^[a-zA-Z0-9]+$/.test(shortcode) || shortcode.length > 20) {
        throw new Error('Invalid shortcode format');
      }
      
      if (this.urls.has(shortcode)) {
        throw new Error('Shortcode already exists');
      }
    } else {
      // generate random shortcode
      shortcode = this.generateShortcode();
      while (this.urls.has(shortcode)) {
        shortcode = this.generateShortcode(); // keep trying until unique
      }
    }

    const shortUrl: ShortUrl = {
      shortcode,
      originalUrl: request.url,
      createdAt: now.toISOString(),
      expiresAt: expiryDate.toISOString(),
      clickCount: 0,
      clicks: []
    };

    this.urls.set(shortcode, shortUrl);
    logger.Log('backend', 'info', 'service', `Created: ${shortcode}`);

    return {
      shortLink: `http://${hostname}/${shortcode}`,
      expiry: expiryDate.toISOString()
    };
  }

  async getUrlStats(shortcode: string): Promise<UrlStatsResponse> {
    const shortUrl = this.urls.get(shortcode);
    if (!shortUrl) {
      throw new Error('Shortcode not found');
    }

    return {
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      createdAt: shortUrl.createdAt,
      expiresAt: shortUrl.expiresAt,
      clickCount: shortUrl.clickCount,
      clicks: shortUrl.clicks
    };
  }

  async handleRedirect(shortcode: string, req: any): Promise<string> {
    const shortUrl = this.urls.get(shortcode);
    if (!shortUrl) {
      throw new Error('Shortcode not found');
    }

    // check if expired
    if (new Date() > new Date(shortUrl.expiresAt)) {
      throw new Error('Short URL has expired');
    }

    // track the click
    const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const geo = geoip.lookup(clientIP);

    const clickData: ClickData = {
      timestamp: new Date().toISOString(),
      referrer: req.get('Referrer') || 'Direct',
      ipAddress: clientIP,
      location: {
        country: geo?.country || 'Unknown',
        region: geo?.region || 'Unknown', 
        city: geo?.city || 'Unknown'
      }
    };

    shortUrl.clicks.push(clickData);
    shortUrl.clickCount++;

    logger.Log('backend', 'info', 'service', `Redirect: ${shortcode} -> ${shortUrl.originalUrl}`);
    return shortUrl.originalUrl;
  }

  async getAllUrls(): Promise<UrlStatsResponse[]> {
    // just return everything - might want to add pagination later
    return Array.from(this.urls.values()).map(url => ({
      shortcode: url.shortcode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      clickCount: url.clickCount,
      clicks: url.clicks
    }));
  }

  private generateShortcode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    // 6 chars should be enough for now
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const urlService = new UrlService(); 