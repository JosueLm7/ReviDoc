FROM n8nio/n8n:latest

USER root

# Install additional packages if needed
RUN apk add --no-cache \
    curl \
    jq

# Copy custom workflows
COPY workflows/ /home/node/.n8n/workflows/

# Set proper permissions
RUN chown -R node:node /home/node/.n8n/

USER node

# Expose n8n port
EXPOSE 5678

# Start n8n
CMD ["n8n", "start"]
