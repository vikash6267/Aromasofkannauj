
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI, userAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { data: ordersResp, isLoading: ordersLoading } = useQuery({ queryKey: ['adminOrders'], queryFn: () => orderAPI.getAll() });
  const { data: usersResp, isLoading: usersLoading } = useQuery({ queryKey: ['adminUsers'], queryFn: () => userAPI.getAll() });

  const updateOrderMutation = useMutation({
    mutationFn: (data: {id: string, status: string}) => orderAPI.update(data.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setSelectedOrder(null);
    }
  });

  const orders = ordersResp?.orders || [];
  const users = usersResp?.users || [];

  // Add safety checks
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Filter orders based on search and status
  const filteredOrders = safeOrders.filter(order => {
    const matchesSearch = order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = !statusFilter || statusFilter === 'all' || order?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getCustomerName = (userId: any) => {
    if (!userId) return 'Unknown Customer';
    // If populated
    if (userId.name) return userId.name;
    const user = safeUsers.find(u => u._id === userId);
    return user ? user.name : 'Unknown Customer';
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold">Orders</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by order ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">ORD-{order._id.substring(order._id.length - 6).toUpperCase()}</TableCell>
                  <TableCell>{getCustomerName(order.userId)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>₹{(order.totalAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Order Details Dialog - Add safety checks */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details: ORD-{selectedOrder?._id.substring(selectedOrder?._id.length - 6).toUpperCase()}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><strong>Name:</strong> {getCustomerName(selectedOrder.userId)}</p>
                    <p><strong>Email:</strong> {selectedOrder.userId?.email || users.find(u => u._id === selectedOrder.userId)?.email || 'N/A'}</p>
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p>{selectedOrder.shippingAddress || '123 Main Street, Apartment 4B, New Delhi - 110001'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedOrder.products || []).map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-secondary rounded overflow-hidden mr-3">
                              <img 
                                src={item.productId?.images?.[0] || 'https://via.placeholder.com/150'} 
                                alt={item.productId?.name || 'Product'} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{item.productId?.name || item.name || `Product #${index+1}`}</p>
                              <p className="text-xs text-muted-foreground">Size: {item.size || 'N/A'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{item.quantity || 1}</TableCell>
                        <TableCell>₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Order Status</h3>
                  <Select 
                    defaultValue={selectedOrder.status}
                    onValueChange={(val) => setSelectedOrder({...selectedOrder, status: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><strong>Method:</strong> {selectedOrder.paymentMethod || 'Credit Card'}</p>
                    <p><strong>Status:</strong> {selectedOrder.paymentStatus || 'Paid'}</p>
                    <p><strong>Total:</strong> ₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button onClick={() => updateOrderMutation.mutate({ id: selectedOrder._id, status: selectedOrder.status })}>
                  {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
