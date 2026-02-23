import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { useRouter } from 'next/router';
import ErrorIcon from '@mui/icons-material/Error';

export default function Login() {
    const { login } = useAuth();
    const { settings } = useSchool();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                router.push('/');
            } else {
                setError('Invalid credentials. Please check your email/username and password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-side-image">
                <div className="login-side-content">
                    <h2>Empowering the Future of Education</h2>
                    <p>Experience a seamless, secure, and modern way to manage school records, finances, and academic excellence with the Elirama ERP system.</p>
                </div>
            </div>

            <div className="login-side-form">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            {settings.logo ? (
                                <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                (settings.schoolName || 'S')[0]
                            )}
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Please sign in to your {settings.schoolName || 'School Management System'} account</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <ErrorIcon style={{ fontSize: 18 }} />
                            {error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email or Username</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter your email or username"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
