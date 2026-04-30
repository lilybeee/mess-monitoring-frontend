import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface DashboardContextType {
    currentPeople: number;
    mealType: string;
    setMealType: (type: string) => void;
    dayStatus: string;
    setDayStatus: (status: string) => void;
    menu: string;
    setMenu: (menu: string) => void;
    connected: boolean;
    updateBackendStatus: (day: string, m: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [currentPeople, setCurrentPeople] = useState(0);
    const [mealType, setMealType] = useState('Loading...');
    const [dayStatus, setDayStatus] = useState('Loading...');
    const [menu, setMenu] = useState('Loading...');
    const [connected, setConnected] = useState(false);
    const esRef = useRef<EventSource | null>(null);

    useEffect(() => {
        const es = new EventSource(`${API_BASE_URL}/api/live-stream`);
        esRef.current = es;

        es.onopen = () => setConnected(true);

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!data.error) {
                    setCurrentPeople(data.currentPeople);
                    setMealType(data.mealType);
                    setDayStatus(data.dayStatus);
                    setMenu(data.menu);
                }
            } catch {
                console.error('Failed to parse SSE data');
            }
        };

        es.onerror = () => setConnected(false);

        return () => {
            es.close();
            esRef.current = null;
            setConnected(false);
        };
    }, []);

    const updateBackendStatus = async (day: string, m: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/admin/update_status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ day_status: day, menu: m }),
            });
            // Optimistic update — SSE will confirm within 3 seconds
            setDayStatus(day);
            setMenu(m);
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <DashboardContext.Provider value={{
            currentPeople,
            mealType, setMealType,
            dayStatus, setDayStatus,
            menu, setMenu,
            connected,
            updateBackendStatus,
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};