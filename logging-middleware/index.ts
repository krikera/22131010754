import axios from 'axios';

type Stack = 'backend' | 'frontend';
type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';
type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';
type Package = BackendPackage | FrontendPackage | SharedPackage;
interface LogConfig{
  baseUrl?: string;
  authToken?: string;
}

interface LogResponse{
  logID: string;
  message: string;
}

class Logger{
  private baseUrl: string;
  private authToken: string | null;

  constructor(config: LogConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://20.244.56.144/evaluation-service';
    this.authToken = config.authToken || null;
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

private validatePackageForStack(stack: Stack, packageName: Package): void {
    const backendOnly: BackendPackage[] = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
    const frontendOnly: FrontendPackage[] = ['api', 'component', 'hook', 'page', 'state', 'style'];

    if (stack === 'backend' && frontendOnly.includes(packageName as FrontendPackage)) {
      throw new Error(`Package "${packageName}" is frontend only`);
    }

    if (stack === 'frontend' && backendOnly.includes(packageName as BackendPackage)) {
      throw new Error(`Package "${packageName}" is backend only`);
    }
  }

  private logToConsole(level: Level, packageName: Package, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()} [${packageName}] ${message}`);
  }

  async debug(stack: Stack, packageName: Package, message: string): Promise<string | null> {
    return this.Log(stack, 'debug', packageName, message);
  }
  async info(stack: Stack, packageName: Package, message: string): Promise<string | null> {
    return this.Log(stack, 'info', packageName, message);
  }

  async warn(stack: Stack, packageName: Package, message: string): Promise<string | null> {
    return this.Log(stack, 'warn', packageName, message);
  }

  async error(stack: Stack, packageName: Package, message: string): Promise<string | null> {
    return this.Log(stack, 'error', packageName, message);
  }

  async fatal(stack: Stack, packageName: Package, message: string): Promise<string | null> {
    return this.Log(stack, 'fatal', packageName, message);
  }
}
export default Logger;
export const logger = new Logger();