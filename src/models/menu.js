module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('Coffee', 'Tea', 'Pastry', 'Sandwich', 'Dessert', 'Beverage'),
      allowNull: false,
      defaultValue: 'Coffee',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isBestseller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    salesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
  });

  return Menu;
};
