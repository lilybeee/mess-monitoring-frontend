import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const Login = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [role, setRole] = useState<'user' | 'admin' | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [error, setError] = useState('');

    const handleRoleSelect = (selectedRole: 'user' | 'admin') => {
        if (selectedRole === 'user') {
            navigate('/user');
        } else {
            setRole('admin');
            setStep(2);
            setError('');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (role === 'admin') {
            if (!username || !password) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (res.ok) {
                    navigate('/admin');
                } else {
                    const data = await res.json();
                    setError(data.detail || 'Login failed');
                }
            } catch (err) {
                setError('Network error, please try again.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center p-4 h-screen" style={{ backgroundColor: 'var(--color-white)' }}>
            <div className="card w-full" style={{ maxWidth: '500px', padding: '3rem' }}>
                <h2 className="text-center mb-6">Mess Monitoring System</h2>

                {step === 1 ? (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-center mb-4" style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                            Login As
                        </h3>
                        <button
                            type="button"
                            className="btn btn-outline p-4"
                            style={{ fontSize: '1.1rem' }}
                            onClick={() => handleRoleSelect('user')}
                        >
                            User
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline p-4"
                            style={{ fontSize: '1.1rem' }}
                            onClick={() => handleRoleSelect('admin')}
                        >
                            Admin
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                {role === 'admin' ? 'Admin Login' : 'User Login'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-dark-blue)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
                            >
                                Back
                            </button>
                        </div>
                        {error && (
                            <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        {role === 'admin' && (
                            <>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="input"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn w-full mt-2">
                                    Login
                                </button>
                            </>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;