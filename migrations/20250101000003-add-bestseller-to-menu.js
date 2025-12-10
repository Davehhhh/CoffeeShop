module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Menus', 'isBestseller', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'available',
    });
    
    await queryInterface.addColumn('Menus', 'salesCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      after: 'isBestseller',
    });
    
    await queryInterface.addColumn('Menus', 'rating', {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0,
      after: 'salesCount',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Menus', 'isBestseller');
    await queryInterface.removeColumn('Menus', 'salesCount');
    await queryInterface.removeColumn('Menus', 'rating');
  },
};
