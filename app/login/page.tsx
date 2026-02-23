'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('error');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.status === 200) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));

                setMessageType('success');
                setMessage('Login successful! Redirecting...');

                // Redirect based on role
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        router.push('/hamrosewa');
                    } else {
                        router.push('/dashboard');
                    }
                }, 1000);
            } else {
                setMessageType('error');
                setMessage(data.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            setMessageType('error');
            setMessage('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12 pt-24">
                <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src="/logo.jpg" alt="Hamro Sewa" className="h-16 w-auto" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-gray-500 mt-2">Login to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#1fb862] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-4 text-center text-sm font-medium ${messageType === 'success' ? 'text-[#FF6B35]' : 'text-red-600'}`}>
                            {message}
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-[#FF6B35] font-semibold hover:text-[#1fb862] transition-colors">
                                Register here
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <Link href="/" className="text-sm text-gray-500 hover:text-[#FF6B35] transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
