const BASE_URL = 'http://localhost:3000/api';

async function test() {
    console.log('Testing APIs...');

    // Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.error('Login Failed:', loginData);
        return;
    }
    const token = loginData.token;
    console.log('Login Successful');

    // Test Approvals API
    console.log('\nTesting Approvals API...');
    const appRes = await fetch(`${BASE_URL}/approvals?status=PENDING`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const appData = await appRes.json();
    if (appRes.ok) {
        console.log('✅ Approvals API: SUCCESS', Array.isArray(appData) ? `${appData.length} pending` : 'Object returned');
    } else {
        console.error('❌ Approvals API: FAILED', appRes.status, appData);
    }

    // Test Students API (POST)
    console.log('\nTesting Students API (POST)...');
    const studentRes = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            firstName: 'API',
            lastName: 'Test',
            gender: 'Male',
            grade: 'Grade 1',
            parentName: 'API Parent',
            parentPhone: '0700000000',
            enrollmentDate: new Date().toISOString().split('T')[0],
            totalFees: 15000
        })
    });
    const studentData = await studentRes.json();
    if (studentRes.status === 201) {
        console.log('✅ Students POST: SUCCESS', studentData.id);
    } else if (studentRes.status === 409) {
        console.log('ℹ️ Students POST: Conflict (Already exists - OK for test)');
    } else {
        console.error('❌ Students POST: FAILED', studentRes.status, studentData);
    }

    // Test Students API (GET)
    console.log('\nTesting Students API (GET)...');
    const getRes = await fetch(`${BASE_URL}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const getData = await getRes.json();
    if (getRes.ok) {
        console.log('✅ Students GET: SUCCESS', getData.length, 'students');
    } else {
        console.error('❌ Students GET: FAILED', getRes.status, getData);
    }
}

test();
