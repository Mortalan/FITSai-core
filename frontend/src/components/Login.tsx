import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For now, using the server IP port 9000
      const response = await axios.post('http://10.0.0.231:9000/api/v1/auth/login', {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      setAuth(access_token, user);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--accent)]">Momo</h1>
          <p className="text-gray-500 font-medium">Welcome to the future of FITSai</p>
        </div>

        <div className="bg-[var(--sidebar)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="text-left">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                  placeholder="name@fits.net.za"
                  required
                />
              </div>
              <div className="text-left">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-xs text-gray-500">
          This system is restricted to FITS personnel only.
        </p>
      </div>
    </div>
  );
};
