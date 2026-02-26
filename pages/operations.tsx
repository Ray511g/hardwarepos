import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import OperationsPage from '../components/views/Operations';

export default function Operations() {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    if (isLoading) return null;
    if (!isAuthenticated) {
        router.replace('/login');
        return null;
    }

    return (
        <Layout>
            <OperationsPage />
        </Layout>
    );
}
