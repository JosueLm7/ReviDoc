#!/bin/bash

# Academic Writing Reviewer - Production Deployment Script
# This script deploys the application to production environment

set -e

echo "🚀 Deploying Academic Writing Reviewer to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Check required environment variables
required_vars=("MONGODB_URI" "JWT_SECRET" "OPENAI_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

# Create production directories
print_status "Creating production directories..."
sudo mkdir -p /opt/academic-reviewer/{logs,uploads,backups,ssl}
sudo chown -R $USER:$USER /opt/academic-reviewer

# Copy application files
print_status "Copying application files..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='logs' . /opt/academic-reviewer/

# Set up production environment
print_status "Setting up production environment..."
cd /opt/academic-reviewer

# Create production docker-compose override
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  frontend:
    environment:
      - NODE_ENV=production
    restart: always
    
  backend:
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=warn
    restart: always
    
  mongo:
    restart: always
    volumes:
      - /opt/academic-reviewer/backups:/backups
      
  n8n:
    restart: always
    environment:
      - N8N_LOG_LEVEL=warn
EOF

# Set up SSL certificates (Let's Encrypt)
if command -v certbot &> /dev/null; then
    print_status "Setting up SSL certificates..."
    sudo certbot certonly --standalone -d your-domain.com --email your-email@domain.com --agree-tos --non-interactive
    
    # Copy certificates
    sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/academic-reviewer/ssl/
    sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/academic-reviewer/ssl/
    sudo chown $USER:$USER /opt/academic-reviewer/ssl/*
else
    print_warning "Certbot not found. SSL certificates not configured."
fi

# Set up nginx reverse proxy
print_status "Setting up nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/academic-reviewer << EOF
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /opt/academic-reviewer/ssl/fullchain.pem;
    ssl_certificate_key /opt/academic-reviewer/ssl/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass https://revidoc-backend.onrender.com;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # n8n (admin only)
    location /n8n {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Basic auth for n8n access
        auth_basic "n8n Admin Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/academic-reviewer /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Set up systemd service
print_status "Setting up systemd service..."
sudo tee /etc/systemd/system/academic-reviewer.service << EOF
[Unit]
Description=Academic Writing Reviewer
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/academic-reviewer
ExecStart=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable academic-reviewer

# Set up backup script
print_status "Setting up backup script..."
sudo tee /opt/academic-reviewer/scripts/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/academic-reviewer/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose exec -T mongo mongodump --out /backups/mongodb_$DATE

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env backend/.env frontend/.env

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
EOF

chmod +x /opt/academic-reviewer/scripts/backup.sh

# Set up cron job for backups
print_status "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/academic-reviewer/scripts/backup.sh >> /opt/academic-reviewer/logs/backup.log 2>&1") | crontab -

# Deploy application
print_status "Deploying application..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Start systemd service
sudo systemctl start academic-reviewer

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Health check
print_status "Performing health check..."
if curl -f https://your-domain.com/api/health > /dev/null 2>&1; then
    print_success "Application is running successfully!"
else
    print_error "Health check failed. Please check the logs."
    exit 1
fi

echo ""
print_success "🎉 Production deployment completed!"
echo ""
echo "📋 Production URLs:"
echo "   Application:  https://your-domain.com"
echo "   API:          https://your-domain.com/api"
echo "   n8n Admin:    https://your-domain.com/n8n"
echo ""
echo "📝 Post-deployment tasks:"
echo "   1. Update DNS records to point to this server"
echo "   2. Configure monitoring and alerting"
echo "   3. Set up log rotation"
echo "   4. Test all functionality"
echo "   5. Configure backup verification"
echo ""
echo "🔧 Management commands:"
echo "   Status:       sudo systemctl status academic-reviewer"
echo "   Logs:         docker-compose logs -f"
echo "   Backup:       /opt/academic-reviewer/scripts/backup.sh"
echo "   Update:       git pull && docker-compose up -d --build"
