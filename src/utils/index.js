// Utility function to create page URLs
export const createPageUrl = (pageName) => {
  const routes = {
    Home: '/',
    Products: '/products',
    ProductDetail: '/product',
    Cart: '/cart',
    Checkout: '/checkout',
    Profile: '/profile',
    OrderHistory: '/orders',
    AdminDashboard: '/admin',
    AdminProducts: '/admin/products',
    AdminOrders: '/admin/orders'
  };
  
  return routes[pageName] || '/';
};

// Other utility functions
export const formatPrice = (price) => {
  return `₹${price.toFixed(2)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};