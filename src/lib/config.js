/**
 * Application Configuration
 * Centralizes environment variable access and validation.
 */

const env = import.meta.env;

// Validate critical variables
const missingVars = [];
if (!env.VITE_API_BASE_URL) missingVars.push('VITE_API_BASE_URL');

if (missingVars.length > 0) {
    console.warn(
        `[App Config] Missing environment variables: ${missingVars.join(', ')}. ` +
        `API calls may fail. Please check your .env file.`
    );
}

export const config = {
    api: {
        baseUrl: (env.VITE_API_BASE_URL && !env.VITE_API_BASE_URL.includes('beta-softnet.com')) 
            ? env.VITE_API_BASE_URL 
            : '',
        timeout: 30000,
    },
    features: {
        devTools: env.VITE_ENABLE_DEV_TOOLS === 'true',
    },
    env: {
        isDev: env.DEV,
        isProd: env.PROD,
        mode: env.MODE,
    }
};
