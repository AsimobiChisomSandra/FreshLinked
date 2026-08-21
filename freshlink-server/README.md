# FreshLink Server

Lightweight Express + Mongoose API for FreshLink MVP.

Quick start

1. Install deps: `npm install`
2. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
3. Run in dev: `npm run dev`

Endpoints
- `POST /api/auth/register` - register
- `POST /api/auth/login` - login
- `GET /api/products` - list products (filters via query)
- `POST /api/products` - create product (seller)
- `POST /api/orders` - create order (buyer)
