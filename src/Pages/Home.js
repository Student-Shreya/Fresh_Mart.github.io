import { motion } from "framer-motion";
import { ArrowRight, Award, CheckCircle, Clock, Leaf, Shield, Star, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryCard from "../Components/CategoryCard";
import ProductCard from "../Components/ProductCard";
import { Button } from "../Components/ui/button";
import { CartItem } from "../Entities/CartItem";
import { Category } from "../Entities/Category";
import { Product } from "../Entities/Product";
import User from "../Entities/User";
import { createPageUrl } from "../utils";

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [organicProducts, setOrganicProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [products, categories, organic] = await Promise.all([
                Product.filter({ is_featured: true, is_active: true }, "-created_date", 8),
                Category.filter({ is_featured: true }, "sort_order", 6),
                Product.filter({ is_organic: true, is_active: true }, "-created_date", 4)
            ]);
            setFeaturedProducts(products);
            setFeaturedCategories(categories);
            setOrganicProducts(organic);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

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
            await User.loginWithRedirect(window.location.origin + createPageUrl("Home"));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6
            }
        }
    };

    return (
        <div className="bg-white overflow-hidden">
            {/* Enhanced Hero Section */}
            <section className="relative bg-gradient-to-br from-green-600 via-green-500 to-green-600 text-white overflow-hidden min-h-[70vh]">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <motion.div
                        animate={{ 
                            backgroundPosition: ["0% 0%", "100% 100%"],
                        }}
                        transition={{ 
                            duration: 20, 
                            repeat: Infinity, 
                            repeatType: "reverse" 
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-blue-500/30"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center"
                    >
                        <motion.h1 
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Fresh Groceries
                            <motion.span 
                                className="block text-green-100"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                Delivered Daily
                            </motion.span>
                        </motion.h1>
                        <motion.p 
                            className="text-xl lg:text-2xl text-green-100 mb-8 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                        >
                            Farm-fresh produce, organic options, and everyday essentials delivered to your doorstep
                        </motion.p>
                        <motion.div 
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.9 }}
                        >
                            <Link to={createPageUrl("Products")}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button size="lg" className="bg-white hover:bg-gray-100 text-green-600 font-semibold">
                                        Start Shopping
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </motion.div>
                            </Link>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                                    View Deals
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
                
                {/* Floating Animation Elements */}
                <motion.div
                    className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"
                    animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ 
                        duration: 6, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />
                <motion.div
                    className="absolute bottom-32 right-20 w-16 h-16 bg-white/10 rounded-full"
                    animate={{ 
                        y: [0, 20, 0],
                        x: [0, 10, 0]
                    }}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
            </section>

            {/* Enhanced Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: Truck,
                                title: "Same Day Delivery",
                                description: "Fresh groceries delivered within hours",
                                color: "bg-blue-600"
                            },
                            {
                                icon: Leaf,
                                title: "100% Organic Options",
                                description: "Wide selection of certified organic products",
                                color: "bg-green-600"
                            },
                            {
                                icon: Shield,
                                title: "Fresh Guarantee",
                                description: "100% satisfaction or we'll make it right",
                                color: "bg-purple-600"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                                }}
                                className="text-center bg-white p-8 rounded-2xl shadow-lg"
                            >
                                <motion.div 
                                    className={`w-20 h-20 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6`}
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <feature.icon className="w-10 h-10 text-white" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Featured Categories */}
            {featuredCategories.length > 0 && (
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                Shop by Category
                            </h2>
                            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                                From fresh produce to pantry staples, find everything you need
                            </p>
                        </motion.div>

                        <motion.div 
                            className="grid grid-cols-2 md:grid-cols-3 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {featuredCategories.map((category, index) => (
                                <motion.div key={category.id} variants={itemVariants}>
                                    <CategoryCard category={category} index={index} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Enhanced Featured Products */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Featured Products
                        </h2>
                        <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                            Handpicked favorites and seasonal specialties
                        </p>
                    </motion.div>

                    {loading ? (
                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {Array(8).fill(0).map((_, i) => (
                                <motion.div key={i} variants={itemVariants}>
                                    <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                                        <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {featuredProducts.map((product, index) => (
                                <motion.div key={product.id} variants={itemVariants}>
                                    <ProductCard
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    <motion.div 
                        className="text-center mt-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Link to={createPageUrl("Products")}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                                    Shop All Products
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Organic Section */}
            {organicProducts.length > 0 && (
                <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <motion.div 
                                className="flex items-center justify-center gap-3 mb-6"
                                whileHover={{ scale: 1.1 }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Leaf className="w-12 h-12 text-green-600" />
                                </motion.div>
                                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                                    Organic Selection
                                </h2>
                            </motion.div>
                            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                                Certified organic products for healthier living
                            </p>
                        </motion.div>

                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {organicProducts.map((product, index) => (
                                <motion.div key={product.id} variants={itemVariants}>
                                    <ProductCard
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            { number: "50K+", label: "Happy Customers", icon: Star },
                            { number: "1000+", label: "Products Available", icon: Award },
                            { number: "24/7", label: "Customer Support", icon: Clock },
                            { number: "99%", label: "On-Time Delivery", icon: CheckCircle }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={itemVariants}
                                className="text-center"
                                whileHover={{ scale: 1.1 }}
                            >
                                <motion.div
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <stat.icon className="w-8 h-8 text-green-600" />
                                </motion.div>
                                <motion.h3 
                                    className="text-3xl font-bold text-gray-900 mb-2"
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    {stat.number}
                                </motion.h3>
                                <p className="text-gray-600">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Newsletter Section */}
            <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ 
                            duration: 20, 
                            repeat: Infinity 
                        }}
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full"
                    />
                </div>
                <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Stay Fresh with Weekly Deals
                        </h2>
                        <p className="text-green-100 text-xl mb-8">
                            Get exclusive offers, seasonal recipes, and first access to new products
                        </p>
                        <motion.div 
                            className="flex flex-col sm:flex-row max-w-md mx-auto gap-4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <motion.input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-4 rounded-xl text-gray-900 border-0 focus:ring-2 focus:ring-white"
                                whileFocus={{ scale: 1.02 }}
                            />
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-8 py-4">
                                    Subscribe
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
