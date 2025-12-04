#!/bin/bash

# Academic Writing Reviewer - Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Academic Writing Reviewer..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating project directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p backups
mkdir -p n8n/workflows

# Copy environment files if they don't exist
print_status "Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    print_warning "Created backend/.env from example. Please update with your values."
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    print_warning "Created frontend/.env from example. Please update with your values."
fi

if [ ! -f .env ]; then
    cat > .env << EOF
# Academic Writing Reviewer Environment Configuration

# Database
MONGODB_URI=mongodb://mongo:27017/academic_reviewer
MONGODB_USER=academic_user
MONGODB_PASSWORD=academic_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# API Configuration
API_BASE_URL=http://localhost:5001/api
FRONTEND_URL=http://localhost:3001

# n8n Configuration
N8N_USER=admin
N8N_PASSWORD=change_this_password
N8N_HOST=localhost
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_TOKEN=your_n8n_api_token_here
N8N_DB_NAME=n8n
N8N_DB_USER=n8n
N8N_DB_PASSWORD=n8n_password

# AI Services (Configure with your API keys)
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Timezone
TIMEZONE=America/Mexico_City
EOF
    print_warning "Created .env file. Please update with your actual values."
fi

# Create Docker network
print_status "Creating Docker network..."
docker network create academic_reviewer_network 2>/dev/null || print_warning "Network already exists"

# Build and start services
print_status "Building and starting services..."

# Start main services
print_status "Starting main application services..."
docker-compose up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Start n8n services
print_status "Starting n8n automation services..."
docker-compose -f n8n/docker-compose.n8n.yml up -d --build

# Wait for n8n to be ready
print_status "Waiting for n8n to be ready..."
sleep 15

# Check service health
print_status "Checking service health..."

# Check MongoDB
if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB is running"
else
    print_error "MongoDB is not responding"
fi

# Check Backend API
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    print_success "Backend API is running"
else
    print_warning "Backend API is not responding yet (may still be starting)"
fi

# Check Frontend
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    print_success "Frontend is running"
else
    print_warning "Frontend is not responding yet (may still be starting)"
fi

# Check n8n
if curl -f http://localhost:5678/healthz > /dev/null 2>&1; then
    print_success "n8n is running"
else
    print_warning "n8n is not responding yet (may still be starting)"
fi

# Display access information
echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend:     http://localhost:3001"
echo "   Backend API:  http://localhost:5001"
echo "   n8n:          http://localhost:5678"
echo "   MongoDB:      mongodb://localhost:27017"
echo ""
echo "🔐 Default Credentials:"
echo "   n8n:          admin / change_this_password"
echo ""
echo "📝 Next Steps:"
echo "   1. Update environment variables in .env, backend/.env, and frontend/.env"
echo "   2. Configure your AI API keys (OpenAI, Hugging Face)"
echo "   3. Set up email configuration for notifications"
echo "   4. Access the application at http://localhost:3001"
echo "   5. Access n8n at http://localhost:5678 to configure workflows"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs:           docker-compose logs -f"
echo "   Stop services:       docker-compose down"
echo "   Restart services:    docker-compose restart"
echo "   Update services:     docker-compose up -d --build"
echo ""
print_success "Academic Writing Reviewer is ready to use!"
