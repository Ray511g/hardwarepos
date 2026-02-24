import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
    Info as InfoIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Person as PersonIcon,
    Code as CodeIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';

export default function About() {
    const { settings } = useSchool();

    return (
        <div className="page-container">
            <div className="page-header text-center mb-40">
                <div style={{ width: '100%' }}>
                    <h1 className="page-title" style={{ WebkitTextFillColor: 'initial', background: 'none', color: 'inherit' }}>
                        {settings?.schoolName || 'School management system'}
                    </h1>
                    <p className="page-subtitle">Version 2.0.4 • Professional School Management solution designed for modern educational institutions.</p>
                </div>
            </div>

            <div className="centered-content">
                <div className="card" style={{ padding: 40, position: 'relative', overflow: 'hidden' }}>
                    <div className="card-bg-icon">
                        <InfoIcon style={{ fontSize: 200 }} />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                            <div className="icon-box blue">
                                <VerifiedIcon style={{ fontSize: 32 }} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0 }}>{settings?.schoolName || 'School Management System'}</h2>
                                <span className="badge blue">Version 1.5.0 Production</span>
                            </div>
                        </div>

                        <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: 40 }}>
                            A flagship product designed to digitize education. This Management System is a state-of-the-art platform built to streamline administrative workflows,
                            enhance academic tracking, and improve financial transparency in schools. Supporting both Traditional and
                            Competency-Based Curriculums (CBC), it provides teachers, administrators, and principals with the tools they
                            need to foster excellence in education.
                        </p>

                        <div className="section-title" style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CodeIcon color="primary" /> Developed By
                        </div>

                        <div className="contact-grid">
                            <div className="contact-item">
                                <PersonIcon color="action" />
                                <div>
                                    <div className="contact-label">Lead Developer</div>
                                    <div className="contact-value">Raymond Omondi</div>
                                </div>
                            </div>
                            <div className="contact-item">
                                <PhoneIcon color="action" />
                                <div>
                                    <div className="contact-label">Hotline</div>
                                    <div className="contact-value">0768841205</div>
                                </div>
                            </div>
                            <div className="contact-item">
                                <EmailIcon color="action" />
                                <div>
                                    <div className="contact-label">Support Email</div>
                                    <div className="contact-value">omondiraymond001@gmail.com</div>
                                </div>
                            </div>
                        </div>

                        <div className="feature-grid">
                            <div className="feature-card blue">
                                <h4 style={{ margin: '0 0 10px', color: 'var(--accent-blue)' }}>Comprehensive CBC Support</h4>
                                <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>Full integration of Competency Based Curriculum features, assessment strands, and level descriptors.</p>
                            </div>
                            <div className="feature-card green">
                                <h4 style={{ margin: '0 0 10px', color: 'var(--accent-green)' }}>Financial Integrity</h4>
                                <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>Transparent fee tracking, automated receipting, and real-time financial reporting for stakeholders.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-32" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    &copy; {new Date().getFullYear()} {settings?.schoolName || 'School Management System'}. All rights reserved.
                </div>
            </div>
        </div>
    );
}
