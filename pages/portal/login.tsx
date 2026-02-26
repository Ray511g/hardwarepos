import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SchoolIcon from '@mui/icons-material/School';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LockIcon from '@mui/icons-material/Lock';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BadgeIcon from '@mui/icons-material/Badge';

export default function ParentPortalLogin() {
    const [admissionNumber, setAdmissionNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/portal/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admissionNumber, parentPhone: phone })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('portal_token', data.token);
                localStorage.setItem('portal_student', JSON.stringify(data.student));
                router.push('/portal');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portal-login-screen">
            <div className="portal-glass-container animate-in">
                <div className="portal-hero">
                    <div className="portal-logo">
                        <SchoolIcon style={{ fontSize: 40, color: 'white' }} />
                    </div>
                    <h1>Elirama Parent Portal</h1>
                    <p>Secure access to your child's academic journey</p>
                </div>

                <div className="portal-form-box">
                    {error && <div className="portal-error-badge">{error}</div>}
                    
                    <form onSubmit={handleLogin}>
                        <div className="portal-input-group">
                            <label><BadgeIcon style={{ fontSize: 16 }} /> Admission Number</label>
                            <input 
                                type="text" 
                                placeholder="E.g. ADM/2024/001" 
                                value={admissionNumber}
                                onChange={e => setAdmissionNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="portal-input-group">
                            <label><SmartphoneIcon style={{ fontSize: 16 }} /> Registered Phone Number</label>
                            <input 
                                type="tel" 
                                placeholder="07XX XXX XXX" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <button className="portal-login-btn" type="submit" disabled={loading}>
                            {loading ? 'Verifying Identity...' : 'Access Portal'}
                            {!loading && <KeyboardArrowRightIcon />}
                        </button>
                    </form>
                </div>

                <div className="portal-footer-links">
                    <span><LockIcon style={{ fontSize: 12 }} /> Encrypted Session</span>
                    <p>Issues logging in? Contact the school administration at +254 700 000 000</p>
                </div>
            </div>

            <style jsx>{`
                .portal-login-screen {
                    min-height: 100vh;
                    background: radial-gradient(circle at top right, #1e3a8a, #0f172a);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    font-family: 'Outfit', sans-serif;
                }
                .portal-glass-container {
                    width: 100%;
                    max-width: 440px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 32px;
                    padding: 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .portal-hero {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .portal-logo {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
                h1 { color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
                p { color: #94a3b8; margin: 8px 0 0; font-size: 15px; }
                .portal-form-box { margin-bottom: 30px; }
                .portal-input-group { margin-bottom: 24px; }
                .portal-input-group label { display: flex; align-items: center; gap: 8px; color: #cbd5e1; font-size: 13px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; }
                .portal-input-group input {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: white;
                    font-size: 16px;
                    outline: none;
                    transition: all 0.2s;
                }
                .portal-input-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
                .portal-login-btn {
                    width: 100%;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 16px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .portal-login-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); }
                .portal-login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .portal-error-badge {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 12px;
                    border-radius: 12px;
                    font-size: 13px;
                    margin-bottom: 24px;
                    text-align: center;
                }
                .portal-footer-links { text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); pt: 20px; }
                .portal-footer-links span { color: #64748b; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px; text-transform: uppercase; letter-spacing: 1px; }
                .portal-footer-links p { font-size: 12px; color: #475569; }
            `}</style>
        </div>
    );
}
