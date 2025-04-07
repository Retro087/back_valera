const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/bd");
const Flowers = require("./Flowers");

const Cart = sequelize.define("Cart", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Обязательное поле
  },
  flowerId: {
    type: DataTypes.INTEGER, // Для длинного текста
    allowNull: false, // Необязательное поле
  },
  quantity: {
    type: DataTypes.INTEGER, // Для хранения URL фотографии
    allowNull: false, // Необязательное поле
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2), // 10 цифр всего, 2 после запятой
    allowNull: false, // Обязательное поле
  },
});

Cart.belongsTo(Flowers, {
  foreignKey: "flowerId", // Укажите имя внешнего ключа в таблице Cart
  as: "flower", // Псевдоним для связи (используйте его в контроллере)
});

module.exports = Cart;
