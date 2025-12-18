# Security & Resiliency Improvements

This document outlines the security and resiliency improvements made to the Express server.

## Security Enhancements

### 1. HTTP Security Headers (Helmet)
- **Content Security Policy (CSP)**: Restricts content sources to prevent XSS attacks
- **Strict-Transport-Security**: Forces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME-sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables XSS filtering in browsers

### 2. Rate Limiting
- Limits each IP to 100 requests per 15-minute window
- Prevents DDoS attacks and brute force attempts
- Applied specifically to the `/graphql` endpoint
- Returns standard rate limit headers for client awareness

### 3. Request Size Limits
- JSON payloads limited to 1MB
- URL-encoded payloads limited to 1MB
- Prevents memory exhaustion attacks from large payloads

### 4. CORS Configuration
- Properly configured CORS with method restrictions
- Development mode allows all origins
- Production mode uses CORS_ORIGINS environment variable (comma-separated list)
- Falls back to no origins in production if CORS_ORIGINS not set
- Credentials support enabled

### 5. Error Handling
- Centralized error handling middleware
- Production mode hides sensitive error details
- Proper error logging for debugging
- 404 handler for undefined routes
- Prevents "Cannot set headers after they are sent" errors by checking if headers were already sent

## Resiliency Enhancements

### 1. Graceful Shutdown
- Handles SIGTERM and SIGINT signals
- Allows in-flight requests to complete
- 10-second timeout for forced shutdown
- Proper cleanup before process exit

### 2. Uncaught Exception Handling
- Catches uncaught exceptions and rejections
- Logs errors for debugging
- Triggers graceful shutdown to prevent hanging

### 3. Server Timeouts
- Keep-alive timeout: 65 seconds
- Headers timeout: 66 seconds (prevents request smuggling)
- Prevents long-running requests from hanging

### 4. Health Check Endpoint
- `/health` endpoint for monitoring
- Returns server status, uptime, and timestamp
- Useful for load balancers and orchestration tools

### 5. Request Logging
- Logs all incoming requests with timestamp, method, path, and IP
- Helps with debugging and security auditing
- Can be enhanced with more sophisticated logging libraries

### 6. Compression
- Enables gzip compression for responses
- Reduces bandwidth usage
- Improves performance for clients

## Configuration

### Environment Variables
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment mode (development/production)
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins (e.g., `https://example.com,https://app.example.com`)

### Recommendations for Production

1. **Set NODE_ENV**: `NODE_ENV=production`
2. **Configure CORS**: Set `CORS_ORIGINS` environment variable with specific allowed origins (e.g., `CORS_ORIGINS=https://example.com,https://app.example.com`)
3. **Use HTTPS**: Deploy behind a reverse proxy with TLS/SSL
4. **Adjust Rate Limits**: Fine-tune based on expected traffic
5. **Add Monitoring**: Integrate with APM tools (e.g., New Relic, DataDog)
6. **Use Process Manager**: Deploy with PM2 or similar for auto-restart
7. **Add Request ID**: Track requests across services
8. **Implement Audit Logging**: Track security-relevant events
9. **Add Authentication**: Implement authentication for sensitive endpoints
10. **Regular Security Audits**: Run `npm audit` regularly

## Testing

The server has been tested for:
- ✅ Health check endpoint functionality
- ✅ GraphQL endpoint functionality
- ✅ Security headers presence
- ✅ Rate limiting headers
- ✅ Request logging
- ✅ Graceful shutdown
- ✅ 404 handling
- ✅ No vulnerabilities in dependencies
