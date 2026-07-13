const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel'); // Assuming productModel exists
const connectDB = require('./config/db');

dotenv.config();

const mockPerfumes = [
  {
    name: 'Oud Al Amir',
    price: 2499,
    description: 'A luxurious blend of premium agarwood, rose, and amber. Perfect for special occasions.',
    category: 'Men',
    type: 'Attar',
    stock: 50,
    featured: true,
    rating: 4.8,
    reviewCount: 124,
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600'],
    notes: ['Oud', 'Rose', 'Amber', 'Sandalwood'],
    sizes: [{ size: '10ml', price: 2499 }, { size: '30ml', price: 6499 }]
  },
  {
    name: 'Jasmine Royal',
    price: 1899,
    description: 'Pure Kannauj jasmine distilled traditionally. A light, floral everyday fragrance.',
    category: 'Women',
    type: 'Perfume',
    stock: 120,
    featured: true,
    rating: 4.6,
    reviewCount: 89,
    images: ['https://images.unsplash.com/photo-1595425970377-c9703c58e230?auto=format&fit=crop&q=80&w=600'],
    notes: ['Jasmine', 'Vanilla', 'Musk'],
    sizes: [{ size: '50ml', price: 1899 }, { size: '100ml', price: 3499 }]
  },
  {
    name: 'Sandalwood Supreme',
    price: 3299,
    description: 'Authentic Mysore sandalwood attar. Earthy, woody, and deeply calming.',
    category: 'Unisex',
    type: 'Attar',
    stock: 35,
    featured: true,
    rating: 4.9,
    reviewCount: 215,
    images: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600'],
    notes: ['Sandalwood', 'Cedar', 'Vetiver'],
    sizes: [{ size: '10ml', price: 3299 }, { size: '30ml', price: 8999 }]
  },
  {
    name: 'Rose Damascena',
    price: 2199,
    description: 'The pure essence of Damask roses. Sweet, romantic, and timeless.',
    category: 'Women',
    type: 'Attar',
    stock: 80,
    featured: false,
    rating: 4.7,
    reviewCount: 156,
    images: ['https://images.unsplash.com/photo-1615160533560-681b37c02b28?auto=format&fit=crop&q=80&w=600'],
    notes: ['Rose', 'Patchouli', 'Vanilla'],
    sizes: [{ size: '10ml', price: 2199 }]
  },
  {
    name: 'Midnight Musk',
    price: 2799,
    description: 'A bold, sensual musk fragrance designed for evening wear.',
    category: 'Men',
    type: 'Perfume',
    stock: 65,
    featured: true,
    rating: 4.5,
    reviewCount: 78,
    images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600'],
    notes: ['Musk', 'Leather', 'Spices', 'Bergamot'],
    sizes: [{ size: '50ml', price: 2799 }, { size: '100ml', price: 4999 }]
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Remove existing products
    await Product.deleteMany();
    console.log('Existing products cleared');

    // Insert new products
    const inserted = await Product.insertMany(mockPerfumes);
    console.log(`${inserted.length} products inserted`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
