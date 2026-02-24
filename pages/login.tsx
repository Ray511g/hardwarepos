import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../components/views/Login';

export default function Login() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) router.replace('/');
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    return <LoginPage />;
}
