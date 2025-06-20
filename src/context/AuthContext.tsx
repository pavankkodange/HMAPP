import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'isActive'>) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  updateLastLogin: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for MVP - using hotel domain names for user accounts
const DEMO_USERS: User[] = [
  { 
    id: '1', 
    name: 'Sarah Johnson', 
    email: 'sarah@harmonysuite.com', 
    role: 'manager',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T08:30:00Z',
    department: 'Operations',
    phoneNumber: '+1-555-0101',
    emergencyContact: '+1-555-0102',
    notes: 'Senior manager with 5+ years experience'
  },
  { 
    id: '2', 
    name: 'Mike Chen', 
    email: 'mike@harmonysuite.com', 
    role: 'front-desk',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T09:15:00Z',
    department: 'Front Office',
    phoneNumber: '+1-555-0103',
    emergencyContact: '+1-555-0104',
    notes: 'Excellent customer service skills'
  },
  { 
    id: '3', 
    name: 'Lisa Rodriguez', 
    email: 'lisa@harmonysuite.com', 
    role: 'housekeeping',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T06:45:00Z',
    department: 'Housekeeping',
    phoneNumber: '+1-555-0105',
    emergencyContact: '+1-555-0106',
    notes: 'Team lead for housekeeping department'
  },
  { 
    id: '4', 
    name: 'David Kim', 
    email: 'david@harmonysuite.com', 
    role: 'restaurant',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T10:00:00Z',
    department: 'Food & Beverage',
    phoneNumber: '+1-555-0107',
    emergencyContact: '+1-555-0108',
    notes: 'Head chef with culinary expertise'
  },
  { 
    id: '5', 
    name: 'Alex Thompson', 
    email: 'admin@harmonysuite.com', 
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T07:30:00Z',
    department: 'Administration',
    phoneNumber: '+1-555-0109',
    emergencyContact: '+1-555-0110',
    notes: 'System administrator with full access'
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication - in production, this would be a real API call
    const foundUser = users.find(u => u.email === email && u.isActive);
    if (foundUser) {
      setUser(foundUser);
      updateLastLogin(foundUser.id);
      localStorage.setItem('vervConnectUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vervConnectUser');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isActive: true
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...userData } : user
    ));
    
    // Update current user if it's the same user
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const updateLastLogin = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, lastLogin: new Date().toISOString() } : user
    ));
  };

  // Check for stored user on component mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('vervConnectUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Verify user still exists and is active
      const currentUser = users.find(u => u.id === parsedUser.id && u.isActive);
      if (currentUser) {
        setUser(currentUser);
      } else {
        localStorage.removeItem('vervConnectUser');
      }
    }
  }, [users]);

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      isAuthenticated: !!user,
      addUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      updateLastLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}