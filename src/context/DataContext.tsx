import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Asset, Company, User, Bill, Department } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
    assets: Asset[];
    companies: Company[];
    users: User[];
    bills: Bill[];
    departments: Department[];
    addAsset: (asset: Asset) => Promise<any>;
    updateAsset: (asset: Asset) => void;
    deleteAsset: (id: string) => void;
    addCompany: (company: Company) => void;
    addUser: (userData: Partial<User> & { password?: string }) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    addBill: (bill: Partial<Bill>) => Promise<void>;
    deleteBill: (id: string) => Promise<void>;
    addDepartment: (name: string) => Promise<Department>; // Update return type
    deleteDepartment: (id: string) => Promise<void>;
    getCompanyAssets: (companyId: string) => Asset[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... existing state ...
    const [assets, setAssets] = useState<Asset[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const { user } = useAuth();

    const fetchData = async () => {
        if (!user) return;
        try {
            const [assetsRes, companiesRes, usersRes, billsRes, deptsRes] = await Promise.all([
                api.get('/assets'),
                api.get('/companies'),
                api.get('/users').catch(() => ({ data: [] })),
                api.get('/bills').catch(() => ({ data: [] })),
                api.get('/departments').catch(() => ({ data: [] }))
            ]);
            setAssets(assetsRes.data);
            setCompanies(companiesRes.data);
            setUsers(usersRes.data);
            setBills(billsRes.data);
            setDepartments(deptsRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // ... (existing asset/company/user functions)

    const addDepartment = async (name: string) => {
        try {
            const res = await api.post('/departments', { name });
            setDepartments((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
            return res.data; // Return the new department
        } catch (err) {
            console.error('Error adding department:', err);
            throw err;
        }
    };

    const deleteDepartment = async (id: string) => {
        try {
            await api.delete(`/departments/${id}`);
            setDepartments((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            console.error('Error deleting department:', err);
            throw err;
        }
    };

    const addBill = async (billData: Partial<Bill>) => {
        try {
            const res = await api.post('/bills', billData);
            setBills((prev) => [res.data, ...prev]);
        } catch (err) {
            console.error('Error adding bill:', err);
            throw err;
        }
    };

    const deleteBill = async (id: string) => {
        try {
            await api.delete(`/bills/${id}`);
            setBills((prev) => prev.filter((b) => b.id !== id));
        } catch (err) {
            console.error('Error deleting bill:', err);
            throw err;
        }
    };

    // ... rest of code

    const addAsset = async (asset: Asset) => {
        try {
            const res = await api.post('/assets', asset);
            setAssets((prev) => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            console.error('Error adding asset:', err);
            throw err;
        }
    };

    const updateAsset = async (updatedAsset: Asset) => {
        try {
            const res = await api.put(`/assets/${updatedAsset.id}`, updatedAsset);
            setAssets((prev) => prev.map((a) => (a.id === res.data.id ? res.data : a)));
        } catch (err) {
            console.error('Error updating asset:', err);
        }
    };

    const deleteAsset = async (id: string) => {
        try {
            await api.delete(`/assets/${id}`);
            setAssets((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            console.error('Error deleting asset:', err);
        }
    };

    const addCompany = async (company: Company) => {
        try {
            const res = await api.post('/companies', company);
            setCompanies((prev) => [...prev, res.data]);
        } catch (err) {
            console.error('Error adding company:', err);
        }
    };

    const addUser = async (userData: Partial<User> & { password?: string }) => {
        try {
            const res = await api.post('/users', userData);
            setUsers((prev) => [...prev, res.data]);
        } catch (err) {
            console.error('Error adding user:', err);
            throw err;
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await api.delete(`/users/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
            throw err;
        }
    };

    const getCompanyAssets = (companyId: string) => {
        return assets.filter((a) => a.companyId === companyId);
    };

    return (
        <DataContext.Provider
            value={{
                assets,
                companies,
                users,
                bills,
                departments,
                addAsset,
                updateAsset,
                deleteAsset,
                addCompany,
                addUser,
                deleteUser,
                addBill,
                deleteBill,
                addDepartment,
                deleteDepartment,
                getCompanyAssets,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
