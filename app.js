const express = require('express');
const cors = require('cors');
const { errHandler } = require('./helper/handler');
const rateLimit = require('express-rate-limit');
const categoriesRoute = require('./router/categories.route');
const brandRoute = require('./router/brands.route');
const productsRoute = require('./router/products.route');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
})

const corsOptions = {
    origin: 'http://localhost:5173/',
    optionSuccessStatus: 200
}

// Middleware
app.use(express.json());         // lets Express read JSON request bodies
app.use(cors());                 // allows your React frontend to call this API
app.use(limiter)
app.use(cors(corsOptions))

// Routes
app.use('/api/categories', categoriesRoute)
app.use('/api/brand', brandRoute)
app.use('/api/product', productsRoute)

// Error handler (must be registered after the routes)
app.use(errHandler)

module.exports = app;
