exports.handler = async (event, context) => {
    const { ChatService } = require('../../src/services/chatService');
    const chatService = new ChatService();

    try {
        if (event.httpMethod === 'POST') {
            const messageData = JSON.parse(event.body);
            const newMessage = await chatService.createMessage(messageData);
            return {
                statusCode: 201,
                body: JSON.stringify(newMessage),
            };
        } else if (event.httpMethod === 'GET') {
            const messages = await chatService.fetchMessages();
            return {
                statusCode: 200,
                body: JSON.stringify(messages),
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};