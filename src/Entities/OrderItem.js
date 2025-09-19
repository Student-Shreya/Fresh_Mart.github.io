// Mock OrderItem entity for demonstration
export class OrderItem {
    constructor(data) {
        this.id = data.id || Date.now().toString();
        this.order_id = data.order_id;
        this.product_id = data.product_id;
        this.quantity = data.quantity;
        this.price = data.price;
        this.product_name = data.product_name;
        this.unit = data.unit;
        this.created_at = data.created_at || new Date().toISOString();
    }

    static async filter(filters) {
        const items = JSON.parse(localStorage.getItem('orderItems') || '[]');
        return items.filter(item => {
            return Object.keys(filters).every(key => {
                return item[key] === filters[key];
            });
        });
    }

    static async create(data) {
        const items = JSON.parse(localStorage.getItem('orderItems') || '[]');
        const newItem = new OrderItem(data);
        items.push(newItem);
        localStorage.setItem('orderItems', JSON.stringify(items));
        return newItem;
    }

    static async bulkCreate(itemsData) {
        const items = JSON.parse(localStorage.getItem('orderItems') || '[]');
        const newItems = itemsData.map(data => new OrderItem(data));
        items.push(...newItems);
        localStorage.setItem('orderItems', JSON.stringify(items));
        return newItems;
    }
}