import { uploadImage, uploadMultipleImages } from '@/utils/cloudinary';
import { productAPI } from './api';

// Fallback methods since we are using React Query and api.ts directly for fetching
export const getProducts = async (params: any = {}) => productAPI.getAll(params);
export const getProductById = async (id: string) => productAPI.getById(id);
export const getFeaturedProducts = async () => productAPI.getAll({ featured: true, limit: 8 });
export const deleteProduct = async (id: string) => productAPI.delete(id);


export const createProduct = async (productData: any, imageFiles: File[]) => {
  try {
    let imageUrls: string[] = [];
    
    // Upload images if provided
    if (imageFiles && imageFiles.length > 0) {
      imageUrls = await uploadMultipleImages(imageFiles);
    }
    
    // Create product with image URLs
    const newProduct = {
      ...productData,
      price: Number(productData.price),
      stock: productData.stock ? Number(productData.stock) : 0,
      images: JSON.stringify(imageUrls),
      notes: JSON.stringify(productData.notes || []),
      sizes: JSON.stringify(productData.sizes || []),
      rating: 0,
      reviewCount: 0
    };
    
    const result = await productAPI.create(newProduct);
    return result;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: any, newImageFiles?: File[]) => {
  try {
    const existingProductResp = await productAPI.getById(id);
    const existingProduct = existingProductResp?.product;
    
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    // Handle image uploads if any new images
    if (newImageFiles && newImageFiles.length > 0) {
      const newImageUrls = await uploadMultipleImages(newImageFiles);
      
      // Combine with existing images or replace them
      if (productData.keepExistingImages) {
        productData.images = [...(existingProduct.images || []), ...newImageUrls];
      } else {
        productData.images = newImageUrls;
      }
    } else if (productData.images && Array.isArray(productData.images)) {
      // Keep existing format if untouched
    }
    
    // Update numeric values
    if (productData.price) {
      productData.price = Number(productData.price);
    }
    
    if (productData.stock) {
      productData.stock = Number(productData.stock);
    }

    const payload = {
      ...productData,
      images: JSON.stringify(productData.images || []),
      notes: JSON.stringify(productData.notes || []),
      sizes: JSON.stringify(productData.sizes || [])
    };
    
    const updatedProduct = await productAPI.update(id, payload);
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};
