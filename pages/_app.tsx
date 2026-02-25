import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/finance.css';
import '../styles/admin.css';
import '../styles/premium-ui.css';
import { AuthProvider } from '../context/AuthContext';
import { SchoolProvider } from '../context/SchoolContext';

import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (url: string) => {
            console.log(`[Navigation] Redirected to: ${url}`);
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => router.events.off('routeChangeComplete', handleRouteChange);
    }, [router]);

    return (
        <AuthProvider>
            <SchoolProvider>
                <Component {...pageProps} />
            </SchoolProvider>
        </AuthProvider>
    );
}
