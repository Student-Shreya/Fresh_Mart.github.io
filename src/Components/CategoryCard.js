import { Button } from "./ui/button";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function CategoryCard({ category, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
        >
            <Link to={createPageUrl("Products") + `?category=${category.id}`}>
                <div className="relative group overflow-hidden rounded-2xl shadow-lg h-full">
                    <motion.img
                        src={category.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"}
                        alt={category.name}
                        className="w-full h-full object-cover aspect-[4/3] transition-transform duration-500 ease-in-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <motion.h3
                            className="text-white text-2xl font-bold mb-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            {category.name}
                        </motion.h3>
                        <motion.div
                            className="transform transition-transform duration-300 -translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        >
                            <Button variant="secondary" size="sm" className="bg-white/90 text-green-700 hover:bg-white">
                                View Deals <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}