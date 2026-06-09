FROM node:20-alpine

WORKDIR /app

# We don't copy the code in the Dockerfile for development
# because we rely on docker-compose volume mounts to sync changes live.

# Expose port and start Next.js using the mounted node_modules
EXPOSE 3000
CMD ["npm", "run", "dev"]
