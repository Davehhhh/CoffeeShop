class ChatbotService {
    constructor(db) {
        this.db = db;
        this.geminiApiKey = process.env.GEMINI_API_KEY || null;
        this.initializeKnowledgeBase();
    }

    initializeKnowledgeBase() {
        // Knowledge base with patterns and responses
        this.knowledgeBase = {
            greeting: {
                patterns: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'good morning', 'good afternoon', 'good evening'],
                responses: [
                    'Hello! Welcome to BrewHeaven Cafe! ☕ How can I help you today?',
                    'Hi there! 👋 What can I get you at BrewHeaven Cafe?',
                    'Hey! Welcome to BrewHeaven Cafe! Looking for some delicious coffee?',
                    'Greetings! What brings you to BrewHeaven Cafe today?'
                ]
            },
            menu: {
                patterns: ['menu', 'what do you have', 'what\'s available', 'show me', 'see menu', 'items', 'products', 'coffee options'],
                responses: [
                    'We have a great variety! Check our menu above for: ☕ Coffees, 🍵 Teas, 🥐 Pastries, 🥪 Sandwiches, and 🍰 Desserts.',
                    'Our menu includes all your favorites: espresso, cappuccino, latte, and much more! Browse the menu to see all options.',
                    'We offer everything from simple espresso to delicious pastries. See our full menu above!'
                ]
            },
            coffee_recommendation: {
                patterns: ['recommend', 'suggest', 'best coffee', 'what should i order', 'favorite', 'popular', 'most ordered'],
                responses: [
                    'Our cappuccino is a customer favorite! It\'s a perfect blend of espresso and steamed milk. ☕',
                    'If you like strong coffee, try our espresso or americano. For something smoother, cappuccino or latte are great choices!',
                    'The mocha is amazing if you like chocolate! For classic coffee lovers, our latte is perfect.',
                    'Can\'t go wrong with a cappuccino - it\'s our most popular drink!'
                ]
            },
            pricing: {
                patterns: ['price', 'cost', 'how much', 'expensive', 'afford', 'payment', 'charge'],
                responses: [
                    'Our prices are very reasonable! Espresso starts at ₱100, most coffees are ₱120-220, and sandwiches are ₱350. Check the menu for exact prices!',
                    'We offer great value! Coffee drinks range from ₱100-₱220, and pastries are ₱120-₱160.',
                    'Our menu is budget-friendly. You can get a coffee for as low as ₱100 and combine it with a pastry for under ₱300!'
                ]
            },
            order_process: {
                patterns: ['how to order', 'order', 'place order', 'buy', 'purchase', 'checkout'],
                responses: [
                    'Easy! 🛒 Browse the menu above, select items and quantities, add them to your cart, and click the checkout button to complete your order.',
                    'Simply: 1) Choose items from the menu 2) Add to cart 3) Click the shopping cart button 4) Enter your name and checkout!',
                    'It\'s simple: Pick your favorite items from the menu, add them to cart, and checkout whenever you\'re ready!'
                ]
            },
            specialties: {
                patterns: ['specialty', 'special', 'unique', 'signature', 'famous', 'what\'s special'],
                responses: [
                    'Our specialty is the Mocha - espresso with steamed milk and rich chocolate! Absolutely delicious! 🍫☕',
                    'We\'re known for our perfectly crafted cappuccinos and fresh pastries made daily!',
                    'Our signature drink is the cappuccino - made with precision and passion every time!'
                ]
            },
            pastry: {
                patterns: ['pastry', 'bread', 'cake', 'cookie', 'dessert', 'croissant', 'sweet'],
                responses: [
                    'We have delicious pastries! 🥐 Try our buttery croissants (₱160) or chocolate chip cookies (₱120). Don\'t miss our chocolate cake!',
                    'Our pastry selection includes fresh croissants, homemade cookies, and rich chocolate cake. All baked fresh!',
                    'Perfect pairing with coffee! We have croissants, cookies, and desserts available.'
                ]
            },
            ingredients: {
                patterns: ['ingredient', 'allergen', 'gluten', 'dairy', 'vegan', 'sugar', 'contain', 'made with'],
                responses: [
                    'For detailed ingredient information, please ask our staff in person. We can help with dietary restrictions and allergies! 👥',
                    'I recommend asking our staff about specific ingredients or dietary needs - they can provide detailed information.',
                    'For allergen and ingredient details, our team is happy to help! Just let us know your concerns.'
                ]
            },
            hours: {
                patterns: ['hour', 'open', 'close', 'when', 'timing', 'available', 'operating'],
                responses: [
                    'We\'re open during regular business hours! For specific timing, please check with our staff or visit us directly. ⏰',
                    'Please ask our team for current operating hours. We\'re here to serve you! ☕',
                    'For exact hours, feel free to ask our staff - we\'re happy to help!'
                ]
            },
            thanks: {
                patterns: ['thank', 'thanks', 'thank you', 'appreciate', 'grateful'],
                responses: [
                    'You\'re very welcome! Enjoy your coffee! ☕',
                    'Happy to help! Come back soon!',
                    'Thanks for choosing us! 😊'
                ]
            },
            goodbye: {
                patterns: ['bye', 'goodbye', 'see you', 'take care', 'farewell', 'exit', 'quit'],
                responses: [
                    'Goodbye! Enjoy your coffee! ☕',
                    'See you soon! Thanks for visiting!',
                    'Have a great day! Come back to see us! 👋'
                ]
            },
            help: {
                patterns: ['help', 'assist', 'support', 'can you help', 'i need help'],
                responses: [
                    'Of course! I\'m here to help. I can answer questions about our menu, pricing, ordering process, and more at BrewHeaven Cafe. What would you like to know?',
                    'Happy to assist! Ask me about BrewHeaven Cafe\'s menu, prices, how to order, or anything else! 😊',
                    'Sure! I can help with menu info, ordering, pricing, and general questions about BrewHeaven Cafe. What do you need?'
                ]
            },
            quality: {
                patterns: ['quality', 'fresh', 'good', 'best', 'excellent', 'taste'],
                responses: [
                    'We pride ourselves at BrewHeaven Cafe on using high-quality beans and fresh ingredients! Every drink is made with care. ☕✨',
                    'Quality is our priority at BrewHeaven Cafe! We use premium coffee beans and prepare everything fresh.',
                    'Absolutely! BrewHeaven Cafe only uses the finest ingredients and prepares everything with attention to detail.'
                ]
            },
            bestseller: {
                patterns: ['bestseller', 'best seller', 'popular', 'most ordered', 'most sold', 'what\'s popular', 'trending'],
                responses: [
                    'Our bestsellers are amazing! ⭐ Check out the "Best Sellers" section at the top - it shows our most loved items like Cappuccino, Latte, and Mocha!',
                    'Great question! Our bestsellers include Cappuccino (₱180), Latte (₱200), Mocha (₱220), and Iced Coffee (₱180). All customer favorites! 🌟',
                    'Our most popular drinks are the Cappuccino and Latte - customers love them! We also have bestseller pastries like Croissants and Chocolate Cake.'
                ]
            },
            location: {
                patterns: ['location', 'address', 'where', 'find us', 'direction'],
                responses: [
                    'BrewHeaven Cafe is located at 123 Coffee Street, Downtown District, Cebu City! Ask our staff for directions. 📍',
                    'Visit us at BrewHeaven Cafe, 123 Coffee Street, Cebu! 📍',
                    'We\'re at BrewHeaven Cafe on Coffee Street in downtown Cebu. Our team can help you find us! 👥'
                ]
            }
        };
    }

    async generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for intent matches
        for (const [intent, data] of Object.entries(this.knowledgeBase)) {
            for (const pattern of data.patterns) {
                if (lowerMessage.includes(pattern)) {
                    return this.selectRandomResponse(data.responses);
                }
            }
        }

        // If no pattern matched, provide a helpful default response (may call external LLM)
        return await this.getDefaultResponse(userMessage);
    }

    selectRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async getDefaultResponse(userMessage) {
        const defaultResponses = [
            'That\'s a great question! 🤔 For more specific information, our staff is always ready to help.',
            'I\'m not sure about that specifically, but our team can definitely help! Just ask them. 👥',
            'Interesting! Our staff would be happy to discuss that with you in more detail.',
            'Great question! Feel free to ask our staff for more detailed information. They\'re very knowledgeable!',
            'I\'m still learning! 😊 But our team can answer that for you. Is there anything else I can help with?'
        ];

        // If a Gemini (Generative Language) API key is provided, try to get a smarter answer
        if (this.geminiApiKey) {
            const geminiReply = await this.callGemini(userMessage);
            if (geminiReply && typeof geminiReply === 'string' && geminiReply.trim().length > 0) {
                return geminiReply;
            }
        }

        return this.selectRandomResponse(defaultResponses);
    }

    async callGemini(userMessage) {
        if (!this.geminiApiKey) return null;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${this.geminiApiKey}`;
            const body = {
                prompt: {
                    text: `You are BrewHeaven Cafe assistant. Be concise and helpful. Customer asked: ${userMessage}`
                },
                temperature: 0.2,
                maxOutputTokens: 256
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const text = await res.text();
                console.warn('Gemini API error', res.status, text);
                return null;
            }

            const data = await res.json();

            // Preferred: look for `candidates[0].output` or `text`
            if (data && data.candidates && data.candidates.length > 0) {
                const cand = data.candidates[0];
                if (typeof cand === 'string') return cand;
                if (cand.output) return cand.output;
            }

            if (data && data.output && Array.isArray(data.output)) {
                const content = data.output.map(p => p.text || '').join('');
                if (content) return content;
            }

            if (data && data.text) return data.text;

            return null;
        } catch (err) {
            console.error('Error calling Gemini:', err && err.message ? err.message : err);
            return null;
        }
    }

    async getContextualResponse(userMessage, menuItems = []) {
        // Get basic response
        let response = await this.generateResponse(userMessage);

        // Add menu-related context if user asks about specific items
        const lowerMessage = userMessage.toLowerCase();
        
        if ((lowerMessage.includes('cappuccino') || lowerMessage.includes('latte') || 
             lowerMessage.includes('espresso') || lowerMessage.includes('coffee')) && menuItems.length > 0) {
            
            const coffeeItems = menuItems.filter(item => item.category === 'Coffee');
            if (coffeeItems.length > 0) {
                const itemNames = coffeeItems.map(item => `${item.name} (₱${parseFloat(item.price).toFixed(2)})`).join(', ');
                response += ` We have: ${itemNames}`;
            }
        }

        return response;
    }
}

module.exports = ChatbotService;
