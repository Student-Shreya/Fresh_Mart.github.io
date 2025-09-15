
import { Beef, Leaf, Minus, Plus, ShoppingCart, Star, Vegan } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import { Badge } from "./Components/ui/badge";
import { Button } from "./Components/ui/button";
import { Input } from "./Components/ui/input";
import { CartItem } from "./Entities/CartItem";
import { Product } from "./Entities/Product";
import { User } from "./Entities/User";

const DietaryBadge = ({ type }) => {
    if (type === 'vegetarian') {
        return <Badge className="bg-green-100 text-green-800 border-green-300"><Leaf className="w-3 h-3 mr-1"/>Vegetarian</Badge>;
    }
    if (type === 'vegan') {
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300"><Vegan className="w-3 h-3 mr-1"/>Vegan</Badge>;
    }
    if (type === 'non-vegetarian') {
        return <Badge className="bg-red-100 text-red-800 border-red-300"><Beef className="w-3 h-3 mr-1"/>Non-Vegetarian</Badge>;
    }
    return null;
}

export default function ProductDetailPage() {
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const loadProductData = React.useCallback(async (productId) => {
        setLoading(true);
        try {
            const productData = await Product.get(productId);
            setProduct(productData);

            if (productData?.category_id) {
                const related = await Product.filter({
                    category_id: productData.category_id,
                    is_active: true
                }, "-created_date", 4);
                // Filter out the current product from related items
                setRelatedProducts(related.filter(p => p.id !== productId));
            }
        } catch (error) {
            console.error("Error loading product:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const productId = urlParams.get('id');
        if (productId) {
            loadProductData(productId);
        }
    }, [location.search, loadProductData]);

    const handleAddToCart = async (productToAdd) => {
        try {
            const user = await User.me();
            const existingItems = await CartItem.filter({
                user_email: user.email,
                product_id: productToAdd.id
            });

            if (existingItems.length > 0) {
                await CartItem.update(existingItems[0].id, {
                    quantity: existingItems[0].quantity + quantity
                });
            } else {
                await CartItem.create({
                    product_id: productToAdd.id,
                    quantity: quantity,
                    user_email: user.email
                });
            }
            // Refresh layout's cart count
            window.location.reload(); 
        } catch (error) {
            await User.loginWithRedirect(window.location.href);
        }
    };

    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    if (!product) {
        return <div className="text-center py-20">Product not found.</div>;
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image Gallery */}
                    <div>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={product.image_url || "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=600&h=600&fit=crop"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        {product.brand && <p className="text-sm text-green-600 font-semibold mb-2">{product.brand}</p>}
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">4.5</span>
                                <span className="text-gray-500">(120 reviews)</span>
                            </div>
                            {product.is_organic && <Badge className="bg-green-100 text-green-800"><Leaf className="w-3 h-3 mr-1"/>Organic</Badge>}
                            <DietaryBadge type={product.dietary_type} />
                        </div>

                        <p className="text-gray-600 mb-6 text-lg">{product.description}</p>
                        
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">₹{product.price?.toFixed(2)}</span>
                            <span className="text-gray-500 ml-2">/ {product.unit || 'each'}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center border rounded-lg">
                                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="w-4 h-4"/></Button>
                                <Input type="number" value={quantity} readOnly className="w-16 text-center border-0 focus:ring-0"/>
                                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}><Plus className="w-4 h-4"/></Button>
                            </div>
                            <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAddToCart(product)} disabled={product.stock_quantity === 0}>
                                <ShoppingCart className="w-5 h-5 mr-2"/>
                                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        </div>
                        
                        {product.stock_quantity > 0 && <p className="text-sm text-gray-500">{product.stock_quantity} available in stock</p>}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(related => (
                                <ProductCard key={related.id} product={related} onAddToCart={handleAddToCart}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
