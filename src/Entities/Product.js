// Mock Product entity for demonstration
export class Product {
    constructor(data) {
        this.id = data.id || Date.now().toString();
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.image_url = data.image_url;
        this.category_id = data.category_id;
        this.category_name = data.category_name;
        this.brand = data.brand;
        this.unit = data.unit;
        this.stock_quantity = data.stock_quantity || 10;
        this.is_featured = data.is_featured || false;
        this.is_organic = data.is_organic || false;
        this.is_active = data.is_active !== false;
        this.dietary_type = data.dietary_type;
        this.created_date = data.created_date || new Date().toISOString();
    }

    static async filter(filters, sortBy = 'name', limit = null) {
        let products = this.getMockProducts();
        
        // Apply filters
        if (filters) {
            products = products.filter(product => {
                return Object.keys(filters).every(key => {
                    if (key === 'id' && filters[key].$in) {
                        return filters[key].$in.includes(product.id);
                    }
                    return product[key] === filters[key];
                });
            });
        }

        // Apply sorting
        if (sortBy.startsWith('-')) {
            const field = sortBy.substring(1);
            products.sort((a, b) => b[field] > a[field] ? 1 : -1);
        } else {
            products.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);
        }

        // Apply limit
        if (limit) {
            products = products.slice(0, limit);
        }

        return products;
    }

    static async get(id) {
        const products = this.getMockProducts();
        return products.find(p => p.id === id);
    }

    static async list(sortBy = 'name') {
        return this.filter({}, sortBy);
    }

    static getMockProducts() {
        return [
            new Product({
                id: '1',
                name: 'Fresh Bananas',
                description: 'Sweet and ripe bananas perfect for snacking',
                price: 45.99,
                image_url: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?w=400',
                category_id: '1',
                category_name: 'Fruits',
                brand: 'Fresh Farm',
                unit: 'per dozen',
                is_featured: true,
                is_organic: true,
                dietary_type: 'vegan'
            }),
            new Product({
                id: '2',
                name: 'Organic Apples',
                description: 'Crisp and juicy organic apples',
                price: 120.50,
                image_url: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?w=400',
                category_id: '1',
                category_name: 'Fruits',
                brand: 'Organic Valley',
                unit: 'per kg',
                is_featured: true,
                is_organic: true,
                dietary_type: 'vegan'
            }),
            new Product({
                id: '3',
                name: 'Fresh Milk',
                description: 'Pure and fresh dairy milk',
                price: 65.00,
                image_url: 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?w=400',
                category_id: '2',
                category_name: 'Dairy',
                brand: 'Pure Dairy',
                unit: 'per liter',
                is_featured: true,
                dietary_type: 'vegetarian'
            }),
            new Product({
                id: '4',
                name: 'Whole Wheat Bread',
                description: 'Healthy whole wheat bread',
                price: 35.00,
                image_url: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?w=400',
                category_id: '3',
                category_name: 'Bakery',
                brand: 'Healthy Bakes',
                unit: 'per loaf',
                is_featured: true,
                dietary_type: 'vegetarian'
            }),
            new Product({
                id: '5',
                name: 'Fresh Tomatoes',
                description: 'Red ripe tomatoes perfect for cooking',
                price: 40.00,
                image_url: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?w=400',
                category_id: '4',
                category_name: 'Vegetables',
                brand: 'Garden Fresh',
                unit: 'per kg',
                is_organic: true,
                dietary_type: 'vegan'
            }),
            new Product({
                id: '6',
                name: 'Chicken Breast',
                description: 'Fresh chicken breast meat',
                price: 250.00,
                image_url: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?w=400',
                category_id: '5',
                category_name: 'Meat',
                brand: 'Fresh Meat Co',
                unit: 'per kg',
                dietary_type: 'non-vegetarian'
            }),
            new Product({
                id: '7',
                name: 'Basmati Rice',
                description: 'Premium quality basmati rice',
                price: 180.00,
                image_url: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?w=400',
                category_id: '6',
                category_name: 'Grains',
                brand: 'Premium Grains',
                unit: 'per kg',
                is_featured: true,
                dietary_type: 'vegan'
            }),
            new Product({
                id: '8',
                name: 'Greek Yogurt',
                description: 'Creamy Greek yogurt with probiotics',
                price: 85.00,
                image_url: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?w=400',
                category_id: '2',
                category_name: 'Dairy',
                brand: 'Greek Delight',
                unit: 'per 500g',
                is_organic: true,
                dietary_type: 'vegetarian'
            })
        ];
    }
}