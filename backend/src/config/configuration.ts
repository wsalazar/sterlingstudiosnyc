import { Dropbox } from 'dropbox'

export default () => ({
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  auth: {
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    jwtSecret: process.env.JWT_SECRET,
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  token: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  s3: {
    awsRegion: process.env.AWS_REGION,
    awsId: process.env.AWS_ACCESS_KEY_ID,
    awsAccess: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
  },
  dropbox: {
    appKey: process.env.DROPBOX_APP_KEY,
    appSecret: process.env.DROPBOX_APP_SECRET,
    oauthUrl: process.env.DROPBOX_OAUTH_URL,
  },
})
