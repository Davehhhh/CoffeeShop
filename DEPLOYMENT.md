# BrewHeaven Cafe - Deployment Guide

## Project Requirements & Status

### 1. Domain & Subdomain (20%) - IN PROGRESS
- **Primary Domain**: brewheavencafe.com (to be registered)
- **Subdomain**: gayo.elai.octanity.net (Flowise RAG Chatbot)
- **Main Site Hosting**: Netlify / Vercel / AWS
- **Cost**: PHP 800-900/year for domain

### 2. Flowise App Deployment (20%) - IN PROGRESS
- **Platform**: Flowise (Open Source - Free)
- **Hosting**: Hugging Face Spaces (Free)
- **Subdomain**: gayo.elai.octanity.net
- **Features**: RAG-based conversational AI

### 3. RAG Application Chatbot (20%) - PENDING
- Implement document indexing
- Vector embeddings with LangChain
- Context-aware responses
- Integration with BrewHeaven knowledge base

### 4. Website with AI Assistant (20%) - PENDING
- Current: Intent-based chatbot (localhost)
- Upgrade: Connect to Flowise RAG endpoint
- Features: Real-time response, learning from documents

### 5. Testing (20%) - PENDING
- Unit tests for API endpoints
- Integration tests for chatbot
- UI/UX testing
- Performance testing

---

## Setup Instructions

### Step 1: Domain Registration
1. **Register Domain** (PHP 800-900/year):
   - Provider: Namecheap, GoDaddy, or local Philippine registrar
   - Domain: brewheavencafe.com
   
2. **Configure DNS Records**:
   ```
   A Record: brewheavencafe.com -> [Your Hosting IP]
   CNAME Record: www.brewheavencafe.com -> brewheavencafe.com
   CNAME Record: gayo.elai.octanity.net -> huggingface-flowise-url
   ```

### Step 2: Subdomain Configuration
1. **For gayo.elai.octanity.net**:
   - Add CNAME to octanity.net DNS: gayo.elai -> flowise.huggingface.co
   - Or use provided Flowise endpoint URL

### Step 3: Main Website Hosting (PHP 50-270/month)
Options:
- **Netlify** (Recommended for Next.js/React)
- **Vercel** (Best for Next.js)
- **AWS Lightsail** (PHP 50-100/month)
- **DigitalOcean** (PHP 60-240/month)

### Step 4: Flowise Deployment to Hugging Face
See `FLOWISE_SETUP.md`

---

## Current Architecture

```
┌─────────────────────────────────────────────┐
│   BrewHeaven Cafe Website                   │
│   (BrewHeaven Cafe Frontend)               │
│   - Menu, Cart, Orders                     │
│   - Integrated Chat (Flowise)              │
│   - About, Contact sections                │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼───┐      ┌────▼────────┐
   │ Express│      │ Flowise RAG  │
   │ Backend│      │ Chatbot      │
   │ (Local)│      │ (HuggingFace)│
   └───┬───┘      └────┬─────────┘
       │               │
       │        ┌──────▼──────┐
       │        │ Vector Store │
       │        │ (Embeddings) │
       │        └──────┬──────┘
       │               │
       └───────┬───────┘
               │
        ┌──────▼──────┐
        │   MySQL DB  │
        │  (Sequelize)│
        └─────────────┘
```

---

## Pricing Breakdown

| Component | Cost | Duration |
|-----------|------|----------|
| Domain (brewheavencafe.com) | PHP 800-900 | Annual |
| Hosting (Main Site) | PHP 50-270 | Monthly |
| Flowise (Open Source) | FREE | - |
| Hugging Face (Free Tier) | FREE | - |
| **Total** | **PHP 850-1,170** | **Annual** |

---

## Timeline

- **Week 1**: Domain registration + DNS setup
- **Week 2**: Flowise deployment to Hugging Face
- **Week 3**: Website hosting setup + deployment
- **Week 4**: Integration + Testing
- **Week 5**: Go-live

---

## Contact & Support

For deployment issues, contact:
- Domain Provider Support
- Hugging Face Community: https://huggingface.co/spaces
- Flowise GitHub: https://github.com/FlowiseAI/Flowise
