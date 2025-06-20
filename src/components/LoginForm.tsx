import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { VervConnectLogo } from './VervConnectLogo';
import { Lock, Mail, Shield } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { login } = useAuth();
  const { branding } = useBranding();

  const demoAccounts = [
    { role: 'admin', email: 'admin@harmonysuite.com', name: 'Alex Thompson - Administrator', icon: Shield, color: 'purple' },
    { role: 'manager', email: 'sarah@harmonysuite.com', name: 'Sarah Johnson - Manager', icon: Shield, color: 'blue' },
    { role: 'front-desk', email: 'mike@harmonysuite.com', name: 'Mike Chen - Front Desk', icon: Shield, color: 'green' },
    { role: 'housekeeping', email: 'lisa@harmonysuite.com', name: 'Lisa Rodriguez - Housekeeping', icon: Shield, color: 'orange' },
    { role: 'restaurant', email: 'david@harmonysuite.com', name: 'David Kim - Restaurant', icon: Shield, color: 'red' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password || 'demo');
      if (!success) {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 25%, #f8fafc 50%, #e2e8f0 75%, #cbd5e1 100%)'
      }}
    >
      {/* Floating Elements - Cool Blue & Neutral */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-sky-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-cool-200/40 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-sky-100/25 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-cool-300/30 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-sky-300/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-10 left-1/3 w-20 h-20 bg-cool-400/25 rounded-full blur-lg animate-float"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="cool-glass-effect rounded-3xl shadow-2xl p-8 border border-cool-200/50 animate-cool-pulse">
          <div className="text-center mb-8">
            <div className="mb-6">
              {/* VervConnect Logo with Cool Blue & Neutral Branding */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <VervConnectLogo size="xl" animated={true} />
                <div>
                  <h1 className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">
                      Verv
                    </span>
                    <span className="bg-gradient-to-r from-cool-600 to-cool-700 bg-clip-text text-transparent">
                      Connect
                    </span>
                  </h1>
                </div>
              </div>
              
              {/* Tagline with Cool Blue & Neutral */}
              <div className="mb-4">
                <p className="text-xl font-semibold bg-gradient-to-r from-sky-600 via-cool-600 to-sky-700 bg-clip-text text-transparent">
                  "Connect with Comfort"
                </p>
              </div>
            </div>
            <p className="text-cool-600 mt-2 font-medium">Hotel Management Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-cool-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cool-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-cool-200 rounded-xl focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all bg-cool-25/90 backdrop-blur-sm text-cool-800 placeholder-cool-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cool-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cool-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-cool-200 rounded-xl focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all bg-cool-25/90 backdrop-blur-sm text-cool-800 placeholder-cool-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cool-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-cool-25 text-cool-600 rounded-full font-medium">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    onClick={() => handleDemoLogin(account.email)}
                    className="w-full text-left px-4 py-3 text-sm text-cool-700 rounded-xl border border-cool-100 hover:bg-cool-50 hover:border-cool-200 transition-all bg-cool-25/80 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-cool-500" />
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-xs text-cool-500">{account.email}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-xl border border-sky-200 bg-sky-50/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-sky-600" />
                <span className="text-sm font-medium text-sky-700">
                  Administrator Access
                </span>
              </div>
              <p className="text-xs text-sky-600">
                Use the Administrator account to access the full hotel configuration panel, including room setup, banquet hall management, branding customization, and system settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}