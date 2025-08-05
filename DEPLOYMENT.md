# Deployment Guide for Care Point API

## Overview
This guide helps you deploy the Care Point API to Render and troubleshoot common deployment issues.

## Prerequisites
- Node.js 20.10.0 or higher
- MongoDB database (MongoDB Atlas recommended)
- Redis instance (Redis Cloud recommended)

## Environment Variables
Set these environment variables in your Render dashboard:

### Required
- `NODE_ENV`: `production`
- `PORT`: `3000` (or your preferred port)
- `MONGODB_URI`: Your MongoDB connection string
- `REDIS_HOST`: Your Redis host
- `REDIS_PASSWORD`: Your Redis password (if required)

### Optional
- `NODE_OPTIONS`: `--max-old-space-size=4096`
- `CORS_URL`: Your frontend URL
- `TOKEN_ISSUER`: JWT issuer
- `TOKEN_AUDIENCE`: JWT audience
- `ACCESS_TOKEN_VALIDITY_SEC`: Access token validity in seconds
- `REFRESH_TOKEN_VALIDITY_SEC`: Refresh token validity in seconds

## Deployment Steps

### 1. Using Render Dashboard
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Select your repository
4. Configure the service:
   - **Build Command**: `npm run build-prod`
   - **Start Command**: `npm run start-prod`
   - **Environment**: Node
   - **Health Check Path**: `/health`

### 2. Using render.yaml (Recommended)
1. Push the `render.yaml` file to your repository
2. Render will automatically detect and use this configuration

## Troubleshooting

### Module Not Found Errors
If you encounter "Cannot find module 'dotenv/config'" errors:

1. **The issue has been fixed**: `dotenv` is now in production dependencies
2. **Use the simplified start command**: `npm run start-prod` (no dotenv required)
3. **Environment variables**: Set them directly in Render dashboard instead of using .env files

### Memory Issues During Build
If you encounter "JavaScript heap out of memory" errors:

1. **Use the emergency build script**:
   ```bash
   npm run build-emergency
   ```

2. **Increase memory allocation**:
   - Set `NODE_OPTIONS=--max-old-space-size=8192` in environment variables
   - Use the `build-prod` script instead of `build`

3. **Optimize TypeScript compilation**:
   - The `tsconfig.json` has been optimized with `incremental: true`
   - Skip library checks with `--skipLibCheck`

### Port Issues
If Render can't detect your port:

1. Ensure your app listens on `process.env.PORT`:
   ```typescript
   const port = process.env.PORT || 3000;
   app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });
   ```

2. Check that the port is exposed in your Dockerfile:
   ```dockerfile
   EXPOSE 3000
   ```

### Health Check Failures
If health checks fail:

1. Verify the health endpoint is accessible:
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. Check application logs in Render dashboard

3. Ensure the health endpoint returns a 200 status:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.456,
     "environment": "production"
   }
   ```

### Database Connection Issues
If your app can't connect to MongoDB:

1. Verify your `MONGODB_URI` is correct
2. Ensure your MongoDB instance allows connections from Render's IP ranges
3. Check that your database user has the correct permissions

### Build Failures
If the build process fails:

1. **Run deployment check**:
   ```bash
   npm run deploy-check
   ```

2. **Check for TypeScript errors locally**:
   ```bash
   npm run check
   ```

3. **Verify all dependencies are installed**:
   ```bash
   npm install
   ```

## Performance Optimization

### Memory Management
- The app is configured to use up to 4GB of memory
- TypeScript compilation is optimized for memory usage
- Incremental compilation is enabled

### Build Optimization
- Multi-stage Docker build reduces final image size
- Only production dependencies are included in the final image
- Source maps are generated for debugging

## Monitoring

### Health Checks
- Health endpoint: `GET /health`
- Returns application status and uptime
- Used by Render for automatic health monitoring

### Logs
- Application logs are available in Render dashboard
- Winston logger is configured for structured logging
- Error tracking is available through New Relic integration

## Rollback Strategy
If deployment fails:

1. Use the emergency build script: `npm run build-emergency`
2. Check the previous successful deployment in Render dashboard
3. Rollback to the last working version if necessary

## Support
For additional help:
1. Check Render's troubleshooting guide: https://render.com/docs/troubleshooting-deploys
2. Review application logs in Render dashboard
3. Use the deployment check script: `npm run deploy-check` 