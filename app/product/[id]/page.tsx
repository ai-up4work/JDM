'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Heart, ShoppingCart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { allProducts, getSellerById } from '@/lib/mockData';
import { useWishlistStore, useCartStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const product = allProducts.find((p) => p.id === productId);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product not found</h1>
      </div>
    );
  }

  const seller = getSellerById(product.seller);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart!`);
    setQuantity(1);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="bg-secondary rounded-lg overflow-hidden h-96 md:h-[500px]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* More image thumbnails can go here */}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < Math.round(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted'
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Stock Status */}
            <p className={`text-sm font-semibold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? '✓ In Stock' : 'Out of Stock'}
            </p>
          </div>

          {/* Price */}
          <div className="border-b border-border pb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-primary">Rs. {product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  Rs. {product.originalPrice}
                </span>
              )}
            </div>
            {product.discount && (
              <p className="text-sm text-accent font-semibold">
                Save Rs. {product.originalPrice! - product.price} ({product.discount}% off)
              </p>
            )}
          </div>

          {/* Seller Info */}
          {seller && (
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Sold by</p>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{seller.name}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Star size={14} className="fill-accent text-accent" />
                    <span>{seller.rating} ({seller.followers} followers)</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Visit Store
                </Button>
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="text-sm font-semibold mb-3 block">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded transition-colors ${
                      selectedSize === size
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="text-sm font-semibold mb-3 block">Color</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 border border-border rounded hover:bg-secondary"
              >
                −
              </button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 border border-border rounded hover:bg-secondary"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 border-t border-b border-border py-6">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ShoppingCart size={20} className="mr-2" />
              Add to Cart
            </Button>
            <Button
              onClick={handleWishlistToggle}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Heart
                size={20}
                className={`mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
              />
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              <Share2 size={20} className="mr-2" />
              Share
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Truck className="text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-sm text-muted-foreground">On orders above Rs. 1000</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Shield className="text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold">Authentic Guarantee</p>
                <p className="text-sm text-muted-foreground">100% genuine products</p>
              </div>
            </div>
            <div className="flex gap-3">
              <RotateCcw className="text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold">Easy Returns</p>
                <p className="text-sm text-muted-foreground">7 days return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="mb-16 border-t border-border pt-8">
        <h2 className="text-2xl font-bold mb-4">Product Description</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {product.description ||
            `Beautiful and elegant product from ${product.seller}. This item is carefully selected for quality and style. 
          Perfect for any occasion, it combines comfort with contemporary design. Available in multiple sizes and colors 
          to match your preference.`}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary p-4 rounded">
            <p className="text-xs text-muted-foreground mb-1">Material</p>
            <p className="font-semibold">Premium Fabric</p>
          </div>
          <div className="bg-secondary p-4 rounded">
            <p className="text-xs text-muted-foreground mb-1">Care</p>
            <p className="font-semibold">Hand Wash</p>
          </div>
          <div className="bg-secondary p-4 rounded">
            <p className="text-xs text-muted-foreground mb-1">Origin</p>
            <p className="font-semibold">Pakistan</p>
          </div>
          <div className="bg-secondary p-4 rounded">
            <p className="text-xs text-muted-foreground mb-1">Shipping</p>
            <p className="font-semibold">Nationwide</p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
