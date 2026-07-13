
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
import { useQuery } from '@tanstack/react-query';
import { userAPI, orderAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mail, ShoppingBag } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: usersResp, isLoading: usersLoading } = useQuery({ queryKey: ['adminUsers'], queryFn: () => userAPI.getAll() });
  const { data: ordersResp, isLoading: ordersLoading } = useQuery({ queryKey: ['adminOrders'], queryFn: () => orderAPI.getAll() });

  const users = usersResp?.users || [];
  const orders = ordersResp?.orders || [];

  // Filter customers only (role === 'user')
  const customers = users.filter((user: any) => user.role === 'user');
  
  // Further filter based on search
  const filteredCustomers = customers.filter((customer: any) => {
    return (
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Calculate customer metrics
  const getCustomerOrderCount = (userId: string) => {
    return orders.filter((order: any) => {
      const orderUserId = typeof order.userId === 'string' ? order.userId : order.userId?._id;
      return orderUserId === userId;
    }).length;
  };
  
  const getCustomerSpend = (userId: string) => {
    return orders
      .filter((order: any) => {
        const orderUserId = typeof order.userId === 'string' ? order.userId : order.userId?._id;
        return orderUserId === userId;
      })
      .reduce((total: number, order: any) => total + order.totalAmount, 0);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('');
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold">Customers</h1>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search customers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.map((customer: any) => {
                const orderCount = getCustomerOrderCount(customer._id);
                const totalSpent = getCustomerSpend(customer._id);
                // Use createdAt from DB if available
                const joinedDate = customer.createdAt || new Date().toISOString();
                
                return (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(joinedDate)}</TableCell>
                    <TableCell>{orderCount}</TableCell>
                    <TableCell>₹{totalSpent.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Mail size={16} className="mr-1" />
                          Email
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ShoppingBag size={16} className="mr-1" />
                          Orders
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
