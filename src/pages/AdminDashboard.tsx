import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const MEAL_OPTIONS = [
    { value: 'breakfast', label: 'Breakfast', time: '7:30 AM – 10:00 AM' },
    { value: 'lunch',     label: 'Lunch',     time: '12:00 PM – 2:30 PM' },
    { value: 'snacks',    label: 'Snacks',    time: '4:30 PM – 6:00 PM'  },
    { value: 'dinner',    label: 'Dinner',    time: '7:00 PM – 9:00 PM'  },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { currentPeople, mealType, dayStatus, menu, updateBackendStatus } = useDashboard();

    const [draftDayStatus, setDraftDayStatus] = useState(dayStatus);
    const [draftMenu, setDraftMenu] = useState(menu);
    const [dayTypes, setDayTypes] = useState<{id: number, name: string}[]>([]);

    // ── Menu ID editor state ──────────────────────────────────────
    const [menuIdMealType, setMenuIdMealType] = useState('breakfast');
    const [menuIdDate, setMenuIdDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [menuIdValue, setMenuIdValue] = useState('');
    const [menuIdLoading, setMenuIdLoading] = useState(false);
    const [menuIdFeedback, setMenuIdFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        setDraftDayStatus(dayStatus);
        setDraftMenu(menu);
    }, [dayStatus, menu]);

    useEffect(() => {
        const fetchDayTypes = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/day_types`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) setDayTypes(data);
                }
            } catch (error) {
                console.error('Failed to fetch day types', error);
            }
        };
        fetchDayTypes();
    }, []);

    const handleSetState = async () => {
        await updateBackendStatus(draftDayStatus, draftMenu);
        alert('Server state updated successfully!');
    };

    const handleLogout = () => navigate('/login');

    // ── Menu ID update handler ────────────────────────────────────
    const handleUpdateMenuId = async () => {
        setMenuIdFeedback(null);

        const parsed = parseInt(menuIdValue, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 56) {
            setMenuIdFeedback({ type: 'error', message: 'Menu ID must be a number between 1 and 56.' });
            return;
        }

        setMenuIdLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/update_menu_id`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meal_type: menuIdMealType,
                    date: menuIdDate,
                    menu_id: parsed,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMenuIdFeedback({ type: 'success', message: data.message });
                setMenuIdValue('');
            } else {
                setMenuIdFeedback({ type: 'error', message: data.detail ?? 'Update failed.' });
            }
        } catch (err) {
            setMenuIdFeedback({ type: 'error', message: 'Network error. Could not reach the server.' });
        } finally {
            setMenuIdLoading(false);
        }
    };

    const selectedMealOption = MEAL_OPTIONS.find(m => m.value === menuIdMealType);

    return (
        <div className="flex-col h-screen" style={{ overflowY: 'auto', backgroundColor: 'var(--color-white)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <h2>Mess Monitoring System - Admin Panel</h2>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                    Logout
                </button>
            </nav>

            {/* Main Content */}
            <main className="container p-6 flex flex-col" style={{ gap: '3rem' }}>
                <h1 className="mb-6">Admin Dashboard</h1>

                {/* Current Status Section */}
                <section className="card">
                    <h2 className="mb-4">Current Status</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex-col justify-center">
                            <span style={{ fontWeight: 600, opacity: 0.8 }}>Current People:</span>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-dark-blue)' }}>
                                {currentPeople}
                            </div>
                        </div>

                        <div className="flex-col justify-center">
                            <span style={{ fontWeight: 600, opacity: 0.8, marginBottom: '8px' }}>Current Meal Type:</span>
                            <span className="badge badge-outline" style={{ alignSelf: 'flex-start', fontSize: '1rem' }}>
                                {mealType}
                            </span>
                        </div>

                        <div className="flex-col justify-center">
                            <span style={{ fontWeight: 600, opacity: 0.8, marginBottom: '8px' }}>Current Day Status:</span>
                            <span className="badge badge-solid" style={{ alignSelf: 'flex-start', fontSize: '1rem' }}>
                                {dayStatus}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Controls Section */}
                <section className="card">
                    <h2 className="mb-6">Controls</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Special Day Toggles */}
                        <div className="flex-col gap-2">
                            <label htmlFor="dayStatus" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Toggle Special Day</label>
                            <select
                                id="dayStatus"
                                className="input"
                                value={draftDayStatus}
                                onChange={(e) => setDraftDayStatus(e.target.value)}
                                style={{ cursor: 'pointer', padding: '1rem', fontSize: '1.1rem' }}
                            >
                                {dayTypes.length > 0 ? dayTypes.map(day => (
                                    <option key={day.id} value={day.name}>{day.name}</option>
                                )) : (
                                    <option value={draftDayStatus}>{draftDayStatus}</option>
                                )}
                            </select>
                        </div>

                        {/* Special Menu Toggles */}
                        <div className="flex-col gap-2">
                            <label htmlFor="menu" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Special Menu</label>
                            <textarea
                                id="menu"
                                className="input"
                                value={draftMenu}
                                onChange={(e) => setDraftMenu(e.target.value)}
                                style={{ padding: '1rem', fontSize: '1.1rem', minHeight: '100px', resize: 'vertical' }}
                                placeholder="Enter the special menu for today..."
                            />
                        </div>
                    </div>

                    <div className="mt-20 flex justify-center">
                        <button
                            className="btn"
                            style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                            onClick={handleSetState}
                        >
                            Set
                        </button>
                    </div>
                </section>

                {/* ── NEW: Update Menu ID Section ───────────────────────────── */}
                <section className="card">
                    <h2 className="mb-2">Update Menu ID</h2>
                    <p style={{ opacity: 0.65, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                        Reassign the menu for a specific meal period on a given date. All matching records
                        in <code>people_count</code> will be updated.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Meal Type Dropdown */}
                        <div className="flex-col gap-2">
                            <label htmlFor="menuIdMealType" style={{ fontWeight: 600, fontSize: '1rem' }}>
                                Meal Type
                            </label>
                            <select
                                id="menuIdMealType"
                                className="input"
                                value={menuIdMealType}
                                onChange={(e) => {
                                    setMenuIdMealType(e.target.value);
                                    setMenuIdFeedback(null);
                                }}
                                style={{ cursor: 'pointer', padding: '0.75rem 1rem', fontSize: '1rem' }}
                            >
                                {MEAL_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {selectedMealOption && (
                                <span style={{ fontSize: '0.8rem', opacity: 0.55, marginTop: '4px' }}>
                                    ⏰ {selectedMealOption.time}
                                </span>
                            )}
                        </div>

                        {/* Date Picker */}
                        <div className="flex-col gap-2">
                            <label htmlFor="menuIdDate" style={{ fontWeight: 600, fontSize: '1rem' }}>
                                Date
                            </label>
                            <input
                                id="menuIdDate"
                                type="date"
                                className="input"
                                value={menuIdDate}
                                onChange={(e) => {
                                    setMenuIdDate(e.target.value);
                                    setMenuIdFeedback(null);
                                }}
                                style={{ padding: '0.75rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
                            />
                        </div>

                        {/* Menu ID Input */}
                        <div className="flex-col gap-2">
                            <label htmlFor="menuIdValue" style={{ fontWeight: 600, fontSize: '1rem' }}>
                                New Menu ID <span style={{ opacity: 0.5, fontWeight: 400 }}>(1 – 56)</span>
                            </label>
                            <input
                                id="menuIdValue"
                                type="number"
                                className="input"
                                value={menuIdValue}
                                min={1}
                                max={56}
                                onChange={(e) => {
                                    setMenuIdValue(e.target.value);
                                    setMenuIdFeedback(null);
                                }}
                                placeholder="e.g. 14"
                                style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateMenuId()}
                            />
                        </div>
                    </div>

                    {/* Feedback banner */}
                    {menuIdFeedback && (
                        <div
                            style={{
                                marginTop: '1.25rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                backgroundColor: menuIdFeedback.type === 'success' ? '#d1fae5' : '#fee2e2',
                                color:           menuIdFeedback.type === 'success' ? '#065f46' : '#991b1b',
                                border: `1px solid ${menuIdFeedback.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
                            }}
                        >
                            {menuIdFeedback.type === 'success' ? '✅ ' : '❌ '}
                            {menuIdFeedback.message}
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        <button
                            className="btn"
                            style={{
                                padding: '0.8rem 2rem',
                                fontSize: '1.1rem',
                                opacity: menuIdLoading ? 0.6 : 1,
                                cursor: menuIdLoading ? 'not-allowed' : 'pointer',
                            }}
                            onClick={handleUpdateMenuId}
                            disabled={menuIdLoading}
                        >
                            {menuIdLoading ? 'Updating…' : 'Update Menu ID'}
                        </button>
                    </div>
                </section>

                <section className="card">
                    <div className="grid md:grid-cols-2 gap-8"></div>
                    <div className="mt-8 pt-6">
                        <button className="btn" style={{ padding: '1rem 2rem' }} onClick={() => alert('Opening Historical Data Modal/Page...')}>
                            View Historical Data
                        </button>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default AdminDashboard;