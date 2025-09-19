// Mock Category entity for demonstration
export class Category {
    constructor(data) {
        this.id = data.id || Date.now().toString();
        this.name = data.name;
        this.description = data.description;
        this.image_url = data.image_url;
        this.is_featured = data.is_featured || false;
        this.sort_order = data.sort_order || 0;
        this.created_date = data.created_date || new Date().toISOString();
    }

    static async filter(filters, sortBy = 'name', limit = null) {
        let categories = this.getMockCategories();
        
        // Apply filters
        if (filters) {
            categories = categories.filter(category => {
                return Object.keys(filters).every(key => {
                    return category[key] === filters[key];
                });
            });
        }

        // Apply sorting
        if (sortBy.startsWith('-')) {
            const field = sortBy.substring(1);
            categories.sort((a, b) => b[field] > a[field] ? 1 : -1);
        } else {
            categories.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);
        }

        // Apply limit
        if (limit) {
            categories = categories.slice(0, limit);
        }

        return categories;
    }

    static async get(id) {
        const categories = this.getMockCategories();
        return categories.find(c => c.id === id);
    }

    static async list(sortBy = 'name') {
        return this.filter({}, sortBy);
    }

    static getMockCategories() {
        return [
            new Category({
                id: '1',
                name: 'Fruits',
                description: 'Fresh seasonal fruits',
                image_url: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?w=400',
                is_featured: true,
                sort_order: 1
            }),
            new Category({
                id: '2',
                name: 'Dairy',
                description: 'Fresh dairy products',
                image_url: 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?w=400',
                is_featured: true,
                sort_order: 2
            }),
            new Category({
                id: '3',
                name: 'Bakery',
                description: 'Fresh baked goods',
                image_url: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?w=400',
                is_featured: true,
                sort_order: 3
            }),
            new Category({
                id: '4',
                name: 'Vegetables',
                description: 'Fresh vegetables',
                image_url: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?w=400',
                is_featured: true,
                sort_order: 4
            }),
            new Category({
                id: '5',
                name: 'Meat',
                description: 'Fresh meat products',
                image_url: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?w=400',
                is_featured: true,
                sort_order: 5
            }),
            new Category({
                id: '6',
                name: 'Grains',
                description: 'Rice, wheat and other grains',
                image_url: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?w=400',
                is_featured: true,
                sort_order: 6
            })
        ];
    }
}