
import React from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../product/ProductGrid';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const FeaturedProducts: React.FC = () => {
  const { toast } = useToast();

  const { 
    data, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productAPI.getAll({ limit: 6 }),
    staleTime: 300000, // 5 minutes
    retry: 2
  });

  const featuredProducts = data?.products || [];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">
            Featured Collections
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most sought-after fragrances, each carefully crafted to evoke emotion and create lasting impressions.
          </p>
        </div>
        
        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load featured products. Please try again later.</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mx-auto"
            >
              Retry
            </Button>
          </div>
        ) : (
          <ProductGrid products={featuredProducts} />
         )}
        
        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link to="/shop">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
