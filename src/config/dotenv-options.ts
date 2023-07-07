const env = process.env.NODE_ENV || 'development';

const dotEnvOptions = {
  path: `.env.${env}`,
};

export { dotEnvOptions };
