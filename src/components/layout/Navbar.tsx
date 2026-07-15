
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, User, Menu, X, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleCart } from '@/store/slices/cartSlice';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-primary">Aromas of Kannauj </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="font-medium hover:text-primary transition-colors">Shop</Link>
            <Link to="/about" className="font-medium hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="font-medium hover:text-primary transition-colors">Contact</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button 
              onClick={() => dispatch(toggleCart())} 
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">My Wishlist</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => dispatch(logout())}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button 
              onClick={() => dispatch(toggleCart())} 
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar (conditionally rendered) */}
        {isSearchOpen && (
          <div className="mt-4 animate-fade-in">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for perfumes..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu (conditionally rendered) */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden animate-slide-in">
            <div className="flex flex-col space-y-3 py-3">
              <Link 
                to="/" 
                className="px-4 py-2 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className="px-4 py-2 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-2 border-t">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/profile" 
                      className="px-4 py-2 hover:bg-muted rounded-md transition-colors flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={18} className="mr-2" />
                      Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="px-4 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link 
                      to="/wishlist" 
                      className="px-4 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Wishlist
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="px-4 py-2 hover:bg-muted rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        dispatch(logout());
                        setIsMenuOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded-md transition-colors flex items-center text-destructive"
                    >
                      <LogOut size={18} className="mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="px-4 py-2 hover:bg-muted rounded-md transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} className="mr-2" />
                    Login
                  </Link>
                )}
              </div>
              <div className="pt-2 border-t">
                <button 
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    setIsMenuOpen(false);
                  }} 
                  className="px-4 py-2 hover:bg-muted rounded-md transition-colors w-full text-left flex items-center"
                >
                  <Search size={18} className="mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
