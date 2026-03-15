// Mock data for JDM marketplace

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  seller: string;
  rating: number;
  reviews: number;
  discount?: number;
  inStock: boolean;
  description?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
}

export interface Seller {
  id: string;
  name: string;
  logo: string;
  image: string;
  rating: number;
  followers: number;
  products: number;
  verified: boolean;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
}

// Categories
export const categories: Category[] = [
  {
    id: '1',
    name: 'Women',
    slug: 'women',
    icon: '👗',
    image: 'https://images.unsplash.com/photo-1595777707802-41d4cf4acf15?w=300',
  },
  {
    id: '2',
    name: 'Men',
    slug: 'men',
    icon: '👔',
    image: 'https://images.unsplash.com/photo-1516217343007-6b3b63d5f423?w=300',
  },
  {
    id: '3',
    name: 'Kids',
    slug: 'kids',
    icon: '👧',
    image: 'https://images.unsplash.com/photo-1577668473204-68fb8e60f2d0?w=300',
  },
  {
    id: '4',
    name: 'Jewelry',
    slug: 'jewelry',
    icon: '💍',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300',
  },
  {
    id: '5',
    name: 'Unstitched',
    slug: 'unstitched',
    icon: '🧵',
    image: 'https://images.unsplash.com/photo-1609318893291-22a2ed1ba312?w=300',
  },
  {
    id: '6',
    name: 'Brands',
    slug: 'brands',
    icon: '⭐',
    image: 'https://images.unsplash.com/photo-1487280144351-b8472da7d491?w=300',
  },
];

export const sellers: Seller[] = [
  {
    id: 's1',
    name: 'Sapphire Couture',
    logo: '/garments/product1.jpeg',
    image: '/garments/product1.jpeg',
    rating: 4.8,
    followers: 15420,
    products: 342,
    verified: true,
    description: 'Premium Pakistani fashion brand specializing in wedding wear and formal attire',
  },
  {
    id: 's2',
    name: 'Elegance Threads',
    logo: '/garments/product3.jpeg',
    image: '/garments/product3.jpeg',
    rating: 4.7,
    followers: 12300,
    products: 289,
    verified: true,
    description: 'Contemporary casual wear and everyday fashion for all occasions',
  },
  {
    id: 's3',
    name: 'Artisan Designs',
    logo: '/garments/product5.jpeg',
    image: '/garments/product5.jpeg',
    rating: 4.9,
    followers: 18900,
    products: 567,
    verified: true,
    description: 'Handcrafted designs with traditional South Asian embroidery and patterns',
  },
  {
    id: 's4',
    name: 'Urban Style Hub',
    logo: '/garments/product8.jpeg',
    image: '/garments/product8.jpeg',
    rating: 4.6,
    followers: 9800,
    products: 198,
    verified: true,
    description: 'Modern streetwear and urban fashion for the trendy crowd',
  },
  {
    id: 's5',
    name: 'Luxe Boutique',
    logo: '/garments/product11.jpeg',
    image: '/garments/product11.jpeg',
    rating: 4.9,
    followers: 22100,
    products: 456,
    verified: true,
    description: 'Luxury fashion pieces and exclusive designer collections',
  },
];

// Products - Women's Collection
const womenProducts: Product[] = [
  {
    id: 'p1',
    name: 'Embroidered Peplum Top',
    price: 2499,
    originalPrice: 3499,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop',
    category: 'women',
    seller: 's1',
    rating: 4.8,
    reviews: 234,
    discount: 28,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Emerald', 'Rose Gold'],
    description: 'Beautiful embroidered peplum top perfect for parties and formal occasions',
  },
  {
    id: 'p2',
    name: 'Casual Linen Shirt',
    price: 1599,
    originalPrice: 1999,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=500&fit=crop',
    category: 'women',
    seller: 's2',
    rating: 4.6,
    reviews: 189,
    discount: 20,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Cream', 'Sage Green'],
    description: 'Comfortable and versatile linen shirt for everyday wear',
  },
  {
    id: 'p3',
    name: 'Designer Saree',
    price: 4999,
    originalPrice: 6999,
    image: 'https://images.unsplash.com/photo-1609319058177-d3d98fc2e8b7?w=400&h=500&fit=crop',
    category: 'women',
    seller: 's3',
    rating: 4.9,
    reviews: 412,
    discount: 28,
    inStock: true,
    colors: ['Maroon', 'Gold', 'Teal'],
    description: 'Elegant designer saree with traditional embroidery',
  },
  {
    id: 'p4',
    name: 'Summer Maxi Dress',
    price: 1899,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1612336307429-8a88e8d08dbb?w=400&h=500&fit=crop',
    category: 'women',
    seller: 's2',
    rating: 4.7,
    reviews: 156,
    discount: 24,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Floral Print', 'Solid Blue', 'Mint'],
    description: 'Flowing maxi dress perfect for summer outings',
  },
  {
    id: 'p5',
    name: 'Formal Blazer',
    price: 3299,
    originalPrice: 4299,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop',
    category: 'women',
    seller: 's4',
    rating: 4.5,
    reviews: 78,
    discount: 23,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Charcoal'],
    description: 'Professional formal blazer for work and business meetings',
  },
  {
    id: 'p6',
    name: 'Silk Kurta with Dupattas',
    price: 3599,
    originalPrice: 4799,
    image: 'https://images.unsplash.com/photo-1550614000-4895a10e223d?w=400&h=500&fit=crop',
    category: 'women',
    seller: 's5',
    rating: 4.9,
    reviews: 523,
    discount: 25,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Royal Blue', 'Cranberry', 'Emerald'],
    description: 'Premium silk kurta with matching dupattas',
  },
];

