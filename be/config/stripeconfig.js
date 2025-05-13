require('dotenv').config();

module.exports = {
  publishableKey: process.env.STRIPE_PUBLIC_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  apiVersion: process.env.API_VERSION
}