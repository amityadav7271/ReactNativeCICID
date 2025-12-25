import Config from 'react-native-config';

// Environment configuration with fallbacks
export const environment = {
  // API Configuration
  API_BASE_URL: Config.API_BASE_URL || 'https://api.example.com',
  API_TIMEOUT: parseInt(Config.API_TIMEOUT || '15000', 10),
  
  // Retry Configuration
  MAX_RETRIES: parseInt(Config.MAX_RETRIES || '3', 10),
  RETRY_DELAY: parseInt(Config.RETRY_DELAY || '1000', 10),
  
  // Cache Configuration
  CACHE_DURATION: parseInt(Config.CACHE_DURATION || '300', 10), // 5 minutes
  
  // Development flags
  IS_DEV: __DEV__,
  ENABLE_LOGGING: Config.ENABLE_LOGGING === 'true' || __DEV__,
  ENABLE_REDUX_DEVTOOLS: Config.ENABLE_REDUX_DEVTOOLS === 'true' || __DEV__,
  
  // Feature flags
  ENABLE_OFFLINE_MODE: Config.ENABLE_OFFLINE_MODE === 'true',
  ENABLE_ANALYTICS: Config.ENABLE_ANALYTICS === 'true',
};

// Validate required environment variables
const requiredEnvVars = ['API_BASE_URL'];

export const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(key => !Config[key]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    
    if (!__DEV__) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

// Initialize environment validation
validateEnvironment();