import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { orderAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const Checkout = () => {
  const { items, couponDiscount } = useSelector((state: RootState) => state.cart);
  const user = useSelector((state: RootState) => state.auth?.user) || JSON.parse(localStorage.getItem('perfume-user') || '{}');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
    country: user?.address?.country || 'India'
  });

  React.useEffect(() => {
    if (user?.address) {
      setAddress({
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zip: user.address.zip || '',
        country: user.address.country || 'India'
      });
    }
  }, [user?.address]);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = couponDiscount > 0 ? (subtotal * couponDiscount) / 100 : 0;
  const total = subtotal - discount;

  // Redirect to shop if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      toast({ title: 'Cart is empty', description: 'Please add items to your cart to checkout.' });
      navigate('/shop');
    }
  }, [items, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user._id) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to complete your order.',
        variant: 'destructive',
      });
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!address.street || !address.city || !address.state || !address.zip) {
      toast({
        title: 'Incomplete Address',
        description: 'Please fill in all the address fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        userId: user._id,
        products: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        })),
        totalAmount: total,
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.zip,
          country: address.country
        },
        paymentMethod
      };

      await orderAPI.create(orderData);
      
      // Clear cart and redirect
      dispatch(clearCart());
      toast({
        title: 'Order Placed Successfully!',
        description: 'You can track your order in your profile.',
      });
      navigate('/orders');
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Order Failed',
        description: error.response?.data?.message || 'Something went wrong while placing your order.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-serif font-bold mb-8 text-center">Checkout</h1>
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Checkout Form */}
          <div className="md:w-2/3">
            <form onSubmit={handleCheckout} className="space-y-8">
              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-medium mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" name="street" value={address.street} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={address.city} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={address.state} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input id="zip" name="zip" value={address.zip} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" value={address.country} onChange={handleChange} disabled />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-medium mb-4">Payment Method</h2>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit / Debit Card</SelectItem>
                    <SelectItem value="upi">UPI / Netbanking</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading || items.length === 0}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-secondary/30 p-6 rounded-lg sticky top-24">
              <h2 className="text-xl font-medium mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-sm border-b border-border/50 pb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-white rounded overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium max-w-[120px] truncate">{item.name}</p>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity} | {item.size}</p>
                      </div>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
