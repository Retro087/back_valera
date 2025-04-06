const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/bd");

const Flowers = sequelize.define("Flowers", {
  title: {
    type: DataTypes.STRING,
    allowNull: false, // Обязательное поле
  },
  description: {
    type: DataTypes.TEXT, // Для длинного текста
    allowNull: true, // Необязательное поле
  },
  photo: {
    type: DataTypes.STRING, // Для хранения URL фотографии
    allowNull: true, // Необязательное поле
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), // 10 цифр всего, 2 после запятой
    allowNull: false, // Обязательное поле
  },
  category: {
    type: DataTypes.STRING, // Например, "Букеты", "Комнатные растения"
    allowNull: true,
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // По умолчанию 0 в наличии
    validate: {
      min: 0, // Не может быть меньше 0
    },
  },
  sku: {
    // Stock Keeping Unit (артикул)
    type: DataTypes.STRING,
    allowNull: true,
    unique: true, // Желательно, чтобы артикул был уникальным
  },
});

module.exports = Flowers;
