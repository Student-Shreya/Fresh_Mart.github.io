// Mock CartItem entity for demonstration
export class CartItem {
    constructor(data) {
        this.id = data.id || Date.now().toString();
        this.user_email = data.user_email;
        this.product_id = data.product_id;
        this.quantity = data.quantity || 1;
        this.created_at = data.created_at || new Date().toISOString();
    }

    static async filter(filters) {
        const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
        return items.filter(item => {
            return Object.keys(filters).every(key => {
                if (key === 'user_email') return item.user_email === filters[key];
                if (key === 'product_id') return item.product_id === filters[key];
                return true;
            });
        });
    }

    static async create(data) {
        const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const newItem = new CartItem(data);
        items.push(newItem);
        localStorage.setItem('cartItems', JSON.stringify(items));
        return newItem;
    }

    static async update(id, data) {
        const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            localStorage.setItem('cartItems', JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    static async delete(id) {
        const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem('cartItems', JSON.stringify(filteredItems));
        return true;
    }

    static async bulkCreate(itemsData) {
        const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const newItems = itemsData.map(data => new CartItem(data));
        items.push(...newItems);
        localStorage.setItem('cartItems', JSON.stringify(items));
        return newItems;
    }
}