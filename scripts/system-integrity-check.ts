// Using global fetch from Node 18+

const BASE_URL = 'http://localhost:3000/api';

async function testSuite() {
    console.log('🚀 INITIALIZING SYSTEM INTEGRITY CHECK...\n');
    let adminToken = '';
    let teacherToken = '';
    let testStudentId = '';
    let testTeacherId = '';
    const timestamp = Date.now();

    // 1. AUTHENTICATION TEST
    console.log('--- [1/7] AUTHENTICATION ---');
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin', password: 'admin123' })
        });
        const data: any = await res.json();
        if (res.ok && data.token) {
            adminToken = data.token;
            console.log('✅ Admin Login: SUCCESS');
        } else {
            console.error('❌ Admin Login: FAILED', data);
            process.exit(1);
        }
    } catch (e: any) {
        console.error('❌ Admin Login: ERROR', e.message);
        process.exit(1);
    }

    // 2. STUDENT CRUD TEST
    console.log('\n--- [2/7] STUDENT CRUD ---');
    try {
        // CREATE
        const createRes = await fetch(`${BASE_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({
                firstName: `Integrity_${timestamp}`,
                lastName: 'Test',
                admissionNumber: `TEST-${timestamp}`,
                gender: 'Female',
                grade: 'Grade 1',
                parentName: 'Integrity Parent',
                parentPhone: '0700000000',
                enrollmentDate: new Date().toISOString().split('T')[0],
                totalFees: 50000
            })
        });
        const student = await createRes.json() as any;
        if (createRes.status === 201 && student.id) {
            testStudentId = student.id;
            console.log(`✅ Create Student: SUCCESS (ID: ${student.id})`);
        } else {
            console.error(`❌ Create Student: FAILED (${createRes.status})`, student);
        }

        if (testStudentId) {
            // READ
            const readRes = await fetch(`${BASE_URL}/students`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const students = await readRes.json() as any[];
            if (readRes.ok && Array.isArray(students)) {
                console.log(`✅ Read Students: SUCCESS (${students.length} found)`);
            }

            // UPDATE
            const updateRes = await fetch(`${BASE_URL}/students/${testStudentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ firstName: `Integrity_${timestamp}_Updated` })
            });
            if (updateRes.ok) {
                console.log('✅ Update Student: SUCCESS');
            } else {
                console.error(`❌ Update Student: FAILED (${updateRes.status})`);
            }
        }
    } catch (e: any) {
        console.error('❌ Student CRUD: ERROR', e.message);
    }

    // 3. TEACHER CRUD TEST
    console.log('\n--- [3/7] TEACHER CRUD ---');
    try {
        const createRes = await fetch(`${BASE_URL}/teachers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({
                firstName: 'Teacher',
                lastName: `Integrity_${timestamp}`,
                email: `teacher.integrity.${timestamp}@example.com`,
                phone: '0711111111',
                joinDate: new Date().toISOString().split('T')[0]
            })
        });
        const teacher = await createRes.json() as any;
        if (createRes.ok) {
            testTeacherId = teacher.id;
            console.log('✅ Create Teacher: SUCCESS');
        } else {
            console.error(`❌ Create Teacher: FAILED (${createRes.status})`, teacher);
        }
    } catch (e: any) {
        console.error('❌ Teacher CRUD: ERROR', e.message);
    }

    // 4. FINANCE (PAYMENT) TEST
    console.log('\n--- [4/7] FINANCE & PAYMENTS ---');
    try {
        if (testStudentId) {
            const payRes = await fetch(`${BASE_URL}/fees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({
                    studentId: testStudentId,
                    amount: 5000,
                    method: 'M-Pesa',
                    date: new Date().toISOString().split('T')[0],
                    term: 'Term 1'
                })
            });
            if (payRes.ok) {
                console.log('✅ Record Payment: SUCCESS');
                // Verify balance update
                const studentRes = await fetch(`${BASE_URL}/students/${testStudentId}`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                const updatedStudent = await studentRes.json() as any;
                if (updatedStudent && updatedStudent.paidFees === 5000) {
                    console.log('✅ Balance Integrity Check: SUCCESS');
                } else {
                    console.error('❌ Balance Integrity Check: FAILED', updatedStudent);
                }
            } else {
                console.error(`❌ Record Payment: FAILED (${payRes.status})`, await payRes.text());
            }
        } else {
            console.log('⏩ Skipping Finance Test: No Student ID');
        }
    } catch (e: any) {
        console.error('❌ Finance Test: ERROR', e.message);
    }

    // 5. SECURITY & PERMISSIONS TEST
    console.log('\n--- [5/7] SECURITY & PERMISSIONS ---');
    try {
        // Unauthorized check (No token)
        const unRes = await fetch(`${BASE_URL}/students`);
        if (unRes.status === 401) {
            console.log('✅ Unauthorized Access Rejection: SUCCESS');
        } else {
            console.error('❌ Unauthorized Access Rejection: FAILED', unRes.status);
        }

        // Create a test user with limited roles (Teacher)
        const userRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({
                name: 'Limited Teacher',
                email: `limited.${timestamp}@example.com`,
                username: `limited_${timestamp}`,
                password: 'password123',
                role: 'Teacher'
            })
        });
        const limitedUser = await userRes.json() as any;

        if (limitedUser && limitedUser.username) {
            // Login as Limited Teacher
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: limitedUser.username, password: 'password123' })
            });
            const loginData = await loginRes.json() as any;
            teacherToken = loginData.token;

            if (teacherToken && testStudentId) {
                // Try to DELETE a student as Teacher (Should be Forbidden if we have permissions set up)
                const delRes = await fetch(`${BASE_URL}/students/${testStudentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${teacherToken}` }
                });
                if (delRes.status === 403) {
                    console.log('✅ Forbidden Action Rejection (Teacher cannot delete): SUCCESS');
                } else {
                    console.log(`ℹ️ Permission check resulted in ${delRes.status}. (403 expected if RBAC is strict)`);
                }
            }
        }
    } catch (e: any) {
        console.error('❌ Security Test: ERROR', e.message);
    }

    // 6. SETTINGS & SYSTEM CONFIG TEST
    console.log('\n--- [6/7] SYSTEM SETTINGS ---');
    try {
        const settRes = await fetch(`${BASE_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ schoolName: 'Elirama Integrated School - Test' })
        });
        if (settRes.ok) {
            console.log('✅ Update Settings: SUCCESS');
            const getSett = await fetch(`${BASE_URL}/settings`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const sett = await getSett.json() as any;
            if (sett.schoolName === 'Elirama Integrated School - Test') {
                console.log('✅ Settings Persistence: SUCCESS');
            } else {
                console.error('❌ Settings Persistence: FAILED');
            }
        } else {
            console.error(`❌ Update Settings: FAILED (${settRes.status})`);
        }
    } catch (e: any) {
        console.error('❌ Settings Test: ERROR', e.message);
    }

    // 7. CLEANUP
    console.log('\n--- [7/7] CLEANUP ---');
    try {
        if (testStudentId) {
            const delRes = await fetch(`${BASE_URL}/students/${testStudentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (delRes.ok) console.log('✅ Test Data Cleanup (Student): SUCCESS');
            else console.error(`❌ Test Data Cleanup (Student): FAILED (${delRes.status})`);
        }

        if (testTeacherId) {
            const delTeach = await fetch(`${BASE_URL}/teachers/${testTeacherId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (delTeach.ok) console.log('✅ Test Data Cleanup (Teacher): SUCCESS');
            else console.error(`❌ Test Data Cleanup (Teacher): FAILED (${delTeach.status})`);
        }
    } catch (e: any) {
        console.error('❌ Cleanup: ERROR', e.message);
    }

    console.log('\n🏁 SYSTEM INTEGRITY CHECK COMPLETE.');
}

testSuite();
