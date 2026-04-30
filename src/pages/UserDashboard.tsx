import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface TrafficPoint {
    time: string;
    people: number;
}

const UserDashboard = () => {
    const navigate = useNavigate();
    const { currentPeople, mealType, dayStatus, menu, connected } = useDashboard();
    const [graphData, setGraphData] = useState<TrafficPoint[]>([]);

    // Fetch traffic history once on mount, then refresh every 2 minutes
    useEffect(() => {
        const loadTraffic = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/student/traffic`);
                if (res.ok) {
                    const data = await res.json();
                    setGraphData(data.traffic);
                }
            } catch (error) {
                console.error('Failed to fetch traffic data', error);
            }
        };

        loadTraffic();
        const interval = setInterval(loadTraffic, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="flex-col h-screen" style={{ overflowY: 'auto', backgroundColor: 'var(--color-white)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <h2>Mess Monitoring System</h2>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                    Logout
                </button>
            </nav>

            {/* Main Content */}
            <main className="container p-8 flex flex-col" style={{ gap: '4rem' }}>
                <h1 className="mb-8" style={{ fontSize: '2rem' }}>User Dashboard</h1>

                {/* Top Section */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Stats Card */}
                    <div className="card flex-col justify-center items-center text-center">
                        <h3 className="mb-2" style={{ opacity: 0.8 }}>Current People in Mess</h3>
                        <div style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1, color: 'var(--color-dark-blue)' }}>
                            {currentPeople}
                        </div>
                        {/* Live indicator */}
                        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: connected ? '#22c55e' : '#9ca3af' }}>
                            {connected ? '● Live' : '○ Reconnecting...'}
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="card flex-col justify-center" style={{ gap: '1rem' }}>
                        <div className="flex items-center" style={{ fontSize: '1.2rem' }}>
                            <span style={{ fontWeight: 600, marginRight: '1rem' }}>Current Meal:</span>
                            <span className="badge badge-outline" style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>{mealType}</span>
                        </div>

                        <div className="flex items-center" style={{ fontSize: '1.2rem' }}>
                            <span style={{ fontWeight: 600, marginRight: '1rem' }}>Day Status:</span>
                            <span className="badge badge-solid" style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>{dayStatus}</span>
                        </div>

                        <div className="mt-4 p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid var(--color-dark-blue)' }}>
                            <span style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '1.2rem' }}>Today's Menu:</span>
                            <p style={{ fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 1.6 }}>{menu}</p>
                        </div>
                    </div>
                </div>

                {/* Graph Section */}
                <div className="card" style={{ padding: '2.5rem' }}>
                    <h3 className="mb-6" style={{ fontSize: '1.4rem' }}>Live Mess Traffic - {mealType}</h3>
                    <div style={{ width: '100%', height: '350px' }}>
                        {graphData.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                                No traffic data yet for this meal
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="time" stroke="var(--color-dark-blue)" />
                                    <YAxis stroke="var(--color-dark-blue)" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-white)',
                                            borderColor: 'var(--color-dark-blue)',
                                            color: 'var(--color-dark-blue)',
                                            fontWeight: 600
                                        }}
                                        formatter={(value?: number) => [`${value ?? 0}`, 'people']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="people"
                                        stroke="var(--color-dark-blue)"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
