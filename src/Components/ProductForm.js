
// import { Button } from '@/components/ui/button';
import { Button } from "./Components/ui/button"; // adjust path based on location

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from './Components/ui/checkbox';
import { Input } from './Components/ui/input';
import { Label } from './Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Components/ui/select';
import { Textarea } from './Components/ui/textarea';
import { Product } from './Entities/Product';

export default function ProductForm({ product, categories, onSubmitSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_name: '', // Changed from category_id to category_name
        stock_quantity: '',
        image_url: '',
        is_active: true,
        is_featured: false,
        is_organic: false,
        brand: '',
        unit: 'each',
        dietary_type: 'vegetarian'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                category_name: product.category_name || '', // Changed from category_id to category_name
                stock_quantity: product.stock_quantity || 0,
                image_url: product.image_url || '',
                is_active: product.is_active ?? true,
                is_featured: product.is_featured ?? false,
                is_organic: product.is_organic ?? false,
                brand: product.brand || '',
                unit: product.unit || 'each',
                dietary_type: product.dietary_type || 'vegetarian'
            });
        }
    }, [product]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleCheckboxChange = (name, checked) => {
        setFormData(prev => ({...prev, [name]: checked}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity, 10),
            };
            
            if (!dataToSave.category_name) {
                toast.error("Please select a category.");
                setIsSaving(false);
                return;
            }

            if (product) {
                await Product.update(product.id, dataToSave);
                toast.success('Product updated successfully!');
            } else {
                await Product.create(dataToSave);
                toast.success('Product created successfully!');
            }
            onSubmitSuccess();
        } catch (error) {
            console.error('Failed to save product:', error);
            toast.error('Failed to save product.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required className="h-12" />
                    </div>
                    <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Input id="brand" name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} className="h-12" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Product description" value={formData.description} onChange={handleChange} className="min-h-[100px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input id="price" name="price" type="number" placeholder="0.00" value={formData.price} onChange={handleChange} required step="0.01" className="h-12" />
                    </div>
                    <div>
                        <Label htmlFor="stock_quantity">Stock Quantity</Label>
                        <Input id="stock_quantity" name="stock_quantity" type="number" placeholder="0" value={formData.stock_quantity} onChange={handleChange} required className="h-12" />
                    </div>
                    <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" name="unit" placeholder="each, lb, oz" value={formData.unit} onChange={handleChange} className="h-12" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category_name} onValueChange={(value) => handleSelectChange('category_name', value)}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="dietary_type">Dietary Type</Label>
                        <Select value={formData.dietary_type} onValueChange={(value) => handleSelectChange('dietary_type', value)}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                <SelectItem value="vegan">Vegan</SelectItem>
                                <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="image_url">Product Image URL</Label>
                    <div className="flex gap-4">
                        <Input id="image_url" name="image_url" placeholder="https://..." value={formData.image_url} onChange={handleChange} className="flex-1 h-12" />
                        {formData.image_url && (
                            <motion.img 
                                src={formData.image_url} 
                                alt="Preview" 
                                className="w-12 h-12 object-cover rounded-lg border"
                                whileHover={{ scale: 3, zIndex: 50 }}
                                transition={{ duration: 0.2 }}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                        <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(c) => handleCheckboxChange('is_active', c)} />
                        <Label htmlFor="is_active" className="text-sm font-medium">Active Product</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Checkbox id="is_featured" checked={formData.is_featured} onCheckedChange={(c) => handleCheckboxChange('is_featured', c)} />
                        <Label htmlFor="is_featured" className="text-sm font-medium">Featured Product</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Checkbox id="is_organic" checked={formData.is_organic} onCheckedChange={(c) => handleCheckboxChange('is_organic', c)} />
                        <Label htmlFor="is_organic" className="text-sm font-medium">Organic Product</Label>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button type="submit" disabled={isSaving} size="lg" className="bg-green-600 hover:bg-green-700 px-8">
                            {isSaving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                        </Button>
                    </motion.div>
                </div>
            </form>
        </motion.div>
    );
}
