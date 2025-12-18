import { buildSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';

// Environment configuration
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
    type Book {
      id: ID!
      title: String!
      author: Author!
    }

    type Author {
      name: String!
      dateOfBirth: String!
    }

    type Query {
      favoriteBook: Book!
    }
`);

const root = {
    favoriteBook() {
        return {
            id: 3,
            title: 'Fantastic Mr. Fox',
            author: {
                name: 'Roald Dahl',
                dateOfBirth: '13th September 1916',
            },
        };
    },
};

const app = express();

// Security: Set security headers with Helmet
// Note: In production, consider using nonces/hashes instead of 'unsafe-inline'
// for better XSS protection. This requires coordination with your frontend build.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // TODO: Replace with nonces in production
                styleSrc: ["'self'", "'unsafe-inline'"], // TODO: Replace with nonces in production
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
            },
        },
        crossOriginEmbedderPolicy: false, // Allow embedding for static assets
    }),
);

// Security: Enable CORS with proper configuration
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : NODE_ENV === 'production'
      ? []
      : ['*'];

app.use(
    cors({
        origin: allowedOrigins.length === 0 ? false : allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    }),
);

// Performance: Enable compression
app.use(compression());

// Security: Request size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security: Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/graphql', limiter);

// Basic request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Serve static frontend files
app.use('/', express.static('frontend/dist'));

// GraphQL endpoint
app.all(
    '/graphql',
    createHandler({
        schema: schema,
        rootValue: root,
    }),
);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }
    
    res.status(err.status || 500).json({
        error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Running a GraphQL API server at http://localhost:${PORT}/graphql`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`Environment: ${NODE_ENV}`);
});

// Configure server timeouts
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds (slightly more than keepAliveTimeout)

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    server.close(() => {
        console.log('Server closed. Exiting process.');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