// Products - Men's Collection
const menProducts: Product[] = [
  {
    id: 'p7',
    name: 'Premium Cotton Shirt',
    price: 1799,
    originalPrice: 2399,
    image: 'https://images.unsplash.com/photo-1596362051733-b3c3ca199ab8?w=400&h=500&fit=crop',
    category: 'men',
    seller: 's2',
    rating: 4.7,
    reviews: 267,
    discount: 25,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Blue', 'Black'],
    description: 'High-quality cotton shirt for casual and formal wear',
  },
  {
    id: 'p8',
    name: 'Formal Shalwar Kameez',
    price: 4299,
    originalPrice: 5999,
    image: 'https://images.unsplash.com/photo-1617137350418-f05b7d1fa32f?w=400&h=500&fit=crop',
    category: 'men',
    seller: 's1',
    rating: 4.8,
    reviews: 398,
    discount: 28,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Cream', 'Navy', 'Charcoal'],
    description: 'Traditional formal shalwar kameez for weddings and special occasions',
  },
  {
    id: 'p9',
    name: 'Casual Jeans',
    price: 1999,
    originalPrice: 2799,
    image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=500&fit=crop',
    category: 'men',
    seller: 's4',
    rating: 4.6,
    reviews: 312,
    discount: 28,
    inStock: true,
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Dark Blue', 'Black', 'Light Blue'],
    description: 'Comfortable casual denim jeans for everyday wear',
  },
  {
    id: 'p10',
    name: 'Sports T-Shirt',
    price: 899,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    category: 'men',
    seller: 's2',
    rating: 4.5,
    reviews: 189,
    discount: 30,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Gray', 'Navy'],
    description: 'Perfect t-shirt for sports and casual activities',
  },
  {
    id: 'p11',
    name: 'Designer Waistcoat',
    price: 2899,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1568756499200-011a83cfb437?w=400&h=500&fit=crop',
    category: 'men',
    seller: 's3',
    rating: 4.9,
    reviews: 145,
    discount: 27,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Maroon', 'Navy', 'Olive'],
    description: 'Stylish designer waistcoat for formal occasions',
  },
];

// Products - Kids Collection
const kidsProducts: Product[] = [
  {
    id: 'p12',
    name: 'Colorful Printed Frock',
    price: 899,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1503919545889-48854d7ee213?w=400&h=500&fit=crop',
    category: 'kids',
    seller: 's2',
    rating: 4.7,
    reviews: 123,
    discount: 30,
    inStock: true,
    sizes: ['2', '3', '4', '5', '6'],
    colors: ['Pink', 'Purple', 'Blue'],
    description: 'Cute and colorful printed frock for little girls',
  },
  {
    id: 'p13',
    name: 'Kids Shalwar Suit',
    price: 1299,
    originalPrice: 1799,
    image: 'https://images.unsplash.com/photo-1577668473204-68fb8e60f2d0?w=400&h=500&fit=crop',
    category: 'kids',
    seller: 's1',
    rating: 4.8,
    reviews: 234,
    discount: 27,
    inStock: true,
    sizes: ['1-2', '2-3', '3-4', '4-5'],
    colors: ['Green', 'Blue', 'Red'],
    description: 'Traditional shalwar suit for kids in festive colors',
  },
  {
    id: 'p14',
    name: 'Boys Casual Shirt',
    price: 699,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1519238263530-de4fb1b2b39d?w=400&h=500&fit=crop',
    category: 'kids',
    seller: 's4',
    rating: 4.5,
    reviews: 87,
    discount: 30,
    inStock: true,
    sizes: ['2-3', '3-4', '4-5', '5-6'],
    colors: ['White', 'Blue', 'Stripes'],
    description: 'Comfortable casual shirt for growing boys',
  },
];

// Products - Jewelry Collection
const jewelryProducts: Product[] = [
  {
    id: 'p15',
    name: 'Gold Bridal Set',
    price: 12999,
    originalPrice: 17999,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop',
    category: 'jewelry',
    seller: 's5',
    rating: 4.9,
    reviews: 567,
    discount: 28,
    inStock: true,
    colors: ['24K Gold', '22K Gold'],
    description: 'Exquisite bridal jewelry set with premium gold',
  },
  {
    id: 'p16',
    name: 'Silver Bangles',
    price: 1599,
    originalPrice: 2299,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
    category: 'jewelry',
    seller: 's3',
    rating: 4.7,
    reviews: 289,
    discount: 30,
    inStock: true,
    colors: ['Silver', 'Oxidized Silver'],
    description: 'Beautiful traditional silver bangles set',
  },
  {
    id: 'p17',
    name: 'Diamond Earrings',
    price: 4999,
    originalPrice: 6999,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop',
    category: 'jewelry',
    seller: 's5',
    rating: 4.8,
    reviews: 178,
    discount: 28,
    inStock: true,
    colors: ['Gold', 'White Gold'],
    description: 'Elegant diamond earrings for special occasions',
  },
];

// All products combined
export const allProducts: Product[] = [
  ...womenProducts,
  ...menProducts,
  ...kidsProducts,
  ...jewelryProducts,
];

// Featured products for homepage
export const featuredProducts = allProducts.slice(0, 8);

// Helper functions
export function getProductsByCategory(category: string): Product[] {
  return allProducts.filter((p) => p.category === category);
}

export function getProductsBySeller(sellerId: string): Product[] {
  return allProducts.filter((p) => p.seller === sellerId);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery))
  );
}

export function getSellerById(id: string): Seller | undefined {
  return sellers.find((s) => s.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
