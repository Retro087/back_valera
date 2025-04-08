const { where } = require("sequelize");
const { sequelize } = require("../config/bd");
const Cart = require("../models/Cart");
const Flowers = require("../models/Flowers");

exports.getCart = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(404).json({ message: "Вы должны быть авторизованы" });
    }
    const cartItems = await Cart.findAll({
      where: { userId: userId },
      include: [
        {
          // Include the associated flower
          model: Flowers,
          as: "flower", // Make sure you have set this alias in the association
          attributes: ["id", "title", "price", "photo"], // Select only the attributes you need
        },
      ],
    });
    if (!cartItems) {
      return res.status(404).json({ message: "Корзина не найдена" });
    }

    const totalAmount = 0;

    res.status(200).json({ cartItems, totalAmount });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Ошибка при получении корзины", error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const { userId, flowerId, quantity } = req.body;

  try {
    // Find the flower to get its price
    const flower = await Flowers.findByPk(flowerId);
    if (!flower) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    const cartFlower = await Cart.findOne({
      where: {
        userId,
        flowerId,
        quantity,
      },
    });

    if (cartFlower) {
      return res.status(404).json({ message: "Товар уже есть в корзине" });
    }

    const amount = flower.price * quantity; //flower.price

    const cartItem = await Cart.create({
      userId: userId,
      flowerId: flowerId,
      quantity: quantity,
      amount: amount,
    });

    const cartItemWithFlower = await Cart.findByPk(cartItem.id, {
      include: [
        {
          model: Flowers,
          as: "flower", // MUST match the alias in your association
          attributes: ["id", "title", "price", "photo"], // Specify attributes you want
        },
      ],
    });
    res.status(201).json({
      message: "Товар добавлен в корзину",
      cartItem: cartItemWithFlower,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка при добавлении товара в корзину",
      error: error.message,
    });
  }
};

exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Cart.destroy({
      where: {
        id: id,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Элемент корзины не найден" }); // No content
    }

    return res.status(200).json(id);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка при удалении элемента корзины",
      error: error.message,
    });
  }
};

exports.updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  console.log(id, quantity);
  try {
    const cartItem = await Cart.findByPk(id);

    if (!cartItem) {
      return res.status(404).json({ message: "Элемент корзины не найден" });
    }

    const flower = await Flowers.findByPk(cartItem.flowerId);
    if (!flower) {
      await Cart.destroy({ where: { id: id } });
      return res.status(400).json({ message: "Товар больше не доступен" });
    }

    if (
      typeof quantity !== "number" ||
      quantity <= 0 ||
      quantity > flower.stockQuantity
    ) {
      return res.status(400).json({ message: "Неверное количество товара" });
    }

    const updated = await Cart.update(
      { quantity: quantity, amount: quantity * flower.price },
      {
        where: {
          id: id,
        },
      }
    );

    // Fetch and return the updated item with flower details
    const updatedCartItem = await Cart.findByPk(id, {
      include: [
        {
          model: Flowers,
          as: "flower", // MUST match the alias in your association
          attributes: ["id", "title", "price", "photo"], // Specify attributes you want
        },
      ],
    });

    res.status(200).json({
      message: "Элемент корзины обновлен",
      cartItem: updatedCartItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка при обновлении элемента корзины",
      error: error.message,
    });
  }
};
