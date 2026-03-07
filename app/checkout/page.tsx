'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState<'info' | 'payment' | 'confirm'>('info');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const total = getTotal();
  const shipping = total > 1000 ? 0 : 200;
  const tax = Math.round(total * 0.17);
  const finalTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/cart">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Back to Cart
          </Button>
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateShippingInfo = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.postalCode
    ) {
      toast.error('Please fill in all fields');
      return false;
    }
    return true;
  };

  const validatePaymentInfo = () => {
    if (
      !formData.cardName ||
      !formData.cardNumber ||
      !formData.expiryDate ||
      !formData.cvv
    ) {
      toast.error('Please fill in all payment details');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validatePaymentInfo()) return;

    // Simulate payment processing
    toast.loading('Processing payment...');
    setTimeout(() => {
      clearCart();
      setStep('confirm');
      toast.dismiss();
      toast.success('Order placed successfully!');
    }, 2000);
  };

  const steps = [
    { id: 'info', label: 'Shipping Info', completed: false },
    { id: 'payment', label: 'Payment', completed: false },
    { id: 'confirm', label: 'Confirmation', completed: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['info', 'payment', 'confirm'].map((stepId, index) => (
            <div key={stepId} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === stepId
                    ? 'bg-primary text-primary-foreground'
                    : step === 'confirm'
                      ? 'bg-green-600 text-white'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {step === stepId ? index + 1 : step === 'confirm' ? <Check size={20} /> : index + 1}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">
                  {stepId === 'info'
                    ? 'Shipping Information'
                    : stepId === 'payment'
                      ? 'Payment Details'
                      : 'Order Confirmation'}
                </p>
              </div>
              {index < 2 && (
                <ChevronRight className="text-muted-foreground mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* Shipping Info Step */}
          {step === 'info' && (
            <div className="bg-white rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+94 XXX XXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Address
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">City</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Postal Code
                    </label>
                    <Input
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal code"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (validateShippingInfo()) {
                    setStep('payment');
                  }
                }}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue to Payment <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          )}

          {/* Payment Info Step */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Cardholder Name
                  </label>
                  <Input
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="Name on card"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Card Number
                  </label>
                  <Input
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Expiry Date
                    </label>
                    <Input
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">CVV</label>
                    <Input
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-800">
                  ℹ️ This is a demo. Use test card: 4111 1111 1111 1111
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep('info')}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Place Order
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirm' && (
            <div className="bg-white rounded-lg border border-border p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. Your order has been successfully placed.
                You will receive a confirmation email shortly.
              </p>

              <div className="bg-secondary rounded p-4 text-left mb-8">
                <p className="text-sm font-medium mb-2">Order Number</p>
                <p className="text-lg font-bold">LAM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>

              <div className="space-y-2 mb-8 text-left">
                <div className="flex justify-between pb-2 border-b border-border">
                  <span>Estimated Delivery:</span>
                  <span className="font-semibold">3-5 Business Days</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border">
                  <span>Tracking:</span>
                  <span className="font-semibold">Will be sent via email</span>
                </div>
              </div>

              <Link href="/">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-secondary rounded-lg p-6 h-fit sticky top-20">
          <h3 className="text-lg font-bold mb-4">Order Summary</h3>

          <div className="space-y-3 mb-6 pb-6 border-b border-border">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="font-semibold">Rs. {item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-6 pb-6 border-b border-border">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>Rs. {total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (17%)</span>
              <span>Rs. {tax}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="font-bold">Total</span>
            <span className="text-xl font-bold text-primary">Rs. {finalTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
