const db = require('../models');
const firebaseClient = require('../services/firebaseClient');
const ChatbotService = require('../services/chatbot');

const chatbotService = new ChatbotService(db);

// Embedded menu data for reliable serverless fallback
const bundledMenu = [
  {
    "id": 50,
    "name": "Cappuccino",
    "description": "Espresso with steamed milk and foam",
    "category": "Coffee",
    "price": "180.00",
    "available": true,
    "isBestseller": true,
    "salesCount": 350,
    "rating": "4.80"
  },
  {
    "id": 51,
    "name": "Latte",
    "description": "Espresso with steamed milk",
    "category": "Coffee",
    "price": "200.00",
    "available": true,
    "isBestseller": true,
    "salesCount": 320,
    "rating": "4.70"
  },
  {
    "id": 52,
    "name": "Espresso",
    "description": "Strong espresso shot",
    "category": "Coffee",
    "price": "150.00",
    "available": true,
    "isBestseller": true,
    "salesCount": 450,
    "rating": "4.85"
  },
  {
    "id": 53,
    "name": "Mocha",
    "description": "Espresso with steamed milk and chocolate",
    "category": "Coffee",
    "price": "220.00",
    "available": true,
    "isBestseller": true,
    "salesCount": 280,
    "rating": "4.90"
  },
  {
    "id": 54,
    "name": "Americano",
    "description": "Espresso with hot water",
    "category": "Coffee",
    "price": "170.00",
    "available": true,
    "isBestseller": false,
    "salesCount": 180,
    "rating": "4.65"
  },
  {
    "id": 55,
    "name": "Green Tea",
    "description": "Fresh brewed green tea",
    "category": "Tea",
    "price": "140.00",
    "available": true,
    "isBestseller": false,
    "salesCount": 120,
    "rating": "4.50"
  },
  {
    "id": 56,
    "name": "Croissant",
    "description": "Buttery French pastry",
    "category": "Pastry",
    "price": "160.00",
    "available": true,
    "isBestseller": true,
    "salesCount": 250,
    "rating": "4.60"
  },
  {
    "id": 57,
    "name": "Chocolate Chip Cookie",
    "description": "Homemade cookie with chocolate chips",
    "category": "Pastry",
    "price": "120.00",
    "available": true,
    "isBestseller": false,
    "salesCount": 95,
    "rating": "4.55"
  },
  {
    "id": 58,
    "name": "Turkey Sandwich",
    "description": "Fresh turkey on whole wheat",
    "category": "Sandwich",
    "price": "280.00",
    "available": true,
    "isBestseller": false,
    "salesCount": 75,
    "rating": "4.70"
  },
  {
    "id": 59,
    "name": "Chocolate Cake",
    "description": "Rich chocolate cake slice",
    "category": "Dessert",
    "price": "250.00",
    "available": true,
    "isBestseller": true,
    "salesCount": 220,
    "rating": "4.80"
  },
  {
    "id": 60,
    "name": "Iced Coffee",
    "description": "Cold brew coffee with ice",
    "category": "Beverage",
    "price": "180.00",
    "available": true,
    "isBestseller": true,
    "salesCount": 260,
    "rating": "4.70"
  },
  {
    "id": 61,
    "name": "Chamomile Tea",
    "description": "Relaxing chamomile brew",
    "category": "Tea",
    "price": "130.00",
    "available": true,
    "isBestseller": false,
    "salesCount": 85,
    "rating": "4.45"
  }
];

