import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const { students, teachers, staff } = useSchool();
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const q = query.toLowerCase();
        const res: any[] = [];

        // Search Students
        students?.filter(s => 
            s.firstName.toLowerCase().includes(q) || 
            s.lastName.toLowerCase().includes(q) || 
            s.admissionNumber.toLowerCase().includes(q)
        ).slice(0, 5).forEach(s => res.push({ type: 'Student', label: `${s.firstName} ${s.lastName}`, sub: s.admissionNumber, icon: <PeopleIcon />, link: `/students?id=${s.id}` }));

        // Search Teachers
        teachers?.filter(t => 
            t.firstName.toLowerCase().includes(q) || 
            t.lastName.toLowerCase().includes(q)
        ).slice(0, 3).forEach(t => res.push({ type: 'Teacher', label: `${t.firstName} ${t.lastName}`, sub: t.phone, icon: <SchoolIcon />, link: `/teachers?id=${t.id}` }));

        // Search Staff
        staff?.filter(s => 
            s.firstName.toLowerCase().includes(q) || 
            s.lastName.toLowerCase().includes(q)
        ).slice(0, 3).forEach(s => res.push({ type: 'Staff', label: `${s.firstName} ${s.lastName}`, sub: s.role, icon: <BadgeIcon />, link: `/hr?id=${s.id}` }));

        setResults(res);
    }, [query, students, teachers, staff]);

    if (!isOpen) {
        return (
            <div className="sidebar-search-trigger" onClick={() => setIsOpen(true)}>
                <SearchIcon style={{ fontSize: 18 }} />
                <span>Search anything...</span>
                <span className="search-kb">⌘K</span>
            </div>
        );
    }

    return (
        <div className="global-search-overlay" onClick={() => setIsOpen(false)}>
            <div className="global-search-modal" onClick={e => e.stopPropagation()}>
                <div className="search-input-wrapper">
                    <SearchIcon className="search-icon-main" />
                    <input 
                        ref={el => el?.focus()}
                        type="text" 
                        placeholder="Search students, staff, reports, or finance..." 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button className="close-search" onClick={() => setIsOpen(false)}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="search-results custom-scrollbar">
                    {query && results.length === 0 ? (
                        <div className="no-results">
                            <DescriptionIcon style={{ fontSize: 48, opacity: 0.1 }} />
                            <p>No matches found for "{query}"</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="results-list">
                            {results.map((res, idx) => (
                                <div key={idx} className="result-item" onClick={() => {
                                    router.push(res.link);
                                    setIsOpen(false);
                                    setQuery('');
                                }}>
                                    <div className="result-icon">{res.icon}</div>
                                    <div className="result-info">
                                        <div className="result-label">{res.label}</div>
                                        <div className="result-sub">{res.type} • {res.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="search-placeholder">
                            <p className="text-muted text-xs uppercase font-bold tracking-wider">Quick Jump</p>
                            <div className="quick-links">
                                <div className="quick-link" onClick={() => router.push('/fees')}>Finance Dashboard</div>
                                <div className="quick-link" onClick={() => router.push('/hr')}>Payroll Center</div>
                                <div className="quick-link" onClick={() => router.push('/reports')}>Academic Reports</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="search-footer">
                    <span><kbd>↑↓</kbd> to navigate</span>
                    <span><kbd>Enter</kbd> to select</span>
                    <span><kbd>ESC</kbd> to close</span>
                </div>
            </div>
        </div>
    );
}
