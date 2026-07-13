
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Edit, Trash2, Search, Plus, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENDER_CATEGORIES } from '@/config/constants';
import AdminProductDialog from '@/components/admin/AdminProductDialog';
import { useToast } from '@/hooks/use-toast';
import { productAPI } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Setup query params
  const params = {
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : '',
    limit: 50, // Higher limit for admin view
  };
  
  // Fetch products with react-query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => productAPI.getAll(params),
  });
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, refetch]);
  
  const products = data?.products || [];
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddProductOpen(true);
  };
  
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsAddProductOpen(true);
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(productId);
        toast({
          title: "Product deleted",
          description: "The product has been successfully deleted.",
          variant: "default"
        });
        // Refresh the product list
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleSuccess = () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold">Products</h1>
          <Button onClick={handleAddProduct}>
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {GENDER_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-red-500">
                    Error loading products. Please try again.
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: any) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹{product.price?.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product._id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <AdminProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        product={editingProduct}
        onSuccess={handleSuccess}
      />
    </AdminLayout>
  );
};

export default AdminProducts;
