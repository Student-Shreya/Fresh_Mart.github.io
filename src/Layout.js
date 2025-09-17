
import { Button } from './Components/ui/button';
import { Input } from './Components/ui/input';
import { CartItem } from './Entities/CartItem';
import User from './Entities/User';
import { createPageUrl } from './utils';
import { BarChart2, Camera, Home, Leaf, ListOrdered, LogOut, Menu, Package, Search, ShoppingCart, User as UserIcon, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import CameraSearchModal from './Components/CameraSearchModal';

export default function Layout({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchUserData = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            if (currentUser) {
                const items = await CartItem.filter({ user_email: currentUser.email });
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            }
        } catch (error) {
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [currentPageName]);

    const handleLogout = async () => {
        await User.logout();
        setUser(null);
        toast.success("You have been logged out.");
        navigate(createPageUrl("Home"));
    };

    const handleLogin = async () => {
        await User.loginWithRedirect(window.location.href);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.search.value;
        if (query) {
            navigate(createPageUrl("Products") + `?search=${encodeURIComponent(query)}`);
            setMobileMenuOpen(false);
        }
    };

    const isAdminPage = currentPageName?.startsWith('Admin');
    
    const navItems = [
        { name: "Home", url: createPageUrl("Home") },
        { name: "All Products", url: createPageUrl("Products") },
    ];
    
    const adminNavItems = [
        { name: "Dashboard", url: createPageUrl("AdminDashboard"), icon: BarChart2 },
        { name: "Products", url: createPageUrl("AdminProducts"), icon: Package },
        { name: "Orders", url: createPageUrl("AdminOrders"), icon: ListOrdered },
        { name: "Go to Site", url: createPageUrl("Home"), icon: Home },
    ];

    const isActive = (path) => location.pathname === path;

    const renderHeader = () => (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to={createPageUrl("Home")} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center"><Leaf className="w-5 h-5 text-white" /></div>
                        <span className="text-xl font-bold text-gray-900">FreshMart</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 ml-10">
                        {navItems.map((item) => <Link key={item.name} to={item.url} className={`font-medium transition-colors ${isActive(item.url) ? "text-green-600" : "text-gray-600 hover:text-gray-900"}`}>{item.name}</Link>)}
                        )
                        }
                    </nav>

                    <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Input id="search" name="search" placeholder="Search for products..." className="pl-10" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </form>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsCameraModalOpen(true)} className="text-gray-700 p-2">
                           <Camera className="w-6 h-6" />
                        </Button>
                        <Link to={createPageUrl("Cart")} className="relative p-2 rounded-full hover:bg-gray-100">
                            <ShoppingCart className="w-6 h-6 text-gray-700" />
                            {cartCount > 0 && <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">{cartCount}</span>}
                            }
                        </Link>
                        {user ? (
                            <>
                                <Link to={createPageUrl("Profile")} className="p-2 rounded-full hover:bg-gray-100"><UserIcon className="w-6 h-6 text-gray-700" /></Link>
                                <Button onClick={handleLogout} variant="ghost" size="icon" className="text-gray-700"><LogOut className="w-6 h-6" /></Button>
                            </>
                        ) : (<Button onClick={handleLogin}>Sign In</Button>)}
                        )
                        }
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white p-4 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input id="search-mobile" name="search" placeholder="Search..." />
                            <Button type="submit"><Search className="w-4 h-4" /></Button>
                        </form>
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => <Link key={item.name} to={item.url} className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.url) ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"}`} onClick={() => setMobileMenuOpen(false)}>{item.name}</Link>)}
                            )
                            }
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );

    const renderFooter = () => (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-4"><Leaf className="w-6 h-6 text-green-400" /><span className="text-xl font-bold">FreshMart</span></div>
                    <p className="text-gray-400">Fresh groceries delivered to your door. Quality products, exceptional service.</p>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Shop</h3>
                    <div className="space-y-2 text-gray-400">
                        <Link to={createPageUrl("Products")} className="block hover:text-white">All Products</Link>
                        <Link to={createPageUrl("Products")} className="block hover:text-white">Fresh Produce</Link>
                        <Link to={createPageUrl("Products")} className="block hover:text-white">Organic</Link>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Account</h3>
                    <div className="space-y-2 text-gray-400">{user ? (<>
                        <Link to={createPageUrl("Profile")} className="block hover:text-white">My Profile</Link>
                        <Link to={createPageUrl("OrderHistory")} className="block hover:text-white">Order History</Link>
                    </>) : (<button onClick={handleLogin} className="block hover:text-white text-left">Sign In</button>)}</div>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Delivery Info</h3>
                    <div className="space-y-2 text-gray-400"><span className="block">Same Day Delivery</span><span className="block">Free on Orders $35+</span><span className="block">Fresh Guarantee</span></div>
                </div>
            </div><div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400"><p>&copy; 2024 FreshMart. All rights reserved.</p></div></div>
        </footer>
    );

    const renderAdminLayout = () => (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <aside className="w-64 bg-gray-800 text-white p-4 space-y-6 hidden md:block">
                    <div className="flex items-center gap-3 px-2">
                        <Leaf className="w-8 h-8 text-green-400" />
                        <span className="text-2xl font-bold">Admin</span>
                    </div>
                    <nav className="space-y-2">
                        {adminNavItems.map(item => (
                             <Link key={item.name} to={item.url} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.url) ? 'bg-green-600 text-white' : 'hover:bg-gray-700'}`}>
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    <div className="p-8">
                       {children}
                    </div>
                </main>
            </div>
        </div>
    );

    if (isAdminPage) {
        return (
            <>
                <Toaster richColors />
                {renderAdminLayout()}
            </>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Toaster richColors />
            {isCameraModalOpen && <CameraSearchModal onClose={() => setIsCameraModalOpen(false)} />}
            {renderHeader()}
            <main className="flex-grow">
                {children}
            </main>
            {renderFooter()}
        </div>
    );
}
