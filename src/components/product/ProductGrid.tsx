
import React from 'react';
import { useInView } from 'react-intersection-observer';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  featured?: boolean;
}

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products = [], // Add default empty array
  columns = 3,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage
}) => {
  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getGridClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if products is valid to prevent mapping errors
  if (!Array.isArray(products)) {
    console.error("Products is not an array:", products);
    return (
      <div className="w-full flex justify-center py-12">
        <p className="text-muted-foreground">No products available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={`grid ${getGridClass()} gap-6`}>
        {products.map((product) => {
          // Add a safety check before rendering each product
          if (!product || (!product.id && !product._id)) {
            console.warn("Invalid product found:", product);
            return null;
          }
          
          // Support both MongoDB _id and regular id
          const productId = product._id?.toString() || product.id || '';
          
          // Handle stringified images from backend
          let imageUrl = '/placeholder.svg';
          if (product.images && product.images.length > 0) {
            if (typeof product.images[0] === 'string' && product.images[0].startsWith('[')) {
              try {
                const parsed = JSON.parse(product.images[0]);
                imageUrl = parsed[0] || '/placeholder.svg';
              } catch (e) {
                imageUrl = product.images[0] || '/placeholder.svg';
              }
            } else if (typeof product.images === 'string') {
              try {
                const parsed = JSON.parse(product.images as string);
                imageUrl = parsed[0] || '/placeholder.svg';
              } catch (e) {
                imageUrl = product.images || '/placeholder.svg';
              }
            } else {
              imageUrl = product.images[0] || '/placeholder.svg';
            }
          }
          
          return (
            <ProductCard
              key={productId}
              id={productId}
              name={product.name}
              price={product.price}
              image={imageUrl}
              category={product.category}
              rating={product.rating}
              featured={product.featured}
            />
          );
        })}
      </div>
      
      {(isFetchingNextPage || hasNextPage) && (
        <div 
          ref={ref} 
          className="w-full flex justify-center py-8"
        >
          {isFetchingNextPage && (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
