// Mock Order entity for demonstration
export class Order {
    constructor(data) {
        this.id = data.id || Date.now().toString();
        this.user_email = data.user_email;
        this.total_amount = data.total_amount;
        this.status = data.status || 'pending';
        this.delivery_address = data.delivery_address;
        this.payment_method = data.payment_method;
        this.created_at = data.created_at || new Date().toISOString();
    }

    static async filter(filters, sortBy = 'created_at', limit = null) {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Apply filters
        if (filters) {
            orders = orders.filter(order => {
                return Object.keys(filters).every(key => {
                    return order[key] === filters[key];
                });
            });
        }

        // Apply sorting
        if (sortBy.startsWith('-')) {
            const field = sortBy.substring(1);
            orders.sort((a, b) => new Date(b[field]) - new Date(a[field]));
        } else {
            orders.sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]));
        }

        // Apply limit
        if (limit) {
            orders = orders.slice(0, limit);
        }

        return orders;
    }

    static async create(data) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const newOrder = new Order(data);
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        return newOrder;
    }

    static async get(id) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        return orders.find(o => o.id === id);
    }

    static async update(id, data) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const index = orders.findIndex(order => order.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...data };
            localStorage.setItem('orders', JSON.stringify(orders));
            return orders[index];
        }
        return null;
    }
}