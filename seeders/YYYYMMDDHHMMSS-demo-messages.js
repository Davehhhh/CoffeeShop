module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Messages', [
      {
        content: 'Hello! How can I assist you today?',
        sender: 'bot',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content: 'I am here to help you with your queries about our menu and orders.',
        sender: 'bot',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content: 'Feel free to ask me anything about our coffee shop!',
        sender: 'bot',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Messages', null, {});
  }
};