export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL!,
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
