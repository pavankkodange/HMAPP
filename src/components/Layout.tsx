import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { useBranding } from '../context/BrandingContext';
import { VervConnectLogo } from './VervConnectLogo';
import { Hotel, Calendar, Bed, Users, UtensilsCrossed, BarChart3, LogOut, Menu, X, Settings, Shield, ZoomIn as Room, MessageSquare, DollarSign, Bell, Building } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

export function Layout({ children, currentModule, onModuleChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useCommunication();
  const { branding, formatTime, getCurrentTime } = useBranding();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getModulesForRole = () => {
    const baseModules = [
      { id: 'dashboard', name: 'Dashboard', icon: BarChart3 }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseModules,
          { id: 'rooms', name: 'Rooms & Bookings', icon: Bed },
          { id: 'housekeeping', name: 'Housekeeping', icon: Calendar },
          { id: 'banquet', name: 'Banquet Halls', icon: Users },
          { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed },
          { id: 'room-service', name: 'Room Service', icon: Room },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount },
          { id: 'financial', name: 'Financial', icon: DollarSign },
          { id: 'admin', name: 'Administration', icon: Shield }
        ];
      case 'manager':
        return [
          ...baseModules,
          { id: 'rooms', name: 'Rooms & Bookings', icon: Bed },
          { id: 'housekeeping', name: 'Housekeeping', icon: Calendar },
          { id: 'banquet', name: 'Banquet Halls', icon: Users },
          { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed },
          { id: 'room-service', name: 'Room Service', icon: Room },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount },
          { id: 'financial', name: 'Financial', icon: DollarSign }
        ];
      case 'front-desk':
        return [
          ...baseModules,
          { id: 'rooms', name: 'Rooms & Bookings', icon: Bed },
          { id: 'banquet', name: 'Banquet Halls', icon: Users },
          { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed },
          { id: 'room-service', name: 'Room Service', icon: Room },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount }
        ];
      case 'housekeeping':
        return [
          ...baseModules,
          { id: 'housekeeping', name: 'Housekeeping', icon: Calendar },
          { id: 'rooms', name: 'Room Status', icon: Bed },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount }
        ];
      case 'restaurant':
        return [
          ...baseModules,
          { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed },
          { id: 'room-service', name: 'Room Service', icon: Room },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount }
        ];
      default:
        return baseModules;
    }
  };

  const modules = getModulesForRole();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'front-desk': return 'Front Desk';
      case 'housekeeping': return 'Housekeeping';
      case 'restaurant': return 'Restaurant';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-600';
      case 'manager': return 'bg-blue-600';
      case 'front-desk': return 'bg-green-600';
      case 'housekeeping': return 'bg-orange-600';
      case 'restaurant': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'fixed inset-0 z-50' : 'hidden lg:flex'} ${mobile ? 'lg:hidden' : ''}`}>
      {mobile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className="flex flex-col w-80 cool-glass-effect shadow-xl border-r border-cool-200">
        {/* VervConnect Platform Branding */}
        <div className="flex items-center justify-between h-24 px-6 border-b border-cool-100">
          <div className="flex items-center space-x-4 w-full">
            <VervConnectLogo size="lg" animated={true} />
            <div className="flex-1">
              <h1 className="text-2xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">Verv</span>
                <span className="bg-gradient-to-r from-cool-600 to-cool-700 bg-clip-text text-transparent">Connect</span>
              </h1>
              <p className="text-sm bg-gradient-to-r from-sky-500 via-cool-500 to-sky-600 bg-clip-text text-transparent font-medium">
                Connect with Comfort
              </p>
            </div>
          </div>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-2 flex-shrink-0">
              <X className="w-6 h-6 text-cool-600" />
            </button>
          )}
        </div>

        {/* Hotel Info Section */}
        <div className="p-4 border-b border-cool-100">
          <div className="p-4 rounded-2xl cool-sky-gradient border border-cool-200">
            <div className="flex items-center space-x-3">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={`${branding.hotelName} Logo`}
                  className="h-10 w-auto rounded-lg shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cool-500 shadow-md flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-cool-800 truncate">{branding.hotelName}</h3>
                {branding.starRating > 0 && (
                  <div className="flex items-center space-x-1 mb-1">
                    {Array.from({ length: branding.starRating }, (_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                    <span className="text-xs ml-1 text-cool-600">
                      {branding.starRating} Star Hotel
                    </span>
                  </div>
                )}
                <p className="text-xs text-cool-600 truncate">
                  {branding.address.city}, {branding.address.state}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = currentModule === module.id;
              
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    onModuleChange(module.id);
                    if (mobile) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all relative ${
                    isActive 
                      ? 'bg-cool-100 text-cool-800 border-r-3 border-cool-500 shadow-lg' 
                      : 'text-cool-600 hover:bg-cool-50 hover:text-cool-700'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{module.name}</span>
                  {module.badge && module.badge > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {module.badge > 99 ? '99+' : module.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-cool-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 ${getRoleBadgeColor(user?.role || '')} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}>
              <span className="text-white font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cool-800 truncate">{user?.name}</p>
              <p className="text-xs text-cool-600 truncate">
                {getRoleDisplayName(user?.role || '')}
              </p>
            </div>
          </div>
          
          {/* Current Time Display */}
          <div className="mb-3 p-3 rounded-xl bg-sky-50 border border-sky-200">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <span className="text-sm font-medium text-sky-700">
                {formatTime(getCurrentTime())}
              </span>
            </div>
            <p className="text-xs mt-1 text-sky-500 truncate">
              {branding.timeZone.split('/')[1]?.replace('_', ' ')} Time
            </p>
          </div>
          
          {/* Notification Bell */}
          {unreadCount > 0 && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm font-medium text-red-700">
                  {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  onModuleChange('communications');
                  if (mobile) setSidebarOpen(false);
                }}
                className="text-xs mt-1 text-red-500 hover:text-red-700"
              >
                View messages
              </button>
            </div>
          )}
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all text-cool-600 hover:bg-cool-50 hover:text-cool-700"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <Sidebar mobile />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="cool-glass-effect shadow-sm border-b border-cool-100 lg:hidden">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-cool-500 hover:text-cool-700 flex-shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3 flex-1 justify-center">
              <VervConnectLogo size="sm" animated={true} />
              <div className="text-lg font-bold">
                <span className="bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">Verv</span>
                <span className="bg-gradient-to-r from-cool-600 to-cool-700 bg-clip-text text-transparent">Connect</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={() => onModuleChange('communications')}
                  className="relative p-2 text-cool-500 hover:text-cool-700"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-cool-25/50 backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  );
}