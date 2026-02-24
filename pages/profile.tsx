import React from 'react';
import Layout from '../components/layout/Layout';
import ProfilePage from '../components/views/Profile';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Profile() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <Layout>
            <ProfilePage />
        </Layout>
    );
}
