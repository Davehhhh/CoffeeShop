# Domain & Subdomain Configuration Guide

## 1. Domain Registration (brewheavencafe.com)

### Registrars (PHP 800-900/year)

**Philippine Options:**
- **Hostinger.ph**: PHP 449-1,299/year
- **Namecheap**: $8.88-12.88/year (PHP ~450-650)
- **GoDaddy**: $2.99-17.99/year (PHP ~150-900)
- **Web.com**: PHP 600-1,200/year
- **Kasiyahan**: Local registrar, PHP 600-900/year

### Recommended: Namecheap (Best value)

**Step 1: Register Domain**
1. Go to https://www.namecheap.com
2. Search: `brewheavencafe.com`
3. Add to cart
4. Enter registrant information (business details)
5. Choose 1-year registration
6. Complete payment (PHP ~450-500)

**Step 2: Set Nameservers**
1. Log in to Namecheap dashboard
2. Go to "Domain List"
3. Click "Manage" on brewheavencafe.com
4. Go to "Nameservers" section
5. Change to your hosting provider's nameservers

---

## 2. Main Domain Setup (brewheavencafe.com)

### DNS Records for Main Website

Once you choose hosting (Netlify, Vercel, AWS), configure these DNS records:

```
Type    Name                Value
───────────────────────────────────────────────────────────
A       brewheavencafe.com  [Your Hosting IP]
CNAME   www                 brewheavencafe.com
CNAME   api                 brewheavencafe.com (or API server)
A       mail                [MX Server IP]
MX      @                   mail.brewheavencafe.com (priority 10)
TXT     @                   v=spf1 include:_spf.google.com ~all
```

### Hosting Providers (PHP 50-270/month)

**Option A: Netlify (RECOMMENDED for React/Next.js)**
- **Cost**: Free tier + PHP 100-300/month for Pro
- **Features**: Auto-deploy from GitHub, SSL included, CDN
- **Setup**: Connect GitHub repo, set domain in settings

```
Steps:
1. Sign up: https://netlify.com
2. Connect GitHub repo
3. Build settings:
   - Build command: npm run build
   - Publish directory: public/
4. Add domain: brewheavencafe.com
4. Auto SSL certificate (Let's Encrypt)
```

**Option B: Vercel (Best for Next.js)**
- **Cost**: Free + PHP 100-400/month
- **Features**: Auto-deploy, Edge functions, Analytics
- **Perfect for**: React/Next.js apps

**Option C: AWS Lightsail**
- **Cost**: PHP 50-100/month (USD $1-5)
- **Features**: Full control, scalable, flexible
- **Setup**: EC2 instance + Elastic IP

**Option D: DigitalOcean**
- **Cost**: PHP 60-240/month (USD $3-12)
- **Features**: Droplets, App Platform, managed databases
- **Good for**: Full-stack Node.js apps

---

## 3. Subdomain Setup (gayo.elai.octanity.net)

### For Flowise RAG Chatbot

**Prerequisite**: You must have access to octanity.net DNS

### DNS Configuration

Ask your octanity.net administrator to add:

```
Type    Name                         Value
───────────────────────────────────────────────────────────
CNAME   gayo.elai.octanity.net       flowise.huggingface.co
        OR
CNAME   gayo.elai.octanity.net       [Your Flowise Custom Domain]
```

**If using Railway.app or Render.com:**
```
CNAME   gayo.elai.octanity.net       your-app.railway.app
        OR
CNAME   gayo.elai.octanity.net       your-app.onrender.com
```

### Alternative: Use Flowise Public URL
If you can't configure CNAME, use Flowise default:
```
https://huggingface.co/spaces/YOUR_USERNAME/brewheavencafe-flowise
OR
https://your-username-brewheavencafe-flowise.hf.space
```

---

## 4. Complete DNS Configuration Example

### For Namecheap (Main Registrar)

**Go to: Domain → Advanced DNS**

```
Advanced DNS Records:
──────────────────────────────────────────────────────────

A Record:
  Host: @
  Value: 75.75.75.75 (Your Netlify IP)
  TTL: 30 min

CNAME Record:
  Host: www
  Value: brewheavencafe.com
  TTL: 30 min

CNAME Record:
  Host: api
  Value: api.your-hosting.com
  TTL: 30 min

MX Record:
  Host: @
  Value: mail.brewheavencafe.com
  Priority: 10
  TTL: 30 min

TXT Record:
  Host: @
  Value: v=spf1 include:_spf.google.com ~all
  TTL: 30 min

TXT Record (Verification):
  Host: @
  Value: google-site-verification=xxxxx
  TTL: 30 min
```

---

## 5. SSL Certificate Setup

