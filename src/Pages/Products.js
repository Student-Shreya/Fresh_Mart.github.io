
import { Button } from "./Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./Components/ui/card";
import { Checkbox } from "./Components/ui/checkbox";
import { Input } from "./Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Components/ui/select";
import { CartItem } from "./Entities/CartItem";
import { Category } from "./Entities/Category";
import { Product } from "./Entities/Product";
import { User } from "./Entities/User";
import { createPageUrl } from "./utils";
import { Beef, Filter, Leaf, Search, Vegan, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import ProductCard from "../Components/ProductCard";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState("");
    const [showOrganic, setShowOrganic] = useState(false);
    const [dietaryType, setDietaryType] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const loadProducts = React.useCallback(async () => {
        setLoading(true);
        try {
            let filters = { is_active: true };
            
            if (selectedCategory) {
                const category = await Category.get(selectedCategory);
                if (category) {
                  filters.category_name = category.name;
                }
            }
            
            if (showOrganic) {
                filters.is_organic = true;
            }

            if (dietaryType) {
                filters.dietary_type = dietaryType;
            }
            
            let productsData = await Product.filter(filters, `-${sortBy}`);
            
            // Apply search filter
            if (searchQuery) {
                productsData = productsData.filter(product =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            
            // Apply price filter
            if (priceRange) {
                const [min, max] = priceRange.split('-').map(Number);
                productsData = productsData.filter(product => {
                    if (max) {
                        return product.price >= min && product.price <= max;
                    } else {
                        return product.price >= min;
                    }
                });
            }
            
            setProducts(productsData);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, sortBy, searchQuery, priceRange, showOrganic, dietaryType]);

    const loadData = React.useCallback(async () => {
        try {
            const categoriesData = await Category.list("name");
            setCategories(categoriesData);
            await loadProducts();
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }, [loadProducts]);

    useEffect(() => {
        loadData();
        
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const search = urlParams.get('search');
        
        if (category) setSelectedCategory(category);
        if (search) setSearchQuery(search);
    }, [loadData]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleAddToCart = async (product) => {
        try {
            const user = await User.me();
            
            const existingItems = await CartItem.filter({ 
                user_email: user.email, 
                product_id: product.id 
            });
            
            if (existingItems.length > 0) {
                await CartItem.update(existingItems[0].id, {
                    quantity: existingItems[0].quantity + 1
                });
            } else {
                await CartItem.create({
                    product_id: product.id,
                    quantity: 1,
                    user_email: user.email
                });
            }
            
            window.location.reload();
        } catch (error) {
            await User.loginWithRedirect(window.location.origin + createPageUrl("Products"));
        }
    };

    const clearFilters = () => {
        setSelectedCategory("");
        setPriceRange("");
        setShowOrganic(false);
        setSearchQuery("");
        setDietaryType("");
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || "All Products";
    };

    const hasActiveFilters = selectedCategory || priceRange || showOrganic || searchQuery || dietaryType;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {selectedCategory ? getCategoryName(selectedCategory) : "All Products"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {loading ? "Loading..." : `${products.length} products found`}
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name A-Z</SelectItem>
                            <SelectItem value="price">Price: Low to High</SelectItem>
                            <SelectItem value="created_date">Newest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <Card className="sticky top-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters
                            </CardTitle>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={null}>All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                <Select value={priceRange} onValueChange={setPriceRange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any Price" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={null}>Any Price</SelectItem>
                                        <SelectItem value="0-500">Under ₹500</SelectItem>
                                        <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
                                        <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
                                        <SelectItem value="2000">₹2000+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Dietary Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
                                <Select value={dietaryType} onValueChange={setDietaryType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={null}>Any</SelectItem>
                                        <SelectItem value="vegetarian">
                                            <div className="flex items-center gap-2">
                                                <Leaf className="w-4 h-4 text-green-600" /> Vegetarian
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="vegan">
                                            <div className="flex items-center gap-2">
                                                <Vegan className="w-4 h-4 text-purple-600" /> Vegan
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="non-vegetarian">
                                            <div className="flex items-center gap-2">
                                                <Beef className="w-4 h-4 text-red-600" /> Non-Vegetarian
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Organic Filter */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="organic"
                                    checked={showOrganic}
                                    onCheckedChange={setShowOrganic}
                                />
                                <label htmlFor="organic" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Leaf className="w-4 h-4 text-green-600" />
                                    Organic Only
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Products Grid */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array(12).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                                    <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                            {hasActiveFilters && (
                                <Button onClick={clearFilters} variant="outline">
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    showQuantity={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
