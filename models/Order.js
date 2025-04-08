const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/bd");

const Order = sequelize.define("Order", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "ID платежа в платежной системе (если есть)",
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: "Дата и время создания заказа",
  },
});

module.exports = Order;
