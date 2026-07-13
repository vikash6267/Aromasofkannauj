import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { orderAPI } from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Package, Truck, Clock, CheckCircle } from 'lucide-react';

const UserOrders = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: ordersResp, isLoading } = useQuery({
    queryKey: ['userOrders', user?._id],
    queryFn: () => orderAPI.getUserOrders(user?._id as string),
    enabled: !!user?._id && isAuthenticated
  });

  const orders = ordersResp?.orders || [];

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your orders.</p>
          <Button asChild>
            <Link to="/auth">Go to Login</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-serif font-bold mb-8">Your Orders</h1>

        {isLoading ? (
          <div className="text-center py-12">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-secondary/30 rounded-lg">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
            <Button asChild>
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order._id} className="border rounded-lg p-6 bg-white shadow-sm">
                <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Order ID: ORD-{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="font-medium text-lg">Total: ₹{(order.totalAmount || 0).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {order.status === 'pending' && <Clock size={16} className="text-yellow-500" />}
                      {order.status === 'processing' && <Package size={16} className="text-blue-500" />}
                      {order.status === 'shipped' && <Truck size={16} className="text-indigo-500" />}
                      {order.status === 'delivered' && <CheckCircle size={16} className="text-green-500" />}
                      <span className="capitalize font-medium">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-b pb-4 mb-4">
                   <Button variant="outline" size="sm" asChild>
                     <Link to={`/order/${order._id}`}>View Full Details</Link>
                   </Button>
                </div>

                <div className="space-y-4">
                  {order.products.map((item: any) => (
                    <div key={item._id} className="flex items-center">
                      <div className="w-16 h-16 bg-secondary rounded overflow-hidden mr-4">
                        <img 
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.productId?.name || 'Product'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.productId?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} | Size: {item.size}
                        </p>
                      </div>
                      <div className="font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserOrders;
