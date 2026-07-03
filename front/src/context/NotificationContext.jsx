import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [newCount, setNewCount] = useState(0);
    const { user } = useAuth();

    const addNotification = (notification) => {
        setNotifications(prev => [...prev, { id: Date.now(), ...notification }]);
    };

    const fetchTaskCount = async () => {
        if (!user) {
            setNewCount(0);
            return;
        }
        try {
            const res = await api.get('/tasks');
            // Count tasks that are 'yangi' (new)
            const count = res.data.filter(t => t.status === 'yangi').length;
            setNewCount(count);
        } catch (err) {
            console.error("Error fetching tasks for notification count:", err.message);
        }
    };

    useEffect(() => {
        fetchTaskCount();
        
        // Poll every 30 seconds
        const interval = setInterval(fetchTaskCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            addNotification, 
            newCount, 
            refreshNotifications: fetchTaskCount 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
