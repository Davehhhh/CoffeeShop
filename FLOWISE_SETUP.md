# Flowise Deployment to Hugging Face Spaces

## Prerequisites
- Hugging Face account (free at https://huggingface.co)
- Flowise Docker image or source code
- Basic knowledge of Docker and command line

---

## Option 1: Deploy Flowise to Hugging Face Spaces (RECOMMENDED)

### Step 1: Create Hugging Face Account
1. Go to https://huggingface.co/join
2. Sign up with email/GitHub
3. Create API token: https://huggingface.co/settings/tokens

### Step 2: Create a New Space
1. Visit: https://huggingface.co/spaces
2. Click "Create new Space"
3. Fill in:
   - **Space name**: brewheavencafe-flowise
   - **License**: OpenRAIL-M
   - **Space SDK**: Docker
   - **Space hardware**: Free CPU (or GPU for better performance)

### Step 3: Configure Flowise

Create `Dockerfile` in the space repo:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Clone Flowise
RUN git clone https://github.com/FlowiseAI/Flowise.git .

# Install dependencies
RUN npm install

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start Flowise
CMD ["npm", "start"]
```

Create `.env` file:

```env
PORT=3000
FLOWISE_USERNAME=admin
FLOWISE_PASSWORD=admin123
CORS_ORIGIN=*
CHAT_MESSAGE_HISTORY=20
APIKEY_PATH=/app/data
DATABASE_PATH=/app/data
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  flowise:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - FLOWISE_USERNAME=admin
      - FLOWISE_PASSWORD=admin123
      - CORS_ORIGIN=*
    volumes:
      - ./data:/app/data
```

### Step 4: Push to Hugging Face

```bash
# Install git-lfs
git lfs install

# Clone space repo
git clone https://huggingface.co/spaces/YOUR_USERNAME/brewheavencafe-flowise
cd brewheavencafe-flowise

# Copy Dockerfile and .env
cp Dockerfile .
cp .env .
cp docker-compose.yml .

# Commit and push
git add .
git commit -m "Deploy Flowise"
git push
```

### Step 5: Access Flowise
- URL: https://huggingface.co/spaces/YOUR_USERNAME/brewheavencafe-flowise
- Direct access: https://your-username-brewheavencafe-flowise.hf.space

---

## Option 2: Deploy to Hugging Face with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hugging Face

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        uses: huggingface/transformers-action@main
        with:
          model_id: YOUR_USERNAME/brewheavencafe-flowise
          dockerfile: ./Dockerfile
          args: |
            --memory=4g
            --cpus=2
```

---

## Option 3: Deploy to Alternative Cloud Platforms

### A. Railway.app (Easiest)
1. Go to https://railway.app
2. Connect GitHub repo
3. Deploy with one click
4. Domain: `brewheavencafe-flowise.railway.app`

### B. Render.com
1. Connect GitHub repo
2. Create new Web Service
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

### C. AWS Lightsail/EC2
```bash
# SSH into instance
ssh -i key.pem ubuntu@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Pull and run Flowise
docker run -d \
  -p 3000:3000 \
  -e FLOWISE_USERNAME=admin \
  -e FLOWISE_PASSWORD=admin123 \
  flowiseai/flowise:latest
```

---

## Flowise Configuration for BrewHeaven

### Import Knowledge Base
1. **Access Flowise**: https://[your-flowise-url]
2. **Create New Flow**:
   - Add "Document Loader" node
   - Add "Embeddings" node (OpenAI, Hugging Face)
   - Add "Vector Store" node (Pinecone, Chroma, Weaviate)
   - Add "LLM" node (GPT-4, Claude, Llama2)
   - Add "Chat Memory" node
   - Connect nodes in sequence

### Upload BrewHeaven Data
Create `knowledge-base.txt`:

```
BrewHeaven Cafe

Our Story:
Founded in 2020, BrewHeaven Cafe has been serving the community with quality coffee and artisan pastries.

Menu:
- Espresso (₱100)
- Cappuccino (₱180) - Bestseller
- Latte (₱200) - Bestseller
- Americano (₱120)
- Mocha (₱220) - Bestseller
- Green Tea (₱140)
- Croissant (₱160)
- Turkey Sandwich (₱350)
- Chocolate Cake (₱250)

Hours:
Monday-Friday: 7:00 AM - 8:00 PM
Saturday-Sunday: 8:00 AM - 9:00 PM

Location:
123 Coffee Street, Downtown District, Cebu City
Phone: (032) 123-4567
Email: hello@brewheavencafe.com

Values:
Quality, Sustainability, Community
```

Upload to Flowise:
1. Create new document
2. Paste content
3. Generate embeddings
4. Create chat flow

---

## Testing Flowise Integration

### Test Chat Endpoint

```bash
curl -X POST https://[flowise-url]/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your most popular coffee?",
    "overrideConfig": {
      "sessionId": "test-session"
    }
  }'
```

### Expected Response
```json
{
  "text": "Our most popular coffees are Cappuccino, Latte, and Mocha. The Cappuccino is especially beloved by our customers for its perfect blend of espresso and steamed milk!",
  "sessionId": "test-session"
}
```

---

## Environment Variables

For production deployment:

```env
# Flowise
PORT=3000
FLOWISE_USERNAME=admin
FLOWISE_PASSWORD=your-secure-password
DEBUG=false

# Database
DATABASE_PATH=/data/flowise
DATABASE_TYPE=sqlite

# API & CORS
CORS_ORIGIN=https://brewheavencafe.com,https://gayo.elai.octanity.net

# LLM (OpenAI, HuggingFace, etc.)
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...

# Vector Store
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...

# Storage
STORAGE_TYPE=s3
S3_BUCKET=brewheavencafe
S3_REGION=ap-southeast-1
```

---

## Monitoring & Maintenance

### Health Check
```bash
curl https://[flowise-url]/health
```

### Logs
```bash
# Docker logs
docker logs flowise

# Real-time monitoring
docker stats flowise
```

### Updates
```bash
# Pull latest Flowise
docker pull flowiseai/flowise:latest

# Restart container
docker restart flowise
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change port: `docker run -p 8080:3000` |
| CORS errors | Set `CORS_ORIGIN=*` in .env |
| Out of memory | Increase Docker memory limit |
| Database locked | Delete `flowise.db` and restart |
| Embeddings failing | Check API key and quota |

---

## Cost Optimization

- **Hugging Face Free**: Good for testing, limited resources
- **Railway.app**: $5-20/month (very affordable)
- **Render.com**: Free tier available, paid from $7/month
- **AWS**: Pay-as-you-go, typically $10-50/month

**Recommendation for BrewHeaven**: Start with Hugging Face (free), upgrade to Railway.app ($5/month) when traffic increases.

---

## Next Steps

1. ✅ Create Hugging Face account
2. ✅ Deploy Flowise to Spaces
3. ✅ Import BrewHeaven knowledge base
4. ✅ Configure Flowise flow
5. ✅ Test chat endpoint
6. ✅ Integrate with main website (See INTEGRATION.md)