### Auto-SSL (Let's Encrypt)

**Netlify/Vercel**: Automatic ✅
**AWS/DigitalOcean**: Manual setup

```bash
# Using Let's Encrypt (free)
sudo apt-get update
sudo apt-get install certbot

# For Nginx
sudo certbot certonly --nginx -d brewheavencafe.com -d www.brewheavencafe.com

# For Apache
sudo certbot certonly --apache -d brewheavencafe.com -d www.brewheavencafe.com

# Manual renewal
sudo certbot renew --dry-run
```

---

## 6. Email Configuration

### Option A: Google Workspace
```
MX Records:
  Priority 5:  gmail-smtp-in.l.google.com
  Priority 10: alt1.gmail-smtp-in.l.google.com
  Priority 20: alt2.gmail-smtp-in.l.google.com
```

### Option B: Microsoft 365
```
MX Records:
  Priority 10: brewheavencafe-com.mail.protection.outlook.com
```

### Option C: SendGrid
```
CNAME: sendgrid.net value
MX: sendgrid.net
```

---

## 7. Subdomain Structure

```
brewheavencafe.com
├── www.brewheavencafe.com (Main website)
├── api.brewheavencafe.com (Backend API - optional)
├── admin.brewheavencafe.com (Admin panel - optional)
└── mail.brewheavencafe.com (Mail server - optional)

gayo.elai.octanity.net
└── Flowise RAG Chatbot (Hugging Face)
```

---

## 8. DNS Propagation Check

### Tools to Verify DNS:
- **What's My DNS**: https://www.whatsmydns.net
- **MX Toolbox**: https://mxtoolbox.com
- **DNS Propagation Checker**: https://dnschecker.org

```bash
# Command line check
nslookup brewheavencafe.com
dig bredheavencafe.com
host brewheavencafe.com

# Check specific DNS record
nslookup -type=MX brewheavencafe.com
dig MX brewheavencafe.com
```

---

## 9. Subdomain Certificate for gayo.elai.octanity.net

### Let's Encrypt for Subdomain
```bash
certbot certonly --dns-cloudflare -d gayo.elai.octanity.net

# Or manual DNS challenge
certbot certonly --manual -d gayo.elai.octanity.net
```

### If using Hugging Face:
- SSL included automatically ✅
- No additional setup needed

---

## 10. Implementation Checklist

### Week 1: Domain Registration
- [ ] Register bredheavencafe.com (PHP ~500)
- [ ] Verify domain ownership
- [ ] Update nameservers
- [ ] DNS propagation (24-48 hours)

### Week 2: Hosting Setup
- [ ] Choose hosting provider (Netlify/Vercel/AWS)
- [ ] Create hosting account
- [ ] Configure DNS A/CNAME records
- [ ] Deploy website
- [ ] Verify SSL certificate

### Week 3: Subdomain Configuration
- [ ] Configure gayo.elai.octanity.net CNAME
- [ ] Deploy Flowise to Hugging Face
- [ ] Test Flowise endpoint
- [ ] Verify SSL for subdomain

### Week 4: Testing & Go-Live
- [ ] Test all domains in browser
- [ ] Verify email delivery
- [ ] Load testing
- [ ] Performance optimization
- [ ] Go-live announcement

---

## 11. Estimated Timeline

| Task | Days | Cost |
|------|------|------|
| Domain Registration | 0.5 | PHP 500-800 |
| Hosting Setup | 2-3 | Monthly: PHP 50-270 |
| DNS Configuration | 1-2 | FREE |
| SSL Certificate | 0.5 | FREE |
| Subdomain Setup | 1 | FREE |
| **Total Initial** | **5-7 days** | **PHP 500-800** |
| **Monthly** | - | **PHP 50-270** |

---

## 12. Post-Launch Monitoring

### Daily:
- Monitor uptime: UptimeRobot.com
- Check error logs

### Weekly:
- Review analytics
- Backup databases

### Monthly:
- Security audit
- Performance optimization
- Certificate renewal check

---

## Support & Resources

- **Namecheap Support**: support.namecheap.com
- **DNS Help**: https://www.namecheap.com/support/knowledgebase/
- **Let's Encrypt**: https://letsencrypt.org/
- **Netlify Docs**: https://docs.netlify.com/
- **Hugging Face**: https://huggingface.co/docs

---

## Next Steps

1. ✅ Register domain: brewheavencafe.com
2. ✅ Choose hosting provider
3. ✅ Configure DNS records
4. ✅ Deploy main website
5. ✅ Setup subdomain for Flowise
6. ✅ Deploy Flowise RAG chatbot
7. ✅ Integrate with main website

**See INTEGRATION.md for website integration steps.**
