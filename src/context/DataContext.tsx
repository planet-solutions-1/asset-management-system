import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Asset, Company } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
    assets: Asset[];
    companies: Company[];
    addAsset: (asset: Asset) => void;
    updateAsset: (asset: Asset) => void;
    deleteAsset: (id: string) => void;
    addCompany: (company: Company) => void;
    getCompanyAssets: (companyId: string) => Asset[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const { user } = useAuth();

    const fetchData = async () => {
        if (!user) return;
        try {
            const [assetsRes, companiesRes] = await Promise.all([
                api.get('/assets'),
                api.get('/companies')
            ]);
            setAssets(assetsRes.data);
            setCompanies(companiesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const addAsset = async (asset: Asset) => {
        try {
            const res = await api.post('/assets', asset);
            setAssets((prev) => [res.data, ...prev]);
        } catch (err) {
            console.error('Error adding asset:', err);
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
        // Admin only, usually. Or registration handles it.
        // For now, we'll just update state locally or call API if we had one.
        // Since registration handles creation, this might be unused or for Admin.
        setCompanies((prev) => [...prev, company]);
    };

    const getCompanyAssets = (companyId: string) => {
        return assets.filter((a) => a.companyId === companyId);
    };

    return (
        <DataContext.Provider
            value={{
                assets,
                companies,
                addAsset,
                updateAsset,
                deleteAsset,
                addCompany,
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
