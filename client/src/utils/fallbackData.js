export const fallbackCategories = [
  { name: 'Leafy Vegetables', count: 4 },
  { name: 'Root Vegetables', count: 4 },
  { name: 'Fresh Fruits', count: 4 },
  { name: 'Seasonal Vegetables', count: 4 },
  { name: 'Organic Products', count: 3 }
];

export const fallbackProducts = [
  // Leafy Vegetables
  {
    _id: 'prod_leafy_01',
    name: 'Fresh Spinach (Palak)',
    description: 'Tender and pesticide-free green spinach leaves loaded with iron and minerals.',
    category: 'Leafy Vegetables',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 40,
    stockInGrams: 25000,
    stockInKg: 25,
    isFeatured: true,
    isAvailable: true
  },
  {
    _id: 'prod_leafy_02',
    name: 'Fresh Coriander (Dhania)',
    description: 'Aromatic farm-fresh coriander bunch, perfect for garnishing Indian curries.',
    category: 'Leafy Vegetables',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 60,
    stockInGrams: 15000,
    stockInKg: 15,
    isFeatured: false,
    isAvailable: true
  },
  {
    _id: 'prod_leafy_03',
    name: 'Fresh Mint (Pudina)',
    description: 'Cooling, aromatic mint leaves ideal for chutneys and summer drinks.',
    category: 'Leafy Vegetables',
    image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 70,
    stockInGrams: 12000,
    stockInKg: 12,
    isFeatured: false,
    isAvailable: true
  },
  {
    _id: 'prod_leafy_04',
    name: 'Green Cabbage (Patta Gobhi)',
    description: 'Crisp, tightly layered cabbage heads picked fresh from the fields.',
    category: 'Leafy Vegetables',
    image: 'https://images.unsplash.com/photo-1551893478-d726eaf0442c?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 35,
    stockInGrams: 30000,
    stockInKg: 30,
    isFeatured: true,
    isAvailable: true
  },

  // Root Vegetables
  {
    _id: 'prod_root_01',
    name: 'Fresh Potato (Aloo)',
    description: 'Versatile farm-fresh golden potatoes suitable for curries, baking, and fries.',
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 30,
    stockInGrams: 50000,
    stockInKg: 50,
    isFeatured: true,
    isAvailable: true
  },
  {
    _id: 'prod_root_02',
    name: 'Red Onion (Pyaaz)',
    description: 'Pungent, flavorful Indian red onions, a kitchen essential for daily cooking.',
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 45,
    stockInGrams: 45000,
    stockInKg: 45,
    isFeatured: true,
    isAvailable: true
  },
  {
    _id: 'prod_root_03',
    name: 'Juicy Carrot (Gajar)',
    description: 'Sweet and crunchy orange carrots rich in beta-carotene and vitamin A.',
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 50,
    stockInGrams: 28000,
    stockInKg: 28,
    isFeatured: false,
    isAvailable: true
  },
  {
    _id: 'prod_root_04',
    name: 'Beetroot (Chukandar)',
    description: 'Earthy, deep red beetroots packed with antioxidants and fiber.',
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 55,
    stockInGrams: 18000,
    stockInKg: 18,
    isFeatured: false,
    isAvailable: true
  },

  // Fresh Fruits
  {
    _id: 'prod_fruit_01',
    name: 'Royal Gala Apple',
    description: 'Crisp, sweet, and aromatic premium apples handpicked from Shimla orchards.',
    category: 'Fresh Fruits',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 140,
    stockInGrams: 20000,
    stockInKg: 20,
    isFeatured: true,
    isAvailable: true
  },
  {
    _id: 'prod_fruit_02',
    name: 'Robusta Banana',
    description: 'Sweet, energy-packed yellow bananas, naturally ripened with zero chemicals.',
    category: 'Fresh Fruits',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 45,
    stockInGrams: 35000,
    stockInKg: 35,
    isFeatured: true,
    isAvailable: true
  },
  {
    _id: 'prod_fruit_03',
    name: 'Nagpur Sweet Orange',
    description: 'Juicy citrus oranges packed with vitamin C and refreshing flavor.',
    category: 'Fresh Fruits',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 80,
    stockInGrams: 25000,
    stockInKg: 25,
    isFeatured: false,
    isAvailable: true
  },
  {
    _id: 'prod_fruit_04',
    name: 'Ruby Pomegranate (Anar)',
    description: 'Deep crimson jewel seeds rich in antioxidants and heart-healthy nutrients.',
    category: 'Fresh Fruits',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 160,
    stockInGrams: 18000,
    stockInKg: 18,
    isFeatured: true,
    isAvailable: true
  },

  // Seasonal Vegetables
  {
    _id: 'prod_season_01',
    name: 'Hybrid Tomato (Tamatar)',
    description: 'Firm, plump red tomatoes with balanced sweetness and acidity.',
    category: 'Seasonal Vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 40,
    stockInGrams: 40000,
    stockInKg: 40,
    isFeatured: true,
    isAvailable: true
  },
  {
    _id: 'prod_season_02',
    name: 'Green Peas (Matar)',
    description: 'Freshly podded sweet green peas, tender and bursting with freshness.',
    category: 'Seasonal Vegetables',
    image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 90,
    stockInGrams: 20000,
    stockInKg: 20,
    isFeatured: true,
    isAvailable: true
  },
  {
    _id: 'prod_season_03',
    name: 'Fresh Ladyfinger (Bhindi)',
    description: 'Crisp, slender tender green okras with soft seeds, ideal for stir-fry.',
    category: 'Seasonal Vegetables',
    image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 60,
    stockInGrams: 22000,
    stockInKg: 22,
    isFeatured: false,
    isAvailable: true
  },
  {
    _id: 'prod_season_04',
    name: 'Green Capsicum (Shimla Mirch)',
    description: 'Crunchy bell peppers packed with vibrant flavor for noodles, salads and curries.',
    category: 'Seasonal Vegetables',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 75,
    stockInGrams: 20000,
    stockInKg: 20,
    isFeatured: false,
    isAvailable: true
  },

  // Organic Products
  {
    _id: 'prod_org_01',
    name: 'Certified Organic Baby Spinach',
    description: 'Grown in pesticide-free certified organic soil without synthetic chemicals.',
    category: 'Organic Products',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 65,
    stockInGrams: 15000,
    stockInKg: 15,
    isFeatured: true,
    isAvailable: true
  },
  {
    _id: 'prod_org_02',
    name: 'Organic Sweet Corn',
    description: 'Naturally sweet and juicy organic golden corn cobs fresh from harvest.',
    category: 'Organic Products',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 70,
    stockInGrams: 18000,
    stockInKg: 18,
    isFeatured: false,
    isAvailable: true
  },
  {
    _id: 'prod_org_03',
    name: 'Organic Cherry Tomatoes',
    description: 'Bite-sized sweet explosion of flavor grown organically without pesticides.',
    category: 'Organic Products',
    image: 'https://images.unsplash.com/photo-1546470427-227c7369a94d?w=600&auto=format&fit=crop&q=80',
    pricePerKg: 110,
    stockInGrams: 12000,
    stockInKg: 12,
    isFeatured: true,
    isAvailable: true
  }
];
