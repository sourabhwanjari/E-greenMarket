const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');

// @desc    Get dashboard executive overview stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      lowStockProducts,
      totalCustomers,
      totalOrders,
      todayOrders,
      invoicesAggregate,
      todayInvoicesAggregate,
      ordersAggregate,
      todayOrdersAggregate
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stockInGrams: { $lte: 3000 } }),
      User.countDocuments({ role: 'CUSTOMER' }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      // All POS invoices revenue
      Invoice.aggregate([
        { $match: { paymentStatus: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      // Today's POS invoices revenue
      Invoice.aggregate([
        { $match: { paymentStatus: 'PAID', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      // Online orders revenue
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      // Today's Online orders revenue
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'CANCELLED' }, createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ])
    ]);

    const posTotalRevenue = invoicesAggregate[0]?.total || 0;
    const posTodayRevenue = todayInvoicesAggregate[0]?.total || 0;
    const posBillsCount = invoicesAggregate[0]?.count || 0;

    const onlineTotalRevenue = ordersAggregate[0]?.total || 0;
    const onlineTodayRevenue = todayOrdersAggregate[0]?.total || 0;

    const totalRevenue = parseFloat((posTotalRevenue + onlineTotalRevenue).toFixed(2));
    const todaySales = parseFloat((posTodayRevenue + onlineTodayRevenue).toFixed(2));

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        todaySales,
        totalOrders,
        todayOrders,
        posBillsCount,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        revenueBreakdown: {
          pos: parseFloat(posTotalRevenue.toFixed(2)),
          online: parseFloat(onlineTotalRevenue.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics (charts data)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 7);
    daysAgo.setHours(0, 0, 0, 0);

    // 1. Daily revenue for the last 7 days (POS + Orders)
    const [posDaily, orderDaily] = await Promise.all([
      Invoice.aggregate([
        { $match: { createdAt: { $gte: daysAgo }, paymentStatus: 'PAID' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            posRevenue: { $sum: '$grandTotal' }
          }
        }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: daysAgo }, orderStatus: { $ne: 'CANCELLED' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            onlineRevenue: { $sum: '$grandTotal' }
          }
        }
      ])
    ]);

    // Merge daily revenue maps
    const dateMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dateMap[key] = { date: key, day: dayName, posRevenue: 0, onlineRevenue: 0, totalRevenue: 0 };
    }

    posDaily.forEach((item) => {
      if (dateMap[item._id]) {
        dateMap[item._id].posRevenue = parseFloat(item.posRevenue.toFixed(2));
      }
    });

    orderDaily.forEach((item) => {
      if (dateMap[item._id]) {
        dateMap[item._id].onlineRevenue = parseFloat(item.onlineRevenue.toFixed(2));
      }
    });

    const dailyRevenue = Object.values(dateMap).map((d) => ({
      ...d,
      totalRevenue: parseFloat((d.posRevenue + d.onlineRevenue).toFixed(2))
    }));

    // 2. Most purchased vegetables (POS + Online)
    const [topPosItems, topOrderItems] = await Promise.all([
      Invoice.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalWeightKg: { $sum: { $divide: ['$items.weightInGrams', 1000] } },
            totalAmount: { $sum: '$items.amount' }
          }
        }
      ]),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'CANCELLED' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalWeightKg: { $sum: { $divide: ['$items.weightInGrams', 1000] } },
            totalAmount: { $sum: '$items.totalPrice' }
          }
        }
      ])
    ]);

    const itemMap = {};
    topPosItems.forEach((item) => {
      itemMap[item._id] = {
        name: item._id,
        weightKg: item.totalWeightKg,
        revenue: item.totalAmount
      };
    });

    topOrderItems.forEach((item) => {
      if (!itemMap[item._id]) {
        itemMap[item._id] = { name: item._id, weightKg: 0, revenue: 0 };
      }
      itemMap[item._id].weightKg += item.totalWeightKg;
      itemMap[item._id].revenue += item.totalAmount;
    });

    const topSelling = Object.values(itemMap)
      .map((item) => ({
        name: item.name,
        weightKg: parseFloat(item.weightKg.toFixed(2)),
        revenue: parseFloat(item.revenue.toFixed(2))
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // 3. Category distribution from products
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStockKg: { $sum: { $divide: ['$stockInGrams', 1000] } }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          totalStockKg: { $round: ['$totalStockKg', 2] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      dailyRevenue,
      topSelling,
      categoryDistribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered customers with order stats
// @route   GET /api/admin/customers
// @access  Private (Admin)
const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'CUSTOMER' };

    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    // Aggregate spend and order count for these customers
    const customerIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      { $match: { customerId: { $in: customerIds }, orderStatus: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: '$customerId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$grandTotal' }
        }
      }
    ]);

    const statsMap = {};
    orderStats.forEach((s) => {
      statsMap[s._id.toString()] = {
        orderCount: s.orderCount,
        totalSpent: parseFloat(s.totalSpent.toFixed(2))
      };
    });

    const enrichedCustomers = customers.map((c) => ({
      ...c,
      orderCount: statsMap[c._id.toString()]?.orderCount || 0,
      totalSpent: statsMap[c._id.toString()]?.totalSpent || 0
    }));

    res.status(200).json({
      success: true,
      count: enrichedCustomers.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      customers: enrichedCustomers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales breakdown by payment methods & date
// @route   GET /api/admin/sales
// @access  Private (Admin)
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};

    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.createdAt.$lte = end;
      }
    }

    const [posPaymentBreakdown, orderPaymentBreakdown] = await Promise.all([
      Invoice.aggregate([
        { $match: { paymentStatus: 'PAID', ...dateQuery } },
        {
          $group: {
            _id: '$paymentMethod',
            totalRevenue: { $sum: '$grandTotal' },
            transactionCount: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'CANCELLED' }, ...dateQuery } },
        {
          $group: {
            _id: '$paymentMethod',
            totalRevenue: { $sum: '$grandTotal' },
            transactionCount: { $sum: 1 }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      posPaymentBreakdown,
      orderPaymentBreakdown
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getCustomers,
  getSalesReport
};
