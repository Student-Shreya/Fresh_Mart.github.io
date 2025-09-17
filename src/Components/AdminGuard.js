import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import User from '../Entities/User';
import { createPageUrl } from './utils';

export default function AdminGuard({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const user = await User.me();
                if (user && user.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    // If user is logged in but not an admin, redirect to home
                    navigate(createPageUrl("Home"));
                }
            } catch (error) {
                // If not logged in, redirect to login then back here
                await User.loginWithRedirect(window.location.href);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">Verifying access...</p>
                    <p className="text-gray-500">Please wait while we check your credentials.</p>
                </div>
            </div>
        );
    }

    if (isAdmin) {
        return <>{children}</>;
    }

    // This return is a fallback, as navigation should handle redirection.
    return null;
}