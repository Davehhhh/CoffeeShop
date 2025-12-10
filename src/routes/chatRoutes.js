const express = require('express');
const CoffeeshopController = require('../controllers/chatControllers');

module.exports = () => {
    const router = express.Router();
    const controller = new CoffeeshopController();

    // Chat routes
    router.post('/message', controller.sendMessage.bind(controller));
    router.get('/messages', controller.getMessages.bind(controller));
    router.post('/bot-response', controller.getBotResponse.bind(controller));

    // Menu routes
    router.get('/menu', controller.getMenu.bind(controller));
    router.get('/bestsellers', controller.getBestsellers.bind(controller));
    router.post('/menu', controller.addMenuItem.bind(controller));
    router.put('/menu/:id', controller.updateMenuItem.bind(controller));

    // Order routes
    router.post('/orders', controller.createOrder.bind(controller));
    router.get('/orders', controller.getOrders.bind(controller));
    router.get('/orders/:id', controller.getOrderById.bind(controller));
    router.put('/orders/:id', controller.updateOrderStatus.bind(controller));

    return router;
};