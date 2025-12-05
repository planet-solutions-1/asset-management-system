import type { Asset, Company, User } from '../types';

export const MOCK_COMPANIES: Company[] = [
    {
        id: 'c1',
        name: 'TechCorp Solutions',
        address: '123 Tech Park, Silicon Valley',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
    {
        id: 'c2',
        name: 'City Government Office',
        address: '456 Public Square, Downtown',
        logo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=100&h=100&fit=crop',
    },
];

export const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Super Admin',
        email: 'admin@system.com',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    {
        id: 'u2',
        name: 'John Tech',
        email: 'john@techcorp.com',
        role: 'USER',
        companyId: 'c1',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    {
        id: 'u3',
        name: 'Sarah Gov',
        email: 'sarah@gov.com',
        role: 'USER',
        companyId: 'c2',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
];

export const MOCK_ASSETS: Asset[] = [
    {
        id: 'a1',
        name: 'Central AC Unit - Server Room',
        type: 'AC',
        companyId: 'c1',
        status: 'AVAILABLE',
        location: 'Building A, Server Room',
        purchaseDate: '2023-01-15',
        warrantyExpiry: '2026-01-15',
        amcExpiry: '2024-01-15',
        image: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?w=400&h=300&fit=crop',
        specifications: { Brand: 'Daikin', Capacity: '2 Ton' },
        maintenanceHistory: [],
    },
    {
        id: 'a2',
        name: 'Backup Generator',
        type: 'GENERATOR',
        companyId: 'c1',
        status: 'MAINTENANCE',
        location: 'Building A, Basement',
        purchaseDate: '2022-06-10',
        warrantyExpiry: '2027-06-10',
        amcExpiry: '2024-06-10',
        specifications: { Brand: 'Cummins', Output: '125 kVA' },
        maintenanceHistory: [
            {
                id: 'm1',
                assetId: 'a2',
                date: '2023-12-01',
                type: 'ROUTINE',
                description: 'Annual servicing',
                performedBy: 'PowerSystems Inc',
                cost: 500,
                status: 'RESOLVED',
                resolvedDate: '2023-12-02',
            },
        ],
    },
    {
        id: 'a3',
        name: 'Dell Latitude 5420',
        type: 'COMPUTER',
        companyId: 'c2',
        status: 'IN_USE',
        location: 'Finance Dept, Desk 4',
        purchaseDate: '2023-03-20',
        warrantyExpiry: '2026-03-20',
        specifications: { Processor: 'i7', RAM: '16GB' },
        maintenanceHistory: [],
    },
    {
        id: 'a4',
        name: 'Ceiling Fan',
        type: 'FAN',
        companyId: 'c2',
        status: 'BROKEN',
        location: 'Lobby',
        purchaseDate: '2020-01-01',
        warrantyExpiry: '2022-01-01',
        maintenanceHistory: [],
    },
];