class CoffeeshopController {
    // Chat message operations
    async sendMessage(req, res) {
        try {
            const { content, sender } = req.body;
            const message = await db.Message.create({
                content,
                sender,
            });
            res.json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMessages(req, res) {
        try {
            const messages = await db.Message.findAll();
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBotResponse(req, res) {
        try {
            const { userMessage } = req.body;
            
            if (!userMessage) {
                return res.status(400).json({ error: 'userMessage is required' });
            }

            // Attempt to get menu items for context, prefer Firebase when enabled
            let menuItems = [];
            try {
                if (process.env.USE_FIREBASE === 'true') {
                    menuItems = await firebaseClient.getMenuItems();
                } else if (db && db.Menu && typeof db.Menu.findAll === 'function') {
                    menuItems = await db.Menu.findAll();
                }
            } catch (menuErr) {
                console.warn('Could not fetch menu for bot context:', menuErr && menuErr.message ? menuErr.message : menuErr);
                menuItems = [];
            }

            // Generate bot response (will use internal knowledgeBase if menu empty)
            const botResponse = await chatbotService.getContextualResponse(userMessage, menuItems);

            // Try to persist bot response, but do not fail if DB is unavailable
            let savedMessage = null;
            try {
                if (process.env.USE_FIREBASE === 'true') {
                    savedMessage = await firebaseClient.createMessage({ content: botResponse, sender: 'bot' });
                } else if (db && db.Message && typeof db.Message.create === 'function') {
                    savedMessage = await db.Message.create({ content: botResponse, sender: 'bot' });
                }
            } catch (persistErr) {
                console.warn('Failed to persist bot message:', persistErr && persistErr.message ? persistErr.message : persistErr);
                savedMessage = null;
            }

            res.json({ response: botResponse, message: savedMessage });
        } catch (error) {
            console.error('getBotResponse error:', error && error.message ? error.message : error);

            // Attempt to return a friendly fallback response so the frontend always shows something.
            const fallback = "Sorry, I'm having trouble answering right now. Please try again soon or check our menu above.";

            try {
                // Try to persist fallback message if DB is available
                if (db && db.Message && typeof db.Message.create === 'function') {
                    await db.Message.create({ content: fallback, sender: 'bot' });
                }
            } catch (persistErr) {
                console.warn('Failed to persist fallback bot message:', persistErr && persistErr.message ? persistErr.message : persistErr);
            }

            res.json({ response: fallback, message: null });
        }
    }

    // Menu operations
    async getMenu(req, res) {
        try {
            // If Firebase is enabled, try it first
            if (process.env.USE_FIREBASE === 'true') {
                const fbItems = await firebaseClient.getMenuItems();
                if (fbItems && fbItems.length > 0) {
                    console.log('Served', fbItems.length, 'menu items from Firestore');
                    return res.json(fbItems);
                }
            }

            // Try MySQL database
            try {
                if (db && db.Menu && typeof db.Menu.findAll === 'function') {
                    const menuItems = await db.Menu.findAll({
                        where: { available: true },
                    });
                    if (menuItems && menuItems.length > 0) {
                        console.log('Served', menuItems.length, 'menu items from MySQL');
                        return res.json(menuItems);
                    }
                }
            } catch (dbErr) {
                console.warn('MySQL menu query failed:', dbErr && dbErr.message ? dbErr.message : dbErr);
            }

            // Fallback to pre-loaded bundled menu (loaded at startup)
            const filtered = bundledMenu.filter(i => i.available !== false);
            console.log('Served', filtered.length, 'menu items from bundled cache');
            return res.json(filtered);
        } catch (error) {
            console.error('getMenu error:', error && error.message ? error.message : error);
            res.json([]);
        }
    }

    async getBestsellers(req, res) {
        try {
            const limit = req.query.limit || 6;

            // If Firebase is enabled, try it first
            if (process.env.USE_FIREBASE === 'true') {
                const fbSellers = await firebaseClient.getBestsellers(limit);
                if (fbSellers && fbSellers.length > 0) {
                    console.log('Served', fbSellers.length, 'bestsellers from Firestore');
                    return res.json(fbSellers);
                }
            }

            // Try MySQL database
            try {
                if (db && db.Menu && typeof db.Menu.findAll === 'function') {
                    const bestsellers = await db.Menu.findAll({
                        where: { 
                            available: true,
                            isBestseller: true 
                        },
                        order: [['salesCount', 'DESC']],
                        limit: parseInt(limit),
                    });
                    if (bestsellers && bestsellers.length > 0) {
                        console.log('Served', bestsellers.length, 'bestsellers from MySQL');
                        return res.json(bestsellers);
                    }
                }
            } catch (dbErr) {
                console.warn('MySQL bestsellers query failed:', dbErr && dbErr.message ? dbErr.message : dbErr);
            }

            // Fallback to pre-loaded bundled bestsellers
            const sellers = bundledMenu
                .filter(i => i.available !== false && i.isBestseller)
                .sort((a,b) => (b.salesCount||0)-(a.salesCount||0))
                .slice(0, parseInt(limit));
            console.log('Served', sellers.length, 'bestsellers from bundled cache');
            return res.json(sellers);
        } catch (error) {
            console.error('getBestsellers error:', error && error.message ? error.message : error);
            res.json([]);
        }
    }
    }

    async addMenuItem(req, res) {
        try {
            const { name, description, category, price, available } = req.body;
            const menuItem = await db.Menu.create({
                name,
                description,
                category,
                price,
                available: available !== false,
            });
            res.status(201).json(menuItem);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateMenuItem(req, res) {
        try {
            const { id } = req.params;
            const { name, description, category, price, available } = req.body;
            const menuItem = await db.Menu.findByPk(id);
            if (!menuItem) {
                return res.status(404).json({ error: 'Menu item not found' });
            }
            await menuItem.update({
                name,
                description,
                category,
                price,
                available,
            });
            res.json(menuItem);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Order operations
    async createOrder(req, res) {
        try {
            const { customerName, items, notes } = req.body;
            
            // Calculate total price
            let totalPrice = 0;
            for (const item of items) {
                const menuItem = await db.Menu.findByPk(item.menuItemId);
                if (!menuItem) {
                    return res.status(404).json({ error: `Menu item ${item.menuItemId} not found` });
                }
                totalPrice += menuItem.price * item.quantity;
            }

            const order = await db.Order.create({
                customerName,
                items,
                totalPrice,
                notes,
                status: 'Pending',
            });
            
            // Save order confirmation message
            const orderMessage = `Order placed for ${customerName}. Order ID: ${order.id}. Total: ₱${parseFloat(order.totalPrice).toFixed(2)}`;
            await db.Message.create({
                content: orderMessage,
                sender: 'bot',
            });

            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getOrders(req, res) {
        try {
            const orders = await db.Order.findAll({
                order: [['createdAt', 'DESC']],
            });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await db.Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await db.Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            await order.update({ status });
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CoffeeshopController;