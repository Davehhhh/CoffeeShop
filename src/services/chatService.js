class ChatService {
    constructor(MessageModel) {
        this.MessageModel = MessageModel;
    }

    async createMessage(content) {
        try {
            const message = await this.MessageModel.create({ content });
            return message;
        } catch (error) {
            throw new Error('Error creating message: ' + error.message);
        }
    }

    async fetchMessages() {
        try {
            const messages = await this.MessageModel.findAll();
            return messages;
        } catch (error) {
            throw new Error('Error fetching messages: ' + error.message);
        }
    }
}

module.exports = ChatService;