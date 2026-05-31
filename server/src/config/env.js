const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/cinezone',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  vidapiBaseUrl: process.env.VIDAPI_BASE_URL || 'https://vidapi.ru',
  vidapiPlayerBaseUrl: process.env.VIDAPI_PLAYER_BASE_URL || 'https://vidsrc-embed.ru',
  imdb: {
    apiKey: process.env.IMDB_API_KEY || '',
    dataSetId: process.env.IMDB_DATA_SET_ID || '',
    revisionId: process.env.IMDB_REVISION_ID || '',
    assetId: process.env.IMDB_ASSET_ID || '',
    region: process.env.AWS_REGION || 'us-east-1'
  }
};
