import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const isTokenValid = (token) => {
    try {
        const [, payloadBase64] = token.split('.');
        if (!payloadBase64) return false;
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        if (!payload.exp) return true;
        const nowSeconds = Math.floor(Date.now() / 1000);
        return payload.exp > nowSeconds;
    } catch {
        return false;
    }
};

const Navbar = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            if (token && isTokenValid(token)) {
                setIsAuthenticated(true);
            } else {
                if (token) localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        };

        checkAuth();

        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-slate-800 via-blue-800 to-slate-700 text-white shadow-xl">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold hover:text-blue-300 transition-colors duration-200 flex items-center">
                    <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2V6m8 0H8" />
                    </svg>
                    Job Scraper
                </Link>
                <div className="flex gap-6">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="hover:text-blue-300 transition-colors duration-200 font-medium">Dashboard</Link>
                            <Link to="/applications" className="hover:text-blue-300 transition-colors duration-200 font-medium">Applications</Link>
                            <Link to="/profile" className="hover:text-blue-300 transition-colors duration-200 font-medium">Profile</Link>
                            <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 font-medium backdrop-blur-sm">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-300 transition-colors duration-200 font-medium">Login</Link>
                            <Link to="/signup" className="hover:text-blue-300 transition-colors duration-200 font-medium">Signup</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
