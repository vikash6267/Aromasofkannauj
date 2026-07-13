import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: orderData, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getById(id as string),
    enabled: !!id
  });

  const order = orderData?.order;

  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-16 flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (isError || !order) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link to="/orders">Return to Orders</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const orderItems = order.products || [];

  return (
    <Layout>
      <div className="container-custom py-8">
        <Link to="/orders" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft size={16} className="mr-1" />
          Back to Orders
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Order Details</h1>
            <p className="text-muted-foreground font-medium">Order ID: ORD-{order._id.substring(order._id.length - 6).toUpperCase()}</p>
          </div>
          
          <Button variant="outline" className="mt-4 md:mt-0">
            <Download size={16} className="mr-2" />
            Download Invoice
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item: any, index: number) => (
                    <div key={index} className="flex items-start border-b last:border-0 pb-4 last:pb-0">
                      <div className="w-16 h-16 bg-secondary rounded overflow-hidden shrink-0 mr-4">
                        <img 
                          src={item.productId?.images?.[0] || '/placeholder.svg'} 
                          alt={item.productId?.name || 'Product'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-medium">
                          {item.productId?.name || item.name || 'Unknown Product'}
                        </h3>
                        <div className="flex flex-wrap text-sm text-muted-foreground mt-1">
                          <span className="mr-4">Qty: {item.quantity || 1}</span>
                          <span>Size: {item.size || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">₹{(item.price || 0).toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{((order.totalAmount || 0) * 0.82).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{((order.totalAmount || 0) * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{((order.totalAmount || 0) * 0.1).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1 text-sm text-muted-foreground">Delivery Address</h4>
                    <p className="text-sm font-medium">
                      {typeof order.shippingAddress === 'string' 
                        ? order.shippingAddress 
                        : `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}, ${order.shippingAddress?.country || ''}`}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1 text-sm text-muted-foreground">Status</h4>
                    <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1 text-sm text-muted-foreground">Payment Method</h4>
                    <p className="text-sm font-medium capitalize">
                      {order.paymentMethod || 'Card'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;
