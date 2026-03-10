import React, { useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import { useSchool } from '../../context/SchoolContext';
import { SchoolSettings, TERMS } from '../../types';

interface Props {
    editing: boolean;
    setEditing: (editing: boolean) => void;
}

export const SchoolSettingsTab: React.FC<Props> = ({ editing, setEditing }) => {
    const { settings, updateSettings, uploadStudents, uploadTeachers, clearAllData, resetDashboardStats, downloadTemplate } = useSchool();
    const [form, setForm] = useState<SchoolSettings>(settings);

    // Synchronize local form whenever global settings are updated (from API or other tabs)
    React.useEffect(() => {
        setForm(settings);
    }, [settings]);

    const handleSave = async () => {
        const success = await updateSettings(form);
        if (success) setEditing(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SchoolSettings) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm(prev => ({ ...prev, [field]: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="admin-grid-2">
            <div className="admin-section">
                <h3><SettingsIcon className="nav-icon" /> Identity & Academic Cycle</h3>
                <div className="card">
                    <div className="settings-form">
                        {editing ? (
                            <div className="grid-gap-15">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>School Logo</label>
                                        <div className="flex-row mt-8">
                                            {form.logo && <img src={form.logo} className="preview-img" alt="Logo" />}
                                            <label className="btn-outline-sm pointer">
                                                <CloudUploadIcon fontSize="small" /> Upload
                                                <input type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Official Stamp</label>
                                        <div className="flex-row mt-8">
                                            {form.schoolStamp && <img src={form.schoolStamp} className="preview-img circular" alt="Stamp" />}
                                            <label className="btn-outline-sm pointer">
                                                <CloudUploadIcon fontSize="small" /> Upload
                                                <input type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'schoolStamp')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>School Name</label>
                                    <input type="text" className="form-control" value={form.schoolName} onChange={e => setForm({ ...form, schoolName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>School Motto</label>
                                    <input type="text" className="form-control" value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} />
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Current Term</label>
                                        <select className="form-control" value={form.currentTerm} onChange={e => setForm({ ...form, currentTerm: e.target.value })}>
                                            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Academic Year</label>
                                        <input type="number" className="form-control" value={form.currentYear} onChange={e => setForm({ ...form, currentYear: Number(e.target.value) })} />
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Official Email</label>
                                        <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile Phone</label>
                                        <input type="text" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid-3">
                                    <div className="form-group">
                                        <label>Fixed Telephone</label>
                                        <input type="text" className="form-control" value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>P.O. Box</label>
                                        <input type="text" className="form-control" value={form.poBox || ''} onChange={e => setForm({ ...form, poBox: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Paybill Number</label>
                                        <input type="text" className="form-control" value={form.paybillNumber || ''} onChange={e => setForm({ ...form, paybillNumber: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Physical Address</label>
                                    <textarea className="form-control" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>

                                <div className="flex-row mt-20">
                                    <button className="btn-primary" onClick={handleSave}>Save Settings</button>
                                    <button className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid-gap-15">
                                <div className="flex-row">
                                    {settings.logo && <img src={settings.logo} height="60" alt="Logo" />}
                                    {settings.schoolStamp && <img src={settings.schoolStamp} height="60" className="circular" alt="Stamp" />}
                                    <div style={{ marginLeft: 15 }}>
                                        <h2 className="m-0">{settings.schoolName}</h2>
                                        <em className="opacity-60 fs-13">{settings.motto}</em>
                                    </div>
                                </div>
                                <hr style={{ margin: '10px 0', borderColor: 'rgba(255,255,255,0.05)' }} />
                                <div className="grid-2">
                                    <div className="setting-row">
                                        <span className="setting-label">Academic Status</span>
                                        <span className="setting-value">{settings.currentTerm} / {settings.currentYear}</span>
                                    </div>
                                    <div className="setting-row">
                                        <span className="setting-label">Contact Details</span>
                                        <span className="setting-value">{settings.phone} / {settings.email}</span>
                                    </div>
                                    <div className="setting-row">
                                        <span className="setting-label">M-Pesa Paybill</span>
                                        <span className="setting-value">{settings.paybillNumber || 'Not Configured'}</span>
                                    </div>
                                    <div className="setting-row">
                                        <span className="setting-label">Location</span>
                                        <span className="setting-value">{settings.address}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="mt-24"><SchoolIcon className="nav-icon" /> Academic Structures & Branding</h3>
                <div className="card">
                    <div className="settings-form">
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Levels Enabled</label>
                                <div className="flex-row mt-8" style={{ flexWrap: 'wrap', gap: 15 }}>
                                    {[
                                        { key: 'earlyYearsEnabled', label: 'Early Years' },
                                        { key: 'primaryEnabled', label: 'Primary' },
                                        { key: 'jssEnabled', label: 'JSS' },
                                        { key: 'sssEnabled', label: 'SSS' }
                                    ].map(level => (
                                        <label key={level.key} className="flex-row pointer fs-13">
                                            <input type="checkbox" disabled={!editing} checked={(form as any)[level.key]} onChange={e => setForm({ ...form, [level.key]: e.target.checked })} />
                                            {level.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>SSS Naming Convention</label>
                                <select className="form-control" title="Select SSS Naming Convention" disabled={!editing} value={form.sssNaming || 'Form'} onChange={e => setForm({ ...form, sssNaming: e.target.value as any })}>
                                    <option value="Form">Form 1 - Form 4</option>
                                    <option value="Grade">Grade 9 - Grade 12</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-2 mt-20">
                            <div className="form-group">
                                <label>Administrative Titles</label>
                                <select className="form-control" title="Select Administrative Title" disabled={!editing} value={form.headOfSchoolTitle || 'Headteacher'} onChange={e => setForm({ ...form, headOfSchoolTitle: e.target.value as any })}>
                                    <option value="Headteacher">Headteacher</option>
                                    <option value="Principal">Principal</option>
                                    <option value="Chief Principal">Chief Principal</option>
                                </select>
                            </div>
                            <div className="form-group flex-end">
                                {editing && (
                                    <button className="btn-primary" onClick={handleSave}>
                                        <SaveIcon style={{ fontSize: 16 }} /> Save Structure
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid-2 mt-20">
                            <div className="form-group">
                                <label>{form.headOfSchoolTitle || 'Headteacher'} Signature</label>
                                <div className="flex-row mt-8">
                                    {(editing ? form.headteacherSignature : settings.headteacherSignature) && (
                                        <img src={editing ? form.headteacherSignature : settings.headteacherSignature} className="preview-img" alt="HT Signature" />
                                    )}
                                    {editing && (
                                        <label className="btn-outline-sm pointer">
                                            <CloudUploadIcon fontSize="small" /> Upload
                                            <input type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'headteacherSignature')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Finance Officer Signature</label>
                                <div className="flex-row mt-8">
                                    {(editing ? form.financeSignature : settings.financeSignature) && (
                                        <img src={editing ? form.financeSignature : settings.financeSignature} className="preview-img" alt="Finance Signature" />
                                    )}
                                    {editing && (
                                        <label className="btn-outline-sm pointer">
                                            <CloudUploadIcon fontSize="small" /> Upload
                                            <input type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'financeSignature')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-section">
                <h3><CloudUploadIcon className="nav-icon" /> Data & Maintenance</h3>
                <div className="card-grid">
                    <div className="card p-0" style={{ background: 'var(--bg-surface)' }}>
                        <div className="card-header"><h4 className="m-0">Student Registry</h4></div>
                        <div className="card-body">
                            <div className="flex-row gap-10">
                                <input type="file" id="up-students" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadStudents(e.target.files[0])} />
                                <button className="btn-primary flex-1" onClick={() => (document.getElementById('up-students') as any)?.click()}>Upload</button>
                                <button className="btn-outline flex-1" onClick={() => (downloadTemplate('students'))}>Template</button>
                            </div>
                        </div>
                    </div>
                    <div className="card p-0" style={{ background: 'var(--bg-surface)' }}>
                        <div className="card-header"><h4 className="m-0">Staff Registry</h4></div>
                        <div className="card-body">
                            <div className="flex-row gap-10">
                                <input type="file" id="up-teachers" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadTeachers(e.target.files[0])} />
                                <button className="btn-primary flex-1" onClick={() => (document.getElementById('up-teachers') as any)?.click()}>Upload</button>
                                <button className="btn-outline flex-1" onClick={() => (downloadTemplate('teachers'))}>Template</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="danger-zone mt-24">
                    <div className="flex-between">
                        <div>
                            <h3 className="danger-zone-title" style={{ margin: 0, color: 'var(--accent-blue)' }}>Dashboard Reset</h3>
                            <p className="fs-12 opacity-80" style={{ margin: '5px 0 0 0' }}>Reset all charts, finance totals, and activity metrics to zero. (Keeps Students & Staff)</p>
                        </div>
                        <button className="btn-outline" style={{ borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }} onClick={resetDashboardStats}>
                            RESET DASHBOARD
                        </button>
                    </div>
                </div>

                <div className="danger-zone mt-24">
                    <div className="flex-between">
                        <div>
                            <h3 className="danger-zone-title" style={{ margin: 0, color: '#ef4444' }}>Factory Reset</h3>
                            <p className="fs-12 opacity-80" style={{ margin: '5px 0 0 0' }}>This will permanently wipe all institutional data, results, and accounts.</p>
                        </div>
                        <button className="btn-primary" style={{ background: '#ef4444' }} onClick={clearAllData}>
                            PURGE ALL DATA
                        </button>
                    </div>
                </div>

                <div className="card mt-24" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed var(--accent-blue)' }}>
                    <div className="card-body flex-row">
                        <SecurityIcon style={{ color: 'var(--accent-blue)' }} />
                        <div>
                            <h4 className="m-0">Institutional Security</h4>
                            <p className="fs-12 opacity-80 m-0">System automatically logs all administrative changes for audit compliance.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
