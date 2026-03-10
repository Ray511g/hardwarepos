import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import POSView from '../components/views/POS';

export default function POSPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login');
    }, [isAuthenticated, isLoading, router]);
    if (isLoading) return null;
    if (!isAuthenticated) return null;
    return <Layout><POSView /></Layout>;
}
