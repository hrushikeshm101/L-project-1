'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from '@/components/providers/CartProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function Navbar() {
  const { user, logout, loading: authLoading } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Check if user has admin role in Firestore
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }

    const checkAdminRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
      } catch (err) {
        console.error('Failed to check admin role:', err);
      } finally {
        setRoleLoading(false);
      }
    };
    checkAdminRole();
  }, [user]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition flex items-center gap-2"
          >
            <span>Zshop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-neutral-600 px-3 py-1.5 rounded-lg hover:bg-neutral-200 font-medium transition">Home</Link>
            {!roleLoading && isAdmin && (
              <Link href="/admin" className="text-neutral-600 px-3 py-1.5 hover:text-neutral-800 hover:bg-neutral-200 rounded-lg font-extrabold transition ">
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            {user && <Link 
              href="/cart" 
              className="relative p-2 text-gray-600 hover:text-neutral-600 transition px-3 py-1.5 hover:bg-neutral-200 rounded-lg"
              aria-label="Shopping Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>}

            {/* Auth State */}
            {authLoading || roleLoading ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition">
                  Login
                </Link>
                <Link href="/signup" className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md transition"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3 animate-fadeIn">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-gray-700 hover:bg-gray-50 rounded">
              Home
            </Link>
            {!roleLoading && isAdmin && (
              <Link href="/admin/products" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-purple-600 hover:bg-purple-50 rounded font-medium">
                Admin Panel
              </Link>
            )}
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-gray-700 hover:bg-gray-50 rounded flex justify-between">
              <span>Cart</span>
              <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">{cartCount}</span>
            </Link>

            {authLoading || roleLoading ? (
              <div className="px-2 py-2 bg-gray-100 rounded animate-pulse h-8" />
            ) : user ? (
              <div className="px-2 pt-2 border-t border-gray-100 flex flex-col gap-2">
                {/* <span className="text-sm text-gray-600 px-2">Logged in as {user.email}</span> */}
                <button 
                  onClick={handleLogout} 
                  className="text-left px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}