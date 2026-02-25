import React, { useState } from 'react';
import { useSchool, generateId } from '../../context/SchoolContext';
import { BehaviorRecord, IncidentCategory, Student } from '../../types';
import { useAuth } from '../../context/AuthContext';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import GavelIcon from '@mui/icons-material/Gavel';
import FlagIcon from '@mui/icons-material/Flag';

interface AddBehaviorModalProps {
    student: Student;
    onClose: () => void;
}

export default function AddBehaviorModal({ student, onClose }: AddBehaviorModalProps) {
    const { saveBehaviorRecord, showToast } = useSchool();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<BehaviorRecord, 'id' | 'studentId' | 'staffId' | 'staffName'>>({
        type: 'Merit',
        category: 'Academics',
        points: 5,
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categories: IncidentCategory[] = [
        'Academics', 'Discipline', 'Leadership', 'Sportsmanship', 'Social', 'Hygiene', 'Other'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description) {
            showToast('Please provide a description', 'error');
            return;
        }

        setLoading(true);
        try {
            const record: BehaviorRecord = {
                ...formData,
                id: generateId(),
                studentId: student.id,
                staffId: user?.id || 'unknown',
                staffName: user?.name || 'Staff'
            };
            await saveBehaviorRecord(record);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-overlay animate-in" style={{ width: '500px' }}>
                <div className="modal-header">
                    <div className="flex-center">
                        <div className="icon-box mr-3" style={{ backgroundColor: formData.type === 'Merit' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                            {formData.type === 'Merit' ? <StarIcon style={{ color: '#10b981' }} /> : <GavelIcon style={{ color: '#ef4444' }} />}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Record Behavior Incident</h2>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>{student.firstName} {student.lastName}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close Modal"><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-24">
                    <div className="form-group mb-20">
                        <label>Incident Type</label>
                        <div className="flex gap-4" style={{ display: 'flex', gap: 12 }}>
                            <button
                                type="button"
                                className={`btn-outline flex-1 ${formData.type === 'Merit' ? 'active green' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, type: 'Merit', points: 5 }))}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}
                            >
                                <StarIcon /> Merit (Points +)
                            </button>
                            <button
                                type="button"
                                className={`btn-outline flex-1 ${formData.type === 'Demerit' ? 'active red' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, type: 'Demerit', points: -5 }))}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}
                            >
                                <GavelIcon /> Demerit (Points -)
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-2 mb-20">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className="form-control"
                                value={formData.category}
                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Points Impact</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.points}
                                onChange={e => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className="form-group mb-20">
                        <label>Date of Incident</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formData.date}
                            onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                    </div>

                    <div className="form-group mb-24">
                        <label>Detailed Description</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Describe what happened..."
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="modal-actions pt-0">
                        <button type="button" className="btn btn-muted" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className={`btn btn-primary ${formData.type === 'Demerit' ? 'red' : 'green'}`} disabled={loading}>
                            {loading ? 'Saving...' : 'Record Incident'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
