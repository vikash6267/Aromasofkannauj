
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  GENDER_CATEGORIES, 
  PERFUME_NOTES, 
  PERFUME_TYPES 
} from "@/config/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, X } from "lucide-react";
import { uploadAPI } from "@/services/api";
import { createProduct, updateProduct } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";

interface AdminProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
  onSuccess?: () => void;
}

const AdminProductDialog: React.FC<AdminProductDialogProps> = ({ 
  open, 
  onOpenChange,
  product,
  onSuccess 
}) => {
  const isEditing = !!product;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    type: '',
    stock: '',
    notes: [] as string[],
    featured: false,
    keepExistingImages: true
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price ? String(product.price) : '',
        description: product.description || '',
        category: product.category || '',
        type: product.type || '',
        stock: product.stock ? String(product.stock) : '',
        notes: product.notes || [],
        featured: !!product.featured,
        keepExistingImages: true
      });
      setImages(product.images || []);
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        type: '',
        stock: '',
        notes: [],
        featured: false,
        keepExistingImages: true
      });
      setImages([]);
    }
  }, [product]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNoteToggle = (note: string) => {
    setFormData(prev => {
      const notes = [...prev.notes];
      if (notes.includes(note)) {
        return { ...prev, notes: notes.filter(n => n !== note) };
      } else {
        return { ...prev, notes: [...notes, note] };
      }
    });
  };
  
  const handleFeaturedToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, featured: checked }));
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const fileArray = Array.from(files);
      const data = await uploadAPI.uploadImages(fileArray);
      
      if (data && data.success && data.images) {
        // Extract secure_url from each uploaded image object or just use the string if it's already a string
        const newImageUrls = data.images.map((img: any) => img.secure_url || img);
        setImages(prev => [...prev, ...newImageUrls]);
        
        toast({
          title: "Images uploaded",
          description: "Images successfully uploaded to the server.",
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditing) {
        // Update existing product
        await updateProduct(product._id || product.id, { ...formData, images }, []);
        toast({
          title: "Success",
          description: "Product updated successfully",
          variant: "default"
        });
      } else {
        // Create new product
        await createProduct({ ...formData, images }, []);
        toast({
          title: "Success",
          description: "Product created successfully",
          variant: "default"
        });
      }
      
      // Close dialog and refresh product list
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Product: ${product.name}` : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Perfume Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PERFUME_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="featured" 
                  checked={formData.featured}
                  onCheckedChange={handleFeaturedToggle}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Perfume Notes</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {PERFUME_NOTES.map((note) => (
                <div key={note} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`note-${note}`} 
                    checked={formData.notes.includes(note)}
                    onCheckedChange={() => handleNoteToggle(note)}
                  />
                  <Label htmlFor={`note-${note}`} className="text-sm">
                    {note}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                  <img 
                    src={image} 
                    alt={`Product image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
              
              <label className="flex items-center justify-center border border-dashed rounded-md aspect-square cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-center p-4">
                  {uploading ? (
                    <Loader2 size={24} className="mx-auto animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload Image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading || saving}
                  />
                </div>
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                isEditing ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProductDialog;
