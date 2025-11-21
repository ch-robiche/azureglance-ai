import React, { useState } from 'react';
import { api } from '../services/api';

interface LoginPageProps {
    onLogin: (token: string, role: string) => void;
    onGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGuest }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                await api.register(username, password);
                setIsRegistering(false);
                alert('Registration successful! Please login.');
            } else {
                const { token, role } = await api.login(username, password);
                onLogin(token, role);
            }
        } catch (err) {
            setError('Authentication failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    {isRegistering ? 'Create Account' : 'Login to AzureGlance'}
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium transition-colors"
                    >
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                </form>

                <div className="mt-4 space-y-3 text-center">
                    <button
                        onClick={onGuest}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded font-medium transition-colors border border-slate-700"
                    >
                        Continue as Guest (Demo Mode)
                    </button>

                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-sm text-slate-400 hover:text-white transition-colors block w-full"
                    >
                        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
};
