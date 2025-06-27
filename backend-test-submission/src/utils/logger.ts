import axios from 'axios';

type Stack = 'backend' | 'frontend';
type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';
type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';
type Package = BackendPackage | FrontendPackage | SharedPackage;

interface LogResponse{
  logID: string;
  message: string;
}

class Logger{
  private baseUrl: string;
  private authToken: string | null;

  constructor() {
    this.baseUrl = 'http://20.244.56.144/evaluation-service';
    this.authToken = null;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async Log(stack: Stack, level: Level, packageName: Package, message: string): Promise<string | null> {
    try {
      if (!this.authToken) {
        this.logToConsole(level, packageName, message);
        return null;
      }

      const response = await axios.post<LogResponse>(
        `${this.baseUrl}/logs`,
        {
          stack,
          level,
          package: packageName,
          message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return response.data.logID;
    } catch (error) {
      this.logToConsole(level, packageName, message);
      return null;
    }
  }

  private logToConsole(level: Level, packageName: Package, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()} [${packageName}] ${message}`);
  }

  // backend-specific shortcuts
  async debug(packageName: BackendPackage | SharedPackage, message: string): Promise<string | null> {
    return this.Log('backend', 'debug', packageName, message);
  }

  async info(packageName: BackendPackage | SharedPackage, message: string): Promise<string | null> {
    return this.Log('backend', 'info', packageName, message);
  }

  async warn(packageName: BackendPackage | SharedPackage, message: string): Promise<string | null> {
    return this.Log('backend', 'warn', packageName, message);
  }

  async error(packageName: BackendPackage | SharedPackage, message: string): Promise<string | null> {
    return this.Log('backend', 'error', packageName, message);
  }

  async fatal(packageName: BackendPackage | SharedPackage, message: string): Promise<string | null> {
    return this.Log('backend', 'fatal', packageName, message);
  }
}

const logger = new Logger();
export default logger; 