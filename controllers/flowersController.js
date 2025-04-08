const { Sequelize } = require("sequelize");
const Flowers = require("../models/Flowers");
const Cart = require("../models/Cart");
const { Op } = Sequelize; // Import Op from Sequelize

// Получение списка всех товаров (с фильтрацией, пагинацией, и поиском)
exports.getAllFlowers = async (req, res) => {
  let { category, min, max, query, page = 1, limit = 10 } = req.query;

  page = Number(page);
  limit = Number(limit);

  try {
    const whereClause = {};

    // Фильтрация по категории
    if (category && category !== "all") {
      whereClause.categoryId = category; // Assuming 'categoryId' is the foreign key in Flower model
    }

    // Поиск по названию и описанию
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } }, // Case-insensitive LIKE search
        { description: { [Op.iLike]: `%${query}%` } },
      ];
    }

    // Фильтрация по цене
    if (min) {
      whereClause.price = { [Op.gte]: Number(min) };
    }
    if (max) {
      whereClause.price = { ...whereClause.price, [Op.lte]: Number(max) };
    }

    // Подсчет общего количества товаров (с учетом фильтров)
    const totalFlowers = await Flowers.count({ where: whereClause });

    // Получение товаров с пагинацией и фильтрацией
    const flowers = await Flowers.findAll({
      where: whereClause,
      limit: limit,
      offset: (page - 1) * limit,
    });

    res.status(200).json({
      flowers: flowers,
      totalFlowers: totalFlowers,
      currentPage: page,
      totalPages: Math.ceil(totalFlowers / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка при получении списка товаров",
      error: error.message,
    });
  }
};

// Получение товара по ID
exports.getFlowerById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    let flower = await Flowers.findByPk(id);
    if (!flower) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    if (userId) {
      const inCart = await Cart.findOne({
        where: {
          flowerId: flower.id,
          userId: userId,
        },
      });

      if (inCart) {
        flower = {
          ...flower.dataValues,
          inCart: true,
          cartId: inCart.id,
          quantityInCart: inCart.quantity,
        };
      }
    }

    res.status(200).json(flower);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Ошибка при получении товара", error: error.message });
  }
};
