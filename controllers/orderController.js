const Order = require("../models/Order");
const Payment = require("../models/Payments");

exports.createOrder = async (req, res) => {
  const { userId, paymentData, shippingAddress } = req.body;

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
    const cartItems = await Cart.findAll({ where: { userId: userId } });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Корзина пуста" });
    }

    // 3. Calculate total amount and other order details
    let totalAmount = 0;
    // .. logic to calculate amount

    // 4. Process payment
    let paymentResult;
    try {
      paymentResult = await Payment.create({
        orderId: null,
        amount: totalAmount,
        paymentDate: new Date(),
        creditCardNumber: paymentData.card,
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

    // 7. Clear the cart
    await Cart.destroy({ where: { userId: userId } });

    // 8. Return success message with order details
    res.status(201).json({
      message: "Заказ успешно создан",
      order: order, // Send back order details
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Ошибка при создании заказа", error: error.message });
  }
};
