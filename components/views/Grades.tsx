import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES } from '../../types';
import GradeIcon from '@mui/icons-material/Grade';
import PeopleIcon from '@mui/icons-material/People';

export default function Grades() {
    const { students, activeGrades } = useSchool();

    const gradeData = activeGrades.map(grade => {
        const gradeStudents = students.filter(s => s.grade === grade);
        const male = gradeStudents.filter(s => s.gender === 'Male').length;
        const female = gradeStudents.filter(s => s.gender === 'Female').length;
        return { grade, total: gradeStudents.length, male, female };
    });

    const totalEnrolled = students.length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Grades</h1>
                    <p>Manage grade levels and class distribution</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-card-value">{GRADES.length}</div>
                    <div className="stat-card-label">Total Grades</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-value">{totalEnrolled}</div>
                    <div className="stat-card-label">Total Enrolled</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-value">{totalEnrolled > 0 ? Math.round(totalEnrolled / GRADES.length) : 0}</div>
                    <div className="stat-card-label">Avg per Grade</div>
                </div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead className="sticky-header">
                        <tr>
                            <th>Grade Level</th>
                            <th>Total Students</th>
                            <th>Male</th>
                            <th>Female</th>
                            <th>Capacity Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gradeData.map(g => (
                            <tr key={g.grade}>
                                <td style={{ fontWeight: 600 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <GradeIcon style={{ fontSize: 18, color: 'var(--accent-blue)' }} />
                                        {g.grade}
                                    </span>
                                </td>
                                <td>{g.total}</td>
                                <td>{g.male}</td>
                                <td>{g.female}</td>
                                <td>
                                    <span className={`badge ${g.total >= 40 ? 'red' : g.total >= 25 ? 'orange' : 'green'}`}>
                                        {g.total >= 40 ? 'Full' : g.total >= 25 ? 'Near Capacity' : 'Available'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
