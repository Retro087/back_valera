const { Op } = require("sequelize");
const { sequelize } = require("../config/bd");
const Cart = require("../models/Cart");
const Flowers = require("../models/Flowers");
const Order = require("../models/Order");
const Payment = require("../models/Payments");

exports.createOrder = async (req, res) => {
  const { userId, paymentData, shippingAddress } = req.body;
  console.log(userId, paymentData, shippingAddress);
  try {
    // 1. Input validation
    if (!userId) {
      return res.status(400).json({ message: "Не указан ID пользователя" });
    }
    if (!paymentData) {
      return res.status(400).json({ message: "Неверные платежные данные" });
    }

    if (
      !shippingAddress ||
      !shippingAddress.city ||
      !shippingAddress.street ||
      !shippingAddress.house ||
      !shippingAddress.flat
    ) {
      return res.status(400).json({ message: "Не указан адрес доставки" });
    }

    // 2. Get the cart items for the user
    const cartItems = await Cart.findAll({
      where: { userId: userId },
      include: [{ model: Flowers, as: "flower" }],
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Корзина пуста" });
    }

    // 3. Calculate total amount and other order details
    const totalAmount = cartItems.reduce((sum, item) => sum + item.amount, 0);
    // 4. Process payment

    for (const item of cartItems) {
      // Use a for...of loop to ensure sequential execution
      const flowerId = item.flowerId;
      const quantity = item.quantity;

      // Find the flower to get its current stockQuantity
      const flower = await Flowers.findByPk(flowerId);

      if (!flower) {
        console.warn(`Flower with ID ${flowerId} not found`);
        continue; // Skip to the next item
      }

      if (flower.stockQuantity < quantity) {
        throw new Error(
          `Недостаточно товара на складе для flowerId: ${flowerId}`
        );
      }

      // Update the stockQuantity using sequelize.literal to avoid race conditions
      const [updatedRows] = await Flowers.update(
        {
          stockQuantity: sequelize.literal(
            `"Flowers"."stockQuantity" - ${quantity}`
          ),
        }, // Specify table name
        {
          where: { id: flowerId, stockQuantity: { [Op.gte]: quantity } },
        }
      );
      //Make sure exactly one row was updated
      if (updatedRows != 1) {
        throw new Error(`Error updating stockQuantity flowerId: ${flowerId}`);
      }
    }
    let paymentResult;

    try {
      paymentResult = await Payment.create({
        orderId: null,
        amount: totalAmount,
        paymentDate: new Date(),
        creditCardNumber: paymentData.num,
        expiryDate: paymentData.date,

        // other payment details
      });
    } catch (paymentError) {
      console.error("Ошибка при обработке платежа:", paymentError);
      return res.status(400).json({
        message: "Ошибка при обработке платежа",
        error: paymentError.message,
      });
    }

    if (!paymentResult) {
      return res.status(400).json({
        message: "Ошибка при обработке платежа",
        error: paymentResult.message,
      });
    }

    // 5. Create the order
    const order = await Order.create({
      userId: userId,
      totalAmount: totalAmount,
      paymentId: paymentResult.id, // ID платежа из платежной системы
      shippingAddress: JSON.stringify(shippingAddress), // Store shipping address as JSON string
      orderDate: new Date(),
      items: cartItems.map((item) => ({
        flowerId: item.flowerId,
        quantity: item.quantity,
        price: item.amount,
      })),
    });

    await Payment.update(
      { orderId: order.id }, // The key change: set orderId to the newly created order's id
      { where: { id: paymentResult.id } } // Find the Payment record to update
    );

    await Cart.destroy({ where: { userId: userId } });

    // 8. Return success message with order details
    res.status(201).json({
      message: "Заказ успешно создан",
      order: {
        ...order.dataValues,
        items: cartItems.map((item) => ({
          flowerId: item.flowerId,
          quantity: item.quantity,
          price: item.amount,
        })),
        shippingAddress,
      }, // Send back order details
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Ошибка при создании заказа", error: error.message });
  }
};
