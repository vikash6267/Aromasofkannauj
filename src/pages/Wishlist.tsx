import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { HeartCrack, ShoppingCart, Trash2 } from 'lucide-react';
import { RootState } from '@/store';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import { addItem } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Wishlist: React.FC = () => {
  const { items } = useSelector((state: RootState) => state.wishlist);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleRemove = (id: string, name: string) => {
    dispatch(removeFromWishlist(id));
    toast({
      title: "Removed from Wishlist",
      description: `${name} has been removed from your wishlist.`,
    });
  };

  const handleAddToCart = (item: any) => {
    dispatch(addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      size: 'Default',
      image: item.image
    }));
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <HeartCrack className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Your wishlist is empty</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Looks like you haven't saved any items yet. Explore our collection and find something you love.
        </p>
        <Link to="/shop">
          <Button size="lg">Explore Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-10">My Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
            <Link to={`/product/${item.id}`} className="block relative aspect-square overflow-hidden bg-muted">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            
            <div className="p-4">
              <Link to={`/product/${item.id}`}>
                <h3 className="font-medium text-lg mb-1 truncate hover:text-primary transition-colors">{item.name}</h3>
              </Link>
              <p className="text-lg font-medium text-primary mb-4">₹{item.price.toFixed(2)}</p>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleRemove(item.id, item.name)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
