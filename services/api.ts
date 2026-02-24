// API service layer — connects frontend to the Next.js backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function getToken(): string | null {
    return localStorage.getItem('elirama_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

// ===== AUTH =====
export const authApi = {
    login: (email: string, password: string) =>
        request<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
};

// ===== STUDENTS =====
export const studentsApi = {
    getAll: (params?: { grade?: string; search?: string }) => {
        const q = new URLSearchParams(params as any).toString();
        return request<any[]>(`/students${q ? `?${q}` : ''}`);
    },
    create: (data: any) => request<any>('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/students/${id}`, { method: 'DELETE' }),
};

// ===== TEACHERS =====
export const teachersApi = {
    getAll: (params?: { search?: string }) => {
        const q = new URLSearchParams(params as any).toString();
        return request<any[]>(`/teachers${q ? `?${q}` : ''}`);
    },
    create: (data: any) => request<any>('/teachers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/teachers/${id}`, { method: 'DELETE' }),
};

// ===== ATTENDANCE =====
export const attendanceApi = {
    getAll: (params?: { date?: string; grade?: string }) => {
        const q = new URLSearchParams(params as any).toString();
        return request<any[]>(`/attendance${q ? `?${q}` : ''}`);
    },
    save: (records: any[]) =>
        request<any>('/attendance', { method: 'POST', body: JSON.stringify({ records }) }),
};

// ===== EXAMS =====
export const examsApi = {
    getAll: (params?: { grade?: string; term?: string }) => {
        const q = new URLSearchParams(params as any).toString();
        return request<any[]>(`/exams${q ? `?${q}` : ''}`);
    },
    create: (data: any) => request<any>('/exams', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/exams/${id}`, { method: 'DELETE' }),
};

// ===== FEES / PAYMENTS =====
export const feesApi = {
    getAll: () => request<any[]>('/fees'),
    recordPayment: (data: any) => request<any>('/fees', { method: 'POST', body: JSON.stringify(data) }),
};

// ===== TIMETABLE =====
export const timetableApi = {
    getAll: (params?: { grade?: string }) => {
        const q = new URLSearchParams(params as any).toString();
        return request<any[]>(`/timetable${q ? `?${q}` : ''}`);
    },
    create: (data: any) => request<any>('/timetable', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/timetable/${id}`, { method: 'DELETE' }),
};

// ===== SETTINGS =====
export const settingsApi = {
    get: () => request<any>('/settings'),
    update: (data: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
