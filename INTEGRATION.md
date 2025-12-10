# Flowise Integration with BrewHeaven Website

## Overview

This guide explains how to integrate the Flowise RAG chatbot into the BrewHeaven Cafe website.

---

## Architecture

```
┌────────────────────────────────────────┐
│   BrewHeaven Website                   │
│   (bredheavencafe.com)                 │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │  Chat Modal (Floating Button)   │  │
│  │  - User sends message           │  │
│  │  - Display response             │  │
│  │  - Chat history                 │  │
│  └────────────┬────────────────────┘  │
│               │                        │
│    ┌──────────▼──────────┐            │
│    │ API Bridge          │            │
│    │ (proxy/middleware)  │            │
│    └──────────┬──────────┘            │
└───────────────┼─────────────────────────┘
                │
        ┌───────▼──────────────┐
        │ Flowise RAG Chatbot  │
        │ (gayo.elai.          │
        │  octanity.net)       │
        │                      │
        │ - Document indexing  │
        │ - Vector embeddings  │
        │ - Context retrieval  │
        │ - LLM responses      │
        └──────────────────────┘
```

---

## Step 1: Update Frontend (public/js/app.js)

Replace the current chat functions with Flowise integration:

```javascript
// Flowise Configuration
const FLOWISE_API_URL = 'https://gayo.elai.octanity.net/api/v1/chat';
const FLOWISE_CHATFLOW_ID = 'YOUR_FLOWISE_CHATFLOW_ID'; // Get from Flowise dashboard

// Initialize chat on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
});

// New chat function using Flowise
async function initializeChat() {
    try {
        // Generate or retrieve session ID
        const sessionId = localStorage.getItem('flowise_session_id') || generateSessionId();
        localStorage.setItem('flowise_session_id', sessionId);
        
        // Load initial greeting from Flowise
        await loadFlowiseGreeting(sessionId);
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
}

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

async function loadFlowiseGreeting(sessionId) {
    try {
        const response = await fetch(FLOWISE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: 'Hello, introduce yourself as a BrewHeaven Cafe assistant',
                sessionId: sessionId,
                chatflowId: FLOWISE_CHATFLOW_ID
            })
        });

        const data = await response.json();
        if (data.text) {
            addMessageToChat(data.text, 'bot');
        }
    } catch (error) {
        console.error('Error loading greeting:', error);
    }
}

// Send message to Flowise
async function sendMessageToFlowise(userMessage) {
    const sessionId = localStorage.getItem('flowise_session_id');
    const chatMessages = document.getElementById('chatMessages');

    try {
        // Add user message to UI
        addMessageToChat(userMessage, 'user');

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.innerHTML = '<p>BrewHeaven is thinking...</p>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Send to Flowise
        const response = await fetch(FLOWISE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: userMessage,
                sessionId: sessionId,
                chatflowId: FLOWISE_CHATFLOW_ID
            })
        });

        // Remove typing indicator
        typingDiv.remove();

        const data = await response.json();
        
        if (data.text) {
            // Save to backend (optional)
            await saveMessageToBackend(userMessage, data.text, sessionId);
            
            // Display bot response
            addMessageToChat(data.text, 'bot');
        } else {
            console.error('No response from Flowise');
            addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
        }
    } catch (error) {
        console.error('Error sending message to Flowise:', error);
        addMessageToChat('Sorry, I\'m having trouble connecting to the chatbot. Please try again later.', 'bot');
    }
}

// Save message to backend (optional - for history/analytics)
async function saveMessageToBackend(userMessage, botResponse, sessionId) {
    try {
        await fetch('/api/chat-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userMessage,
                botResponse,
                sessionId,
                timestamp: new Date()
            })
        });
    } catch (error) {
        console.warn('Could not save chat history:', error);
    }
}

// Update send button to use Flowise
function handleSendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();

    if (!content) return;

    // Send to Flowise instead of local bot
    sendMessageToFlowise(content);
    messageInput.value = '';
}

// Update existing sendMessage function
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();

    if (!content) return;

    sendMessageToFlowise(content);
    messageInput.value = '';
}
```

---

## Step 2: Add Typing Indicator Styles

Update `public/css/style.css`:

```css
/* Typing indicator animation */
.typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
}

.typing-indicator p {
    margin: 0;
}

.typing-indicator::after {
    content: '';
    animation: typing 1.4s infinite;
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-10px);
    }
}
```

---

## Step 3: Backend Integration

Create new endpoint to handle Flowise proxy (optional but recommended):

**File: `src/routes/flowise.js`**

```javascript
const express = require('express');
const router = express.Router();
const axios = require('axios');

const FLOWISE_URL = process.env.FLOWISE_URL || 'https://gayo.elai.octanity.net';
const FLOWISE_CHATFLOW_ID = process.env.FLOWISE_CHATFLOW_ID || 'YOUR_ID';

// Proxy chat request to Flowise
router.post('/chat', async (req, res) => {
    try {
        const { question, sessionId } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const response = await axios.post(
            `${FLOWISE_URL}/api/v1/chat`,
            {
                question,
                sessionId: sessionId || generateSessionId(),
                chatflowId: FLOWISE_CHATFLOW_ID
            },
            {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Flowise error:', error.message);
        res.status(500).json({
            error: 'Failed to get response from chatbot',
            message: error.message
        });
    }
});

// Get chat history
router.get('/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Implement chat history retrieval if Flowise supports it
        res.json({ messages: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

module.exports = router;
```

