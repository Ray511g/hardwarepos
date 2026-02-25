import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, SUBJECTS, Teacher } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose: () => void;
    teacher?: Teacher | null;
}

export default function AddTeacherModal({ onClose, teacher }: Props) {
    const { addTeacher, updateTeacher, activeGrades } = useSchool();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        qualification: '',
        subjects: [] as string[],
        grades: [] as string[],
        maxLessonsDay: 8,
        maxLessonsWeek: 40,
    });

    useEffect(() => {
        if (teacher) {
            setForm({
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                email: teacher.email,
                phone: teacher.phone,
                qualification: teacher.qualification,
                subjects: teacher.subjects || [],
                grades: teacher.grades || [],
                maxLessonsDay: teacher.maxLessonsDay || 8,
                maxLessonsWeek: teacher.maxLessonsWeek || 40,
            });
        }
    }, [teacher]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (teacher) {
                await updateTeacher(teacher.id, form);
            } else {
                await addTeacher({
                    ...form,
                    status: 'Active',
                    joinDate: new Date().toISOString().split('T')[0],
                });
            }
            onClose();
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleSubject = (subject: string) => {
        setForm(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject],
        }));
    };

    const toggleGrade = (grade: string) => {
        setForm(prev => ({
            ...prev,
            grades: prev.grades.includes(grade)
                ? prev.grades.filter(g => g !== grade)
                : [...prev.grades, grade],
        }));
    };

    return (
        <div className="modal-overlay" onClick={() => !saving && onClose()}>
            <div className="modal" style={{ maxWidth: 800, width: '95%' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="m-0">{teacher ? 'Update Faculty Profile' : 'Enroll New Faculty'}</h2>
                        <p className="fs-12 opacity-60 m-0">Institutional teaching staff management</p>
                    </div>
                    <button className="modal-close" onClick={onClose} disabled={saving}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body custom-scrollbar" style={{ maxHeight: '70vh', padding: '30px' }}>
                        {/* Section 1: Personal Information */}
                        <div className="form-section mb-24">
                            <h4 className="fs-13 uppercase tracking-widest fw-700 opacity-60 mb-15 pb-6 border-bottom">Personal & Contact Details</h4>
                            <div className="form-row">
                                <div className="form-group" style={{ minWidth: '240px' }}>
                                    <label>Legal First Name *</label>
                                    <input className="form-control" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="e.g. John" disabled={saving} />
                                </div>
                                <div className="form-group" style={{ minWidth: '240px' }}>
                                    <label>Legal Last Name *</label>
                                    <input className="form-control" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="e.g. Doe" disabled={saving} />
                                </div>
                            </div>
                            <div className="form-row mt-15">
                                <div className="form-group" style={{ minWidth: '240px' }}>
                                    <label>Institutional Email *</label>
                                    <input type="email" className="form-control" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="j.doe@elirama.edu" disabled={saving} />
                                </div>
                                <div className="form-group" style={{ minWidth: '240px' }}>
                                    <label>Mobile Connection *</label>
                                    <input className="form-control" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+254 7XX XXX XXX" disabled={saving} />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Academic Background */}
                        <div className="form-section mb-24 mt-24">
                            <h4 className="fs-13 uppercase tracking-widest fw-700 opacity-60 mb-15 pb-6 border-bottom">Academic & Performance Parameters</h4>
                            <div className="form-group mb-15">
                                <label>Primary Qualification / Certification</label>
                                <input className="form-control" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. B.Ed (Arts), TSC No. 123456" disabled={saving} />
                            </div>
                            <div className="form-row">
                                <div className="form-group" style={{ minWidth: '200px' }}>
                                    <label>Max Lessons / Day</label>
                                    <input type="number" className="form-control" value={form.maxLessonsDay} onChange={e => setForm({ ...form, maxLessonsDay: parseInt(e.target.value) || 0 })} disabled={saving} />
                                </div>
                                <div className="form-group" style={{ minWidth: '200px' }}>
                                    <label>Max Lessons / Week</label>
                                    <input type="number" className="form-control" value={form.maxLessonsWeek} onChange={e => setForm({ ...form, maxLessonsWeek: parseInt(e.target.value) || 0 })} disabled={saving} />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Curriculum Assignment */}
                        <div className="form-section mt-24">
                            <h4 className="fs-13 uppercase tracking-widest fw-700 opacity-60 mb-15 pb-6 border-bottom">Pedagogical Assignment</h4>
                            <div className="form-group mb-20">
                                <label className="mb-12 block">Specialized Learning Areas (Subjects) *</label>
                                <div className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    {SUBJECTS.map(subject => (
                                        <button
                                            key={subject}
                                            type="button"
                                            className={`badge ${form.subjects.includes(subject) ? 'green active' : 'gray'}`}
                                            style={{ cursor: saving ? 'not-allowed' : 'pointer', border: '1px solid var(--border-color)', height: 34, padding: '0 16px', borderRadius: 6, transition: 'all 0.2s' }}
                                            onClick={() => !saving && toggleSubject(subject)}
                                            disabled={saving}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="mb-12 block">Assigned Grade Horizons (Classes)</label>
                                <div className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    {(activeGrades || []).map(grade => (
                                        <button
                                            key={grade}
                                            type="button"
                                            className={`badge ${form.grades.includes(grade) ? 'blue active' : 'gray'}`}
                                            style={{ cursor: saving ? 'not-allowed' : 'pointer', border: '1px solid var(--border-color)', height: 34, padding: '0 16px', borderRadius: 6, transition: 'all 0.2s' }}
                                            onClick={() => !saving && toggleGrade(grade)}
                                            disabled={saving}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '20px 30px' }}>
                        <button type="button" className="btn-outline" onClick={onClose} style={{ height: 46, minWidth: 120 }} disabled={saving}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ height: 46, minWidth: 180 }} disabled={saving}>
                            {saving ? 'Processing...' : (teacher ? 'Update Registry' : 'Complete Registration')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
