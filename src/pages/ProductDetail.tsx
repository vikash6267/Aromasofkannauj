
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  ChevronRight,
  ShoppingCart, 
  Heart, 
  Share2, 
  Check, 
  Star,
  Truck,
  ShieldCheck
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '@/services/api';
import { addItem } from '@/store/slices/cartSlice';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ProductGrid from '@/components/product/ProductGrid';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  const { data: productResp, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productAPI.getById(id!),
    enabled: !!id
  });

  const product = productResp?.product;
  
  // Get similar products (same category)
  const { data: similarResp } = useQuery({
    queryKey: ['similarProducts', product?.category],
    queryFn: () => productAPI.getAll({ category: product?.category, limit: 5 }),
    enabled: !!product?.category
  });

  const similarProducts = similarResp?.products?.filter((p: any) => p._id !== id).slice(0, 4) || [];

  useEffect(() => {
    // Set default selected size and image
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].size);
    }
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
    
    // Scroll to top when product changes
    if (product) {
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h2 className="text-2xl font-medium mb-4">Product not found</h2>
          <p className="text-muted-foreground mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  const selectedSizeInfo = product.sizes.find(s => s.size === selectedSize);
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (!selectedSizeInfo) return;
    
    dispatch(addItem({
      id: product._id,
      name: product.name,
      price: selectedSizeInfo.price,
      quantity,
      size: selectedSize,
      image: product.images[0]
    }));
    
    toast({
      title: 'Added to cart',
      description: `${product.name} (${selectedSize}) has been added to your cart`,
    });
  };

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center text-sm">
            <li>
              <Link to="/" className="text-muted-foreground hover:text-primary">
                Home
              </Link>
            </li>
            <li className="mx-2">
              <ChevronRight size={14} className="text-muted-foreground" />
            </li>
            <li>
              <Link to="/shop" className="text-muted-foreground hover:text-primary">
                Shop
              </Link>
            </li>
            <li className="mx-2">
              <ChevronRight size={14} className="text-muted-foreground" />
            </li>
            <li>
              <Link 
                to={`/shop?category=${product.category}`} 
                className="text-muted-foreground hover:text-primary"
              >
                {product.category}
              </Link>
            </li>
            <li className="mx-2">
              <ChevronRight size={14} className="text-muted-foreground" />
            </li>
            <li className="text-primary font-medium truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white border">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                      selectedImage === image ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                    />
                  ))}
                  <span className="ml-2 text-sm">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
                
                <span className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded">
                  In Stock
                </span>
              </div>
              
              <p className="text-2xl font-medium mb-4">
                ₹{selectedSizeInfo?.price.toFixed(2)}
              </p>
              
              <p className="text-muted-foreground">
                {product.description}
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Product Type */}
              <div>
                <h3 className="text-sm font-medium mb-1">Type</h3>
                <p>{product.type}</p>
              </div>
              
              {/* Notes */}
              <div>
                <h3 className="text-sm font-medium mb-1">Notes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.notes.map((note) => (
                    <span 
                      key={note} 
                      className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-medium mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        selectedSize === size.size
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {size.size} - ₹{size.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300">
                    {quantity}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button 
                className="flex-1 gap-2" 
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </Button>
              
              <Button variant="outline" size="icon">
                <Heart size={18} />
              </Button>
              
              <Button variant="outline" size="icon">
                <Share2 size={18} />
              </Button>
            </div>
            
            {/* Features */}
            <div className="pt-6 border-t space-y-3">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                <span className="text-sm">Authentic Products Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-primary" />
                <span className="text-sm">Free Shipping on orders above ₹1000</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <span className="text-sm">30-Day Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">About {product.name}</h3>
              <p className="text-muted-foreground">
                {product.description}
              </p>
              <p className="mt-4 text-muted-foreground">
                Experience the essence of luxury with {product.name}. Crafted with the finest ingredients, this {product.type.toLowerCase()} 
                captivates the senses with its unique blend of {product.notes.join(', ')} notes. Perfect for {
                  product.category === 'Men' ? 'the modern gentleman' : 
                  product.category === 'Women' ? 'the contemporary woman' : 
                  'anyone seeking a distinctive fragrance'
                }, it leaves a lasting impression wherever you go.
              </p>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Category: {product.category}</li>
                    <li>Type: {product.type}</li>
                    <li>Notes: {product.notes.join(', ')}</li>
                    <li>Available sizes: {product.sizes.map(s => s.size).join(', ')}</li>
                    <li>Long-lasting fragrance</li>
                    <li>Made with premium ingredients</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Usage</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Apply to pulse points such as wrists, neck, and behind ears</li>
                    <li>Ideal for daily use or special occasions</li>
                    <li>Store in a cool, dry place away from direct sunlight</li>
                    <li>Keep the bottle tightly closed when not in use</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Customer Reviews</h3>
                <Button>Write a Review</Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{product.rating}</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          size={16}
                          className={i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {product.reviewCount} reviews
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    {/* This would be a real review distribution chart in a real app */}
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <div className="text-sm w-2">{rating}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.random() * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Sample reviews */}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h4 className="font-medium">Exquisite Fragrance</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            size={14}
                            className={i < 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      2 months ago
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    By Priya S.
                  </p>
                  <p className="text-sm">
                    This perfume is absolutely divine! The scent is sophisticated and long-lasting. 
                    I receive compliments every time I wear it. Definitely worth the investment.
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h4 className="font-medium">Amazing Longevity</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            size={14}
                            className={i < 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      1 month ago
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    By Arjun M.
                  </p>
                  <p className="text-sm">
                    The scent lasts all day, which is rare for many perfumes I've tried. 
                    The packaging is elegant too. Would definitely recommend.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold mb-6">You May Also Like</h2>
            <ProductGrid products={similarProducts} columns={4} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
