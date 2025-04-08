const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/bd"); // Import your Sequelize instance

const Payment = sequelize.define("Payment", {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: "Сумма платежа",
  },

  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: "Дата и время платежа",
  },

  creditCardNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Define the association (important!)

module.exports = Payment;
