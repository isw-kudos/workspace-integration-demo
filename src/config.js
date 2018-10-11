import dotenv from 'dotenv';
dotenv.config();

export default {
  port: 3000,
  appId: process.env.APP_ID,
  secret: process.env.APP_SECRET,
  redirectUri: process.env.REDIRECT_URI,
};
