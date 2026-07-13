
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { 
  toggleCart, 
  removeItem, 
  updateQuantity, 
  clearCart,
  applyCoupon,
  removeCoupon
} from '@/store/slices/cartSlice';
import { RootState } from '@/store';
const coupons = [
  { code: 'WELCOME10', discountPercentage: 10, minPurchase: 500, isActive: true },
  { code: 'FESTIVAL20', discountPercentage: 20, minPurchase: 1500, isActive: true },
  { code: 'LUXURY25', discountPercentage: 25, minPurchase: 3000, isActive: true }
];
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CartDrawer: React.FC = () => {
  const { items, isOpen, couponCode, couponDiscount } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate total with coupon discount
  const discount = couponDiscount > 0 ? (subtotal * couponDiscount) / 100 : 0;
  const total = subtotal - discount;

  const handleQuantityChange = (id: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ id, size, quantity: newQuantity }));
  };

  const handleRemoveItem = (id: string, size: string) => {
    dispatch(removeItem({ id, size }));
  };

  const handleCouponApply = () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const coupon = coupons.find(
      c => c.code === couponInput.trim() && c.isActive && subtotal >= c.minPurchase
    );

    if (coupon) {
      dispatch(applyCoupon({ 
        code: coupon.code, 
        discount: coupon.discountPercentage 
      }));
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid or expired coupon code');
    }
  };

  const handleCouponRemove = () => {
    dispatch(removeCoupon());
    setCouponError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-serif font-semibold">Your Cart</h2>
          <button 
            onClick={() => dispatch(toggleCart())} 
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag size={48} className="text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-muted-foreground mb-6">Add items to your cart to see them here</p>
              <Button onClick={() => dispatch(toggleCart())}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex border-b pb-4">
                  <div className="w-20 h-20 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                    <p className="font-medium">₹{item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.id, item.size)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => dispatch(clearCart())}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>



        {/* Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              

              
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button className="w-full" asChild>
                <Link to="/checkout" onClick={() => dispatch(toggleCart())}>
                  Checkout
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => dispatch(toggleCart())}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
