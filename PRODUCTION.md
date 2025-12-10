# Production Environment Configuration

## .env.production

```env
# Node Environment
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-db-host.rds.amazonaws.com
DB_USERNAME=brewheavencafe_admin
DB_PASSWORD=strong-password-here
DB_NAME=brewheavencafe_prod
DB_PORT=3306

# Application
APP_URL=https://bredheavencafe.com
API_URL=https://api.bredheavencafe.com
SITE_NAME=BrewHeaven Cafe

# Flowise Integration
FLOWISE_URL=https://gayo.elai.octanity.net
FLOWISE_CHATFLOW_ID=your-chatflow-id-from-flowise-dashboard
FLOWISE_TIMEOUT=30000

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/brewheavencafe/app.log

# CORS
CORS_ORIGIN=https://bredheavencafe.com,https://www.bredheavencafe.com

# Security
JWT_SECRET=your-very-secret-jwt-key-here
SESSION_SECRET=your-very-secret-session-key-here
ENCRYPTION_KEY=your-encryption-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@bredheavencafe.com
SMTP_PASSWORD=app-password-from-google
EMAIL_FROM=hello@brewheavencafe.com

# Storage (AWS S3 or similar)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-southeast-1
S3_BUCKET=brewheavencafe-uploads

# Cache
REDIS_URL=redis://your-redis-server:6379

# Monitoring & Analytics
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX-X
MIXPANEL_TOKEN=your-mixpanel-token

# API Keys
OPENAI_API_KEY=sk-your-openai-key (if using OpenAI)
HUGGINGFACE_API_KEY=hf_your-huggingface-key (if using HF)
```

---

## Docker Configuration

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build stage
FROM node:18-alpine

WORKDIR /app

# Install security updates
RUN apk add --no-cache tini

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app . .

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - brewheavencafe
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root-password
      - MYSQL_DATABASE=brewheavencafe_prod
      - MYSQL_USER=brewheavencafe_admin
      - MYSQL_PASSWORD=strong-password
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - brewheavencafe
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - brewheavencafe
    restart: unless-stopped
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    networks:
      - brewheavencafe
    restart: unless-stopped

volumes:
  db_data:
  redis_data:

networks:
  brewheavencafe:
    driver: bridge
```

---

## Nginx Configuration

### nginx.conf

```nginx
upstream brewheavencafe {
    server app:3000;
}

server {
    listen 80;
    server_name bredheavencafe.com www.bredheavencafe.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bredheavencafe.com www.bredheavencafe.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/certs/bredheavencafe.com.crt;
    ssl_certificate_key /etc/nginx/certs/bredheavencafe.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://brewheavencafe;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Public files
    location / {
        proxy_pass http://brewheavencafe;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /\config {
        deny all;
    }
}
```

---

## GitHub Actions Deployment

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/brewheavencafe
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T app npm run migrate:prod
```

---

## Production Deployment Steps

### 1. AWS Lightsail / DigitalOcean Droplet Setup

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install -y docker-compose

# Clone repository
cd /opt
sudo git clone https://github.com/Davehhhh/chatbot-sequelize-netlify.git brewheavencafe
cd brewheavencafe

# Create .env.production
sudo nano .env.production
# (Add all production environment variables)

# Start services
sudo docker-compose -f docker-compose.yml up -d

# Check status
sudo docker-compose ps
```

### 2. Database Migration

```bash
# Run migrations
docker-compose exec app npm run migrate:prod

# Seed data
docker-compose exec app npm run seed:prod
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d bredheavencafe.com -d www.bredheavencafe.com

# Copy to docker volume
sudo cp /etc/letsencrypt/live/bredheavencafe.com/fullchain.pem ./certs/
sudo cp /etc/letsencrypt/live/bredheavencafe.com/privkey.pem ./certs/

# Restart nginx
sudo docker-compose restart nginx
```

### 4. Monitoring Setup

```bash
# Install monitoring tools
sudo apt-get install -y htop iotop nethogs

# Check application logs
sudo docker-compose logs -f app

# Monitor resource usage
sudo docker stats
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check application health
curl https://bredheavencafe.com/health

# Check database connection
curl https://bredheavencafe.com/api/health/db

# Check Flowise connectivity
curl https://bredheavencafe.com/api/health/flowise
```

### Backup Strategy

```bash
# Daily database backup
0 2 * * * docker-compose exec -T db mysqldump -u root -ppassword brewheavencafe_prod > /backups/db-$(date +\%Y\%m\%d).sql

# Weekly backup to S3
0 3 * * 0 aws s3 sync /backups s3://brewheavencafe-backups/
```

### Log Rotation

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/brewheavencafe

/var/log/brewheavencafe/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Out of memory | Increase server RAM or optimize app |
| Database slow | Add indexes, optimize queries |
| High CPU usage | Check for infinite loops, optimize code |
| Disk full | Clean logs, old backups |
| SSL cert expired | Run `certbot renew` |

---

## Quick Commands

```bash
# Restart all services
sudo docker-compose restart

# View logs
sudo docker-compose logs -f app

# Scale application
sudo docker-compose up -d --scale app=3

# Backup database
sudo docker-compose exec -T db mysqldump -u root brewheavencafe_prod > backup.sql

# Restore database
sudo docker exec -i mysql_container mysql -u root -p < backup.sql
```

---

## Next Steps

1. ✅ Configure production environment variables
2. ✅ Set up server infrastructure
3. ✅ Deploy Docker containers
4. ✅ Configure SSL certificates
5. ✅ Set up monitoring & backups
6. ✅ Go live!
