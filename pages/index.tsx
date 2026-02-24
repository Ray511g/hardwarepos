import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Dashboard from '../components/views/Dashboard';

export default function IndexPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login');
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (!isAuthenticated) return null;

    return (
        <Layout>
            <Dashboard />
        </Layout>
    );
}
