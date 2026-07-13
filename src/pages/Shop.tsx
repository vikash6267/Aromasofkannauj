
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/components/product/ProductGrid';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search, Sliders } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GENDER_CATEGORIES, PERFUME_NOTES, PERFUME_TYPES } from '@/config/constants';
import { productAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortOption, setSortOption] = useState('createdAt_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();
  
  // Function to handle seed database - This is only for development
  const handleSeedDatabase = async () => {
    try {
      if (window.confirm('Are you sure you want to seed the database? This will replace all existing data!')) {
        setIsLoading(true);
        // Import and run the seed function
        const { seedDatabase } = await import('@/utils/seedDatabase');
        const result = await seedDatabase();
        
        toast({
          title: "Database seeded successfully",
          description: `Created ${result.products} products, ${result.users} users, ${result.orders} orders, and ${result.coupons} coupons.`,
        });
        
        // Reload products after seeding
        fetchProducts();
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: "Error seeding database",
        description: "An error occurred while seeding the database.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchProducts = async (page = currentPage) => {
    try {
      setIsFetching(true);
      
      const params = {
        page,
        limit: 12,
        search: searchTerm,
        category: category === 'all' ? '' : category,
        notes: selectedNotes.join(','),
        types: selectedTypes.join(','),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort: sortOption
      };
      
      const result = await productAPI.getAll(params);
      
      if (page === 1) {
        setProducts(result.products || []);
      } else {
        setProducts(prev => [...prev, ...(result.products || [])]);
      }
      
      if (result.pagination) {
        setCurrentPage(result.pagination.currentPage);
        setTotalPages(result.pagination.totalPages);
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: "Failed to load products.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };
  
  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    fetchProducts(1);
  }, [searchTerm, category, selectedNotes, selectedTypes, priceRange, sortOption]);
  
  const loadMoreProducts = () => {
    if (currentPage < totalPages && !isFetching) {
      fetchProducts(currentPage + 1);
    }
  };
  
  const applyFilter = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setSelectedNotes([]);
    setSelectedTypes([]);
    setPriceRange([0, 10000]);
    setSortOption('createdAt_desc');
  };
  
  const handleNoteToggle = (note: string) => {
    setSelectedNotes(prev => 
      prev.includes(note)
        ? prev.filter(n => n !== note)
        : [...prev, note]
    );
  };
  
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Mobile filter button */}
          <div className="w-full md:hidden">
            <div className="flex gap-2 mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Sliders className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="py-4 h-full overflow-y-auto">
                    <h2 className="font-serif text-xl mb-6">Filters</h2>
                    {/* Mobile filters content - same as desktop */}
                    <div className="space-y-6">
                      {/* Category filter */}
                      <div>
                        <h3 className="font-medium mb-2">Category</h3>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {GENDER_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Price Range */}
                      <div>
                        <h3 className="font-medium mb-2">Price Range</h3>
                        <div className="px-2">
                          <Slider
                            value={priceRange}
                            min={0}
                            max={10000}
                            step={100}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                            className="my-6"
                          />
                          <div className="flex justify-between text-sm">
                            <span>₹{priceRange[0]}</span>
                            <span>₹{priceRange[1]}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Notes filter */}
                      <div>
                        <h3 className="font-medium mb-2">Notes</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {PERFUME_NOTES.map((note) => (
                            <div key={note} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`mobile-note-${note}`} 
                                checked={selectedNotes.includes(note)}
                                onCheckedChange={() => handleNoteToggle(note)}
                              />
                              <Label htmlFor={`mobile-note-${note}`}>{note}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Type filter */}
                      <div>
                        <h3 className="font-medium mb-2">Type</h3>
                        <div className="space-y-2">
                          {PERFUME_TYPES.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`mobile-type-${type}`} 
                                checked={selectedTypes.includes(type)}
                                onCheckedChange={() => handleTypeToggle(type)}
                              />
                              <Label htmlFor={`mobile-type-${type}`}>{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button onClick={resetFilters} variant="outline" className="w-full">Reset</Button>
                        <Button onClick={applyFilter} className="w-full">Apply</Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex justify-between mb-6">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z to A</SelectItem>
                  <SelectItem value="rating_desc">Rating: High to Low</SelectItem>
                  <SelectItem value="createdAt_desc">Newest First</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Seed database button - visible only in development */}
              {import.meta.env.DEV && (
                <Button variant="outline" onClick={handleSeedDatabase}>
                  Seed Database
                </Button>
              )}
            </div>
          </div>
          
          {/* Desktop sidebar */}
          <div className="hidden md:block w-1/4 min-w-[200px] space-y-8 sticky top-24">
            <h2 className="font-serif text-xl">Filters</h2>
            
            {/* Category filter */}
            <div>
              <h3 className="font-medium mb-2">Category</h3>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {GENDER_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Price Range */}
            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="my-6"
                />
                <div className="flex justify-between text-sm">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Notes filter */}
            <div>
              <h3 className="font-medium mb-2">Notes</h3>
              <div className="grid grid-cols-1 gap-2">
                {PERFUME_NOTES.map((note) => (
                  <div key={note} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`note-${note}`} 
                      checked={selectedNotes.includes(note)}
                      onCheckedChange={() => handleNoteToggle(note)}
                    />
                    <Label htmlFor={`note-${note}`}>{note}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Type filter */}
            <div>
              <h3 className="font-medium mb-2">Type</h3>
              <div className="space-y-2">
                {PERFUME_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`type-${type}`} 
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => handleTypeToggle(type)}
                    />
                    <Label htmlFor={`type-${type}`}>{type}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 space-y-2">
              <Button onClick={resetFilters} variant="outline" className="w-full">Reset Filters</Button>
              
              {/* Seed database button - visible only in development */}
              {import.meta.env.DEV && (
                <Button variant="secondary" onClick={handleSeedDatabase} className="w-full">
                  Seed Database
                </Button>
              )}
            </div>
          </div>
          
          {/* Main content */}
          <div className="w-full md:w-3/4">
            {/* Desktop search and sort */}
            <div className="hidden md:flex justify-between items-center mb-8">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z to A</SelectItem>
                  <SelectItem value="rating_desc">Rating: High to Low</SelectItem>
                  <SelectItem value="createdAt_desc">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Products grid */}
            <ProductGrid 
              products={products} 
              columns={3}
              isLoading={isLoading}
              isFetchingNextPage={isFetching}
              hasNextPage={currentPage < totalPages}
              fetchNextPage={loadMoreProducts}
            />
            
            {/* Empty state */}
            {!isLoading && products.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or filter to find what you're looking for.</p>
                <Button onClick={resetFilters}>Reset Filters</Button>
              </div>
            )}
            
            {/* Load more button */}
            {!isLoading && currentPage < totalPages && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={loadMoreProducts}
                  disabled={isFetching}
                >
                  {isFetching ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
