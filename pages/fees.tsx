import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import FeesPage from '../components/views/Fees';

export default function Fees() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) return <div className="flex-center" style={{ height: '100vh' }}>Verifying Session...</div>;

    if (!isAuthenticated) return (
        <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ color: 'var(--accent-red)' }}>Session Expired or Unauthorized</h2>
            <button className="btn-primary" onClick={() => router.push('/login')}>Go to Login</button>
        </div>
    );

    return <Layout><FeesPage /></Layout>;
}
