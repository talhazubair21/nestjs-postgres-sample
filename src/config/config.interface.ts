interface ApiConfigProps {
  //   API_URL: string;
  //   HTTP_TIMEOUT: number;
  RATE_LIMIT_TTL: number;
  RATE_LIMIT: number;
}

interface DBConfigProps {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_SYNC: boolean;
}

export interface ConfigProps {
  PORT: number;
  NODE_ENV: string;
  JWT_SECRET_KEY: string;
  API: ApiConfigProps;
  DB: DBConfigProps;
}
