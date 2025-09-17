import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { createPageUrl } from "../utils";
import { Button } from "./ui/button";

import { motion } from "framer-motion";
import { Beef, Leaf, ShoppingCart, Star, Vegan } from "lucide-react";
import { Badge } from "./ui/badge";

const DietaryIcon = ({ type }) => {
    if (type === 'vegetarian') {
        return <Leaf className="w-4 h-4 text-green-600" title="Vegetarian" />;
    }
    if (type === 'vegan') {
        return <Vegan className="w-4 h-4 text-purple-600" title="Vegan" />;
    }
    if (type === 'non-vegetarian') {
        return <Beef className="w-4 h-4 text-red-600" title="Non-Vegetarian" />;
    }
    return null;
}

export default function ProductCard({ product, onAddToCart, showQuantity = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
                y: -8,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <Card className="overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white h-full flex flex-col">
                <Link to={createPageUrl("ProductDetail") + `?id=${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-gray-50 relative">
                        <motion.img
                            src={product.image_url || "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=400&h=400&fit=crop"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.4 }}
                            loading="lazy"
                            decoding="async"
                        />
                        {product.is_organic && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Badge className="absolute top-3 left-3 bg-green-600 text-white shadow-lg">
                                    <Leaf className="w-3 h-3 mr-1" />
                                    Organic
                                </Badge>
                            </motion.div>
                        )}
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Badge variant="destructive" className="absolute top-3 right-3 shadow-lg">
                                    Low Stock
                                </Badge>
                            </motion.div>
                        )}
                        <motion.div
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                        />
                    </div>
                </Link>
                <CardContent className="p-6 flex-1 flex flex-col">
                    <Link to={createPageUrl("ProductDetail") + `?id=${product.id}`}>
                        {product.brand && (
                            <motion.p 
                                className="text-xs text-green-600 font-medium mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {product.brand}
                            </motion.p>
                        )}
                        <motion.h3 
                            className="font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[3rem]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {product.name}
                        </motion.h3>
                    </Link>
                    
                    <motion.div 
                        className="flex items-center justify-between mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div>
                            <span className="text-2xl font-bold text-gray-900">
                                ₹{product.price?.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                                /{product.unit || 'each'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DietaryIcon type={product.dietary_type} />
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">4.5</span>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-auto"
                    >
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2 font-semibold py-3"
                            disabled={product.stock_quantity === 0}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                    </motion.div>
                    
                    {showQuantity && product.stock_quantity > 0 && (
                        <motion.p 
                            className="text-xs text-gray-500 mt-2 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {product.stock_quantity} available
                        </motion.p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
