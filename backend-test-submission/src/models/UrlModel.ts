
export interface ClickData {
  timestamp: string;
  referrer: string;
  ipAddress: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
}

export interface ShortUrl {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  clickCount: number;
  clicks: ClickData[];
}

export interface CreateUrlRequest{
  url: string;
  validity?: number;
  shortcode?: string;
}
export interface CreateUrlResponse {
  shortLink: string;
  expiry: string;
}
export interface UrlStatsResponse {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  clickCount: number;
  clicks: ClickData[];
} 