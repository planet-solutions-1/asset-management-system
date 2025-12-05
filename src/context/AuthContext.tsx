import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    register: (companyName: string, email: string, password: string, companyId: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [usersList, setUsersList] = useState<User[]>([]);

    useEffect(() => {
        // Load users list from local storage or mock
        const storedUsersList = localStorage.getItem('ams_users_list');
        if (storedUsersList) {
            setUsersList(JSON.parse(storedUsersList));
        } else {
            setUsersList(MOCK_USERS);
        }

        // Check local storage for persisted session
        const storedUser = localStorage.getItem('ams_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Persist users list whenever it changes
    useEffect(() => {
        if (usersList.length > 0) {
            localStorage.setItem('ams_users_list', JSON.stringify(usersList));
        }
    }, [usersList]);

    const login = async (email: string) => {
        // Simulate API call
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                const foundUser = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
                if (foundUser) {
                    setUser(foundUser);
                    localStorage.setItem('ams_user', JSON.stringify(foundUser));
                    resolve();
                } else {
                    reject(new Error('Invalid email'));
                }
            }, 500);
        });
    };

    const register = async (companyName: string, email: string, _password: string, companyId: string) => {
        // Simulate API call
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                const existingUser = usersList.find((u) => u.email === email);
                if (existingUser) {
                    reject(new Error('Email already registered'));
                    return;
                }

                const newUser: User = {
                    id: `u${Date.now()}`,
                    name: companyName + ' Admin',
                    email: email,
                    role: 'USER', // Default to USER, could be ADMIN if self-registering as company admin
                    companyId: companyId,
                    avatar: `https://ui-avatars.com/api/?name=${companyName}`,
                };

                const updatedUsersList = [...usersList, newUser];
                setUsersList(updatedUsersList);
                localStorage.setItem('ams_users_list', JSON.stringify(updatedUsersList));

                setUser(newUser);
                localStorage.setItem('ams_user', JSON.stringify(newUser));
                resolve();
            }, 800);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ams_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