**Update `src/app.js` to include route:**

```javascript
const flowiseRoutes = require('./routes/flowise');
app.use('/api/flowise', flowiseRoutes);
```

---

## Step 4: Environment Variables

Update `.env`:

```env
# Flowise Configuration
FLOWISE_URL=https://gayo.elai.octanity.net
FLOWISE_CHATFLOW_ID=your-chatflow-id-from-flowise

# Website
DOMAIN=brewheavencafe.com
SITE_URL=https://bredheavencafe.com

# API
API_PORT=3000
API_URL=https://api.bredheavencafe.com
 
# Gemini / Google Generative Language API key (used by server-side chatbot)
# Keep this secret and set it in your production environment or local `.env` file.
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Step 5: Frontend Update for Flowise

Update HTML to use new chat function:

**File: `public/index.html`** (Update chat input)

```html
<div class="chat-input-area">
    <input 
        type="text" 
        id="messageInput" 
        placeholder="Ask about our menu, hours, or anything else..." 
        onkeypress="handleChatKeyPress(event)"
    >
    <button onclick="handleSendMessage()" class="send-btn">Send</button>
</div>

<script>
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
}
</script>
```

---

## Step 6: Testing

### Local Testing

1. **Set Flowise URL to development instance:**
   ```javascript
   const FLOWISE_API_URL = 'http://localhost:3000/api/v1/chat'; // During dev
   ```

2. **Test chat flow:**
   - Open browser console
   - Send test message: "What is your best coffee?"
   - Verify response from Flowise

### Production Testing

1. **Use Flowise production URL:**
   ```javascript
   const FLOWISE_API_URL = 'https://gayo.elai.octanity.net/api/v1/chat';
   ```

2. **Test CORS handling:**
   - Message should come from bredheavencafe.com
   - Response should include proper CORS headers

3. **Load test:**
   ```bash
   # Use Apache Bench or similar
   ab -n 100 -c 10 https://bredheavencafe.com
   ```

---

## Step 7: API Testing

### cURL Test

```bash
curl -X POST https://gayo.elai.octanity.net/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your specialty coffee?",
    "sessionId": "test-session-123",
    "chatflowId": "YOUR_CHATFLOW_ID"
  }'
```

### Expected Response

```json
{
  "text": "Our specialty is the Mocha, which combines espresso with steamed milk and rich chocolate. It's a customer favorite! ☕",
  "sessionId": "test-session-123"
}
```

---

## Step 8: Error Handling

Add error handling for common issues:

```javascript
// Enhanced error handling
async function sendMessageToFlowise(userMessage) {
    try {
        // ... existing code ...
    } catch (error) {
        if (error.message.includes('CORS')) {
            addMessageToChat(
                'I\'m having trouble connecting. This may be a temporary issue. Please try again.',
                'bot'
            );
        } else if (error.message.includes('timeout')) {
            addMessageToChat(
                'My response is taking longer than expected. I\'m working on it...',
                'bot'
            );
        } else {
            addMessageToChat(
                'Sorry, I encountered an error. Please refresh the page and try again.',
                'bot'
            );
        }
    }
}
```

---

## Step 9: Analytics & Monitoring

Track chat interactions (optional):

```javascript
// Send analytics
async function trackChatMessage(userMessage, botResponse, responseTime) {
    try {
        await fetch('/api/analytics/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userMessage,
                botResponse,
                responseTime,
                timestamp: new Date(),
                sessionId: localStorage.getItem('flowise_session_id')
            })
        });
    } catch (error) {
        console.warn('Analytics tracking failed:', error);
    }
}
```

---

## Step 10: Deployment Checklist

- [ ] Flowise deployed to production
- [ ] Subdomain DNS configured (gayo.elai.octanity.net)
- [ ] Frontend code updated with Flowise API URL
- [ ] Backend proxy routes added
- [ ] Environment variables configured
- [ ] CORS headers verified
- [ ] SSL certificate working
- [ ] Chat functionality tested in browser
- [ ] Error handling verified
- [ ] Performance tested under load
- [ ] Analytics tracking working

---

## Troubleshooting

### Issue: CORS Error

**Solution**: Add CORS header in Flowise `.env`:
```env
CORS_ORIGIN=https://bredheavencafe.com
```

### Issue: Chat not responding

**Solution**: 
- Check Flowise is running: `curl https://gayo.elai.octanity.net/health`
- Verify CHATFLOW_ID is correct
- Check browser console for errors

### Issue: Slow responses

**Solution**:
- Upgrade Flowise hosting (from free to paid tier)
- Optimize knowledge base size
- Add caching layer

---

## Next Steps

1. ✅ Deploy Flowise to production
2. ✅ Update frontend code
3. ✅ Configure backend proxy
4. ✅ Test thoroughly
5. ✅ Deploy to bredheavencafe.com
6. ✅ Monitor and optimize

---

## Resources

- **Flowise Docs**: https://docs.flowiseai.com
- **API Reference**: https://docs.flowiseai.com/ecosystem/api
- **Deployment Guide**: https://docs.flowiseai.com/deployment
