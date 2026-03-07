'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Continue shopping to find amazing products
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const total = getTotal();
  const shipping = total > 1000 ? 0 : 200;
  const tax = Math.round(total * 0.17); // 17% GST
  const finalTotal = total + shipping + tax;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          You have {items.length} item{items.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-border p-4 flex gap-4"
              >
                {/* Product Image */}
                <Link href={`/product/${item.id}`} className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1">
                  <Link href={`/product/${item.id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors mb-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">
                    By {item.seller}
                  </p>

                  {/* Selected options */}
                  <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                  </div>

                  {/* Price */}
                  <p className="font-bold text-primary">Rs. {item.price}</p>
                </div>

                {/* Quantity and Remove */}
                <div className="flex flex-col items-end justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-secondary rounded p-1">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="p-1 hover:bg-primary hover:text-primary-foreground rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-primary hover:text-primary-foreground rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      removeFromCart(item.id);
                      toast.success('Item removed from cart');
                    }}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* Line Total */}
                  <p className="font-bold mt-2">
                    Rs. {item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <Link href="/">
            <Button variant="outline" className="mt-6">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Order Summary */}
        <div className="bg-secondary rounded-lg p-6 h-fit sticky top-20">
          <h2 className="text-lg font-bold mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6 pb-6 border-b border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">Rs. {total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Shipping {total > 1000 ? '(Free)' : ''}
              </span>
              <span className="font-semibold">
                {shipping === 0 ? 'Free' : `Rs. ${shipping}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (17% GST)</span>
              <span className="font-semibold">Rs. {tax}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-primary">Rs. {finalTotal}</span>
          </div>

          <Button
            onClick={handleCheckout}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-3"
          >
            Proceed to Checkout
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              clearCart();
              toast.success('Cart cleared');
            }}
          >
            Clear Cart
          </Button>

          {/* Info */}
          <div className="mt-6 p-4 bg-background rounded text-sm text-muted-foreground space-y-2">
            <p>✓ Free shipping on orders above Rs. 1000</p>
            <p>✓ 7 days easy return policy</p>
            <p>✓ Secure checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
