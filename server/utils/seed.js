require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const InventoryTransaction = require('../models/InventoryTransaction');
const { calculateBillTotals } = require('./weightCalculator');
const { generateInvoiceNumber, generateOrderNumber } = require('./invoiceGenerator');

const sampleCategories = [
  {
    name: 'Leafy Vegetables',
    description: 'Fresh crisp leafy greens rich in iron and vitamins',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Root Vegetables',
    description: 'Farm-fresh underground roots and tubers',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fresh Fruits',
    description: 'Naturally ripened, sweet, juicy seasonal fruits',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seasonal Vegetables',
    description: 'Fresh harvest sourced directly from regional farmers',
    image: 'https://images.unsplash.com/photo-1597362075604-be6a88b8f2c2?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Organic Products',
    description: 'Pesticide-free certified naturally grown vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  }
];

const sampleProducts = [
  // Leafy Vegetables
  {
    name: 'Fresh Spinach (Palak)',
    description: 'Tender and pesticide-free green spinach leaves loaded with iron and minerals.',
    category: 'Leafy Vegetables',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 40,
    stockInGrams: 25000,
    isFeatured: true
  },
  {
    name: 'Fresh Coriander (Dhania)',
    description: 'Aromatic farm-fresh coriander bunch, perfect for garnishing Indian curries.',
    category: 'Leafy Vegetables',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 60,
    stockInGrams: 15000,
    isFeatured: false
  },
  {
    name: 'Fresh Mint (Pudina)',
    description: 'Cooling, aromatic mint leaves ideal for chutneys and summer drinks.',
    category: 'Leafy Vegetables',
    image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 70,
    stockInGrams: 12000,
    isFeatured: false
  },
  {
    name: 'Green Cabbage (Patta Gobhi)',
    description: 'Crisp, tightly layered cabbage heads picked fresh from the fields.',
    category: 'Leafy Vegetables',
    image: 'https://images.unsplash.com/photo-1551893478-d726eaf0442c?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 35,
    stockInGrams: 30000,
    isFeatured: true
  },

  // Root Vegetables
  {
    name: 'Fresh Potato (Aloo)',
    description: 'Versatile farm-fresh golden potatoes suitable for curries, baking, and fries.',
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 30,
    stockInGrams: 50000,
    isFeatured: true
  },
  {
    name: 'Red Onion (Pyaaz)',
    description: 'Pungent, flavorful Indian red onions, a kitchen essential for daily cooking.',
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 45,
    stockInGrams: 45000,
    isFeatured: true
  },
  {
    name: 'Juicy Carrot (Gajar)',
    description: 'Sweet and crunchy orange carrots rich in beta-carotene and vitamin A.',
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 50,
    stockInGrams: 28000,
    isFeatured: false
  },
  {
    name: 'Beetroot (Chukandar)',
    description: 'Earthy, deep red beetroots packed with antioxidants and fiber.',
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 55,
    stockInGrams: 18000,
    isFeatured: false
  },

  // Fresh Fruits
  {
    name: 'Royal Gala Apple',
    description: 'Crisp, sweet, and aromatic premium apples handpicked from Shimla orchards.',
    category: 'Fresh Fruits',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 140,
    stockInGrams: 20000,
    isFeatured: true
  },
  {
    name: 'Robusta Banana',
    description: 'Sweet, energy-packed yellow bananas, naturally ripened with zero chemicals.',
    category: 'Fresh Fruits',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 45,
    stockInGrams: 35000,
    isFeatured: true
  },
  {
    name: 'Nagpur Sweet Orange',
    description: 'Juicy citrus oranges packed with vitamin C and refreshing flavor.',
    category: 'Fresh Fruits',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 80,
    stockInGrams: 25000,
    isFeatured: false
  },
  {
    name: 'Ruby Pomegranate (Anar)',
    description: 'Deep crimson jewel seeds rich in antioxidants and heart-healthy nutrients.',
    category: 'Fresh Fruits',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 160,
    stockInGrams: 18000,
    isFeatured: true
  },

  // Seasonal Vegetables
  {
    name: 'Hybrid Tomato (Tamatar)',
    description: 'Firm, plump red tomatoes with balanced sweetness and acidity.',
    category: 'Seasonal Vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 40,
    stockInGrams: 40000,
    isFeatured: true
  },
  {
    name: 'Green Peas (Matar)',
    description: 'Freshly podded sweet green peas, tender and bursting with freshness.',
    category: 'Seasonal Vegetables',
    image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 90,
    stockInGrams: 20000,
    isFeatured: true
  },
  {
    name: 'Fresh Ladyfinger (Bhindi)',
    description: 'Crisp, slender tender green okras with soft seeds, ideal for stir-fry.',
    category: 'Seasonal Vegetables',
    image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 60,
    stockInGrams: 22000,
    isFeatured: false
  },
  {
    name: 'Green Capsicum (Shimla Mirch)',
    description: 'Crunchy bell peppers packed with vibrant flavor for noodles, salads and curries.',
    category: 'Seasonal Vegetables',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 75,
    stockInGrams: 20000,
    isFeatured: false
  },

  // Organic Products
  {
    name: 'Certified Organic Baby Spinach',
    description: 'Grown in pesticide-free certified organic soil without synthetic chemicals.',
    category: 'Organic Products',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 65,
    stockInGrams: 15000,
    isFeatured: true
  },
  {
    name: 'Organic Sweet Corn',
    description: 'Naturally sweet and juicy organic golden corn cobs fresh from harvest.',
    category: 'Organic Products',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 70,
    stockInGrams: 18000,
    isFeatured: false
  },
  {
    name: 'Organic Cherry Tomatoes',
    description: 'Bite-sized sweet explosion of flavor grown organically without pesticides.',
    category: 'Organic Products',
    image: 'https://images.unsplash.com/photo-1546470427-227c7369a94d?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 110,
    stockInGrams: 12000,
    isFeatured: true
  }
];

const seedData = async () => {
  try {
    console.log('🌱 Starting Green Grocery Database Seeding...');
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Category.deleteMany(),
      Invoice.deleteMany(),
      Order.deleteMany(),
      InventoryTransaction.deleteMany()
    ]);
    console.log('🧹 Existing collections cleared.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Super Admin',
        email: 'admin@greengrocery.com',
        phone: '9876543210',
        password: 'Admin@12345',
        role: 'ADMIN',
        addresses: [
          {
            street: '101 Orchard Boulevard, Market Complex',
            city: 'Bengaluru',
            pincode: '560001',
            state: 'Karnataka',
            isDefault: true
          }
        ]
      },
      {
        name: 'Shop Cashier Staff',
        email: 'staff@greengrocery.com',
        phone: '9876543211',
        password: 'Staff@12345',
        role: 'STAFF',
        addresses: [
          {
            street: 'Shop No 4, Green Grocery Center',
            city: 'Bengaluru',
            pincode: '560001',
            state: 'Karnataka',
            isDefault: true
          }
        ]
      },
      {
        name: 'Rahul Sharma',
        email: 'customer@greengrocery.com',
        phone: '9876543212',
        password: 'Customer@12345',
        role: 'CUSTOMER',
        addresses: [
          {
            street: 'Flat 402, Green Meadows Apartment',
            city: 'Bengaluru',
            pincode: '560034',
            state: 'Karnataka',
            landmark: 'Near Koramangala Club',
            isDefault: true
          }
        ]
      }
    ]);
    console.log(`👤 Created ${users.length} users (Admin, Staff, Customer).`);

    const adminUser = users[0];
    const staffUser = users[1];
    const customerUser = users[2];

    // 2. Create Categories
    const categories = await Category.create(sampleCategories);
    console.log(`🏷️ Created ${categories.length} categories.`);

    // 3. Create Products & initial inventory transactions
    const products = await Product.create(sampleProducts);
    console.log(`🥦 Created ${products.length} products.`);

    const initialTransactions = products.map((prod) => ({
      product: prod._id,
      productName: prod.name,
      transactionType: 'RESTOCK',
      quantityInGrams: prod.stockInGrams,
      previousStock: 0,
      updatedStock: prod.stockInGrams,
      referenceId: 'INITIAL_IMPORT',
      performedBy: adminUser._id,
      performerName: adminUser.name,
      notes: 'Initial inventory bootstrap'
    }));
    await InventoryTransaction.insertMany(initialTransactions);

    // 4. Create Sample Invoices (POS transactions)
    const tomato = products.find((p) => p.name.includes('Tomato'));
    const potato = products.find((p) => p.name.includes('Potato'));
    const onion = products.find((p) => p.name.includes('Onion'));
    const spinach = products.find((p) => p.name.includes('Spinach'));

    const posItems = [
      {
        product: tomato._id,
        name: tomato.name,
        ratePerKg: tomato.pricePerKg,
        weightInGrams: 750,
        amount: 30
      },
      {
        product: potato._id,
        name: potato.name,
        ratePerKg: potato.pricePerKg,
        weightInGrams: 2000,
        amount: 60
      },
      {
        product: onion._id,
        name: onion.name,
        ratePerKg: onion.pricePerKg,
        weightInGrams: 500,
        amount: 22.5
      }
    ];

    const totals = calculateBillTotals(posItems, 0, 0, 0);

    const invoice1 = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      customerDetails: {
        name: 'Sunita Devi',
        phone: '9845012345'
      },
      items: posItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      grandTotal: totals.grandTotal,
      amountReceived: 120,
      changeReturned: 7.5,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      createdBy: staffUser._id,
      cashierName: staffUser.name
    });

    // 5. Create Sample Online Order
    const orderItems = [
      {
        product: spinach._id,
        name: spinach.name,
        image: spinach.image,
        pricePerKg: spinach.pricePerKg,
        weightInGrams: 500,
        totalPrice: 20
      },
      {
        product: tomato._id,
        name: tomato.name,
        image: tomato.image,
        pricePerKg: tomato.pricePerKg,
        weightInGrams: 1000,
        totalPrice: 40
      }
    ];
    const orderTotals = calculateBillTotals(orderItems, 0, 0, 40);

    await Order.create({
      orderNumber: generateOrderNumber(),
      customerId: customerUser._id,
      customerDetails: {
        name: customerUser.name,
        email: customerUser.email,
        phone: customerUser.phone
      },
      items: orderItems,
      deliveryAddress: customerUser.addresses[0],
      subtotal: orderTotals.subtotal,
      discount: orderTotals.discount,
      tax: orderTotals.tax,
      deliveryCharge: 40,
      grandTotal: orderTotals.grandTotal,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      statusHistory: [
        {
          status: 'PLACED',
          timestamp: new Date(),
          note: 'Initial order placed by customer'
        }
      ]
    });

    console.log('✅ Seeding completed successfully!');
    console.log(`
===================================================
🌱 GREEN GROCERY INITIALIZED SUCCESSFULLY
===================================================
Default Credentials:
  Admin:    admin@greengrocery.com    / Admin@12345
  Staff:    staff@greengrocery.com    / Staff@12345
  Customer: customer@greengrocery.com / Customer@12345
===================================================
`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
