import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import HRManagementPage from '../components/views/HRManagement';

export default function HR() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) return <div className="flex-center" style={{ height: '100vh' }}>Verifying Session...</div>;

    if (!isAuthenticated) {
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    return (
        <Layout>
            <HRManagementPage />
        </Layout>
    );
}
