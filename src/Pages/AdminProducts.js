import { motion } from 'framer-motion';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminGuard from '../Components/AdminGuard';
import ProductForm from '../Components/ProductForm';
import { Button } from '../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Components/ui/table';
import { Category } from '../Entities/Category';
import { Product } from '../Entities/Product';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                Product.list('-created_date'), // Assuming Product.list now returns products with 'category_name' populated
                Category.list('name')
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormSubmit = async () => {
        setIsDialogOpen(false);
        setEditingProduct(null);
        await loadData();
    };
    
    const openNewProductDialog = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    const openEditProductDialog = (product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await Product.delete(productId);
                toast.success("Product deleted successfully.");
                await loadData();
            } catch (error) {
                toast.error("Failed to delete product.");
            }
        }
    };

    // Updated to use product.category_name directly
    const getCategoryName = (product) => {
        return product.category_name || 'N/A';
    };

    return (
        <AdminGuard>
            <div className="p-6 space-y-8">
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Product Management</h1>
                        <p className="text-gray-600 mt-2">Manage your store inventory and product catalog</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button onClick={openNewProductDialog} size="lg" className="bg-green-600 hover:bg-green-700">
                                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
                                </Button>
                            </motion.div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                            </DialogHeader>
                            <ProductForm
                                product={editingProduct}
                                categories={categories}
                                onSubmitSuccess={handleFormSubmit}
                            />
                        </DialogContent>
                    </Dialog>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="text-2xl">Products Catalog</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan="6" className="text-center py-8">Loading products...</TableCell></TableRow>
                                    ) : (
                                        products.map((product, index) => (
                                            <motion.tr 
                                                key={product.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-4">
                                                        <motion.img 
                                                            src={product.image_url || "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=80&h=80&fit=crop"} 
                                                            alt={product.name} 
                                                            className="w-16 h-16 rounded-lg object-cover shadow-md"
                                                            whileHover={{ scale: 1.1 }}
                                                            transition={{ duration: 0.2 }}
                                                        />
                                                        <div>
                                                            <p className="font-semibold">{product.name}</p>
                                                            {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                {/* Updated to pass the product object to getCategoryName */}
                                                <TableCell>{getCategoryName(product)}</TableCell>
                                                <TableCell className="font-semibold">₹{product.price.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span className={product.stock_quantity <= 5 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                                                        {product.stock_quantity}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {product.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <motion.div whileHover={{ scale: 1.1 }}>
                                                            <Button variant="ghost" size="icon" onClick={() => openEditProductDialog(product)}>
                                                                <Edit className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                        </motion.div>
                                                        <motion.div whileHover={{ scale: 1.1 }}>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </motion.div>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AdminGuard>
    );
}
