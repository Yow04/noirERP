import type { AuthUser, DemoAccount, LoginCredentials, AuthResponse } from '$lib/types/auth';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const DEMO_ACCOUNTS: DemoAccount[] = [
    {
        id: 'admin',
        label: 'Admin Master',
        email: 'admin@noirerp.dev',
        password: 'password123',
        role: 'Admin',
        name: 'Admin noirERP',
        description: 'Akses penuh seluruh modul, analitik & manajemen sistem'
    },
    {
        id: 'inventory',
        label: 'Staff Logistik',
        email: 'inventory@noirerp.dev',
        password: 'password123',
        role: 'Staff',
        name: 'Staff Gudang & Logistik',
        description: 'Kelola mutasi inventaris, produk & order pembelian'
    },
    {
        id: 'sales',
        label: 'Sales Officer',
        email: 'sales@noirerp.dev',
        password: 'password123',
        role: 'Staff',
        name: 'Sales Representative',
        description: 'Kelola pesanan pelanggan, invoice & laporan penjualan'
    }
];

class AuthState {
    user = $state<AuthUser | null>(null);
    token = $state<string | null>(null);
    loading = $state(false);
    initialized = $state(false);
    isDemo = $state(false);

    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        } else {
            this.initialized = true;
        }
    }

    private init() {
        try {
            const storedUser = localStorage.getItem('noirerp_auth_user');
            const storedToken = localStorage.getItem('noirerp_auth_token');
            const storedDemo = localStorage.getItem('noirerp_auth_demo');

            if (storedUser) {
                this.user = JSON.parse(storedUser);
                this.token = storedToken || null;
                this.isDemo = storedDemo === 'true';
            } else {
                this.user = null;
                this.token = null;
                this.isDemo = false;
            }
        } catch {
            this.user = null;
            this.token = null;
            this.isDemo = false;
        } finally {
            this.initialized = true;
        }
    }

    get isAuthenticated(): boolean {
        return !!this.user;
    }

    get userName(): string {
        return this.user?.name ?? 'Pengguna Tamu';
    }

    get userRole(): string {
        return this.user?.role ?? 'Staff';
    }

    get avatarInitials(): string {
        if (!this.user?.name) return 'NR';
        const parts = this.user.name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        this.loading = true;
        const normalizedEmail = credentials.email.trim().toLowerCase();

        // 1. Coba hubungi backend API (jika backend aktif)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const res = await fetch(`${PUBLIC_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: normalizedEmail,
                    password: credentials.password
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    const loggedUser = json.data.user;
                    const authToken = json.data.token;

                    this.user = loggedUser;
                    this.token = authToken;
                    this.isDemo = false;

                    if (typeof window !== 'undefined' && credentials.rememberMe !== false) {
                        localStorage.setItem('noirerp_auth_user', JSON.stringify(loggedUser));
                        localStorage.setItem('noirerp_auth_token', authToken);
                        localStorage.removeItem('noirerp_auth_demo');
                    }
                    this.loading = false;
                    return { success: true, token: authToken, user: loggedUser };
                }
            } else if (res.status === 401 || res.status === 400) {
                // Kredensial salah dari database server
                const errJson = await res.json().catch(() => null);
                this.loading = false;
                return {
                    success: false,
                    message: errJson?.message || 'Email atau kata sandi tidak sesuai dengan database.'
                };
            }
        } catch {
            // Backend offline atau timeout — lanjutkan ke fallback akun demo
        }

        // 2. Fallback Mode Akun Demo (untuk preview Vercel atau jika backend belum aktif)
        const matchedDemo = DEMO_ACCOUNTS.find(
            (acc) => acc.email.toLowerCase() === normalizedEmail
        );

        if (matchedDemo) {
            if (credentials.password !== matchedDemo.password && credentials.password !== 'admin123') {
                this.loading = false;
                return {
                    success: false,
                    message: 'Kata sandi akun demo tidak valid. Gunakan kata sandi: password123'
                };
            }

            const loggedUser: AuthUser = {
                id: matchedDemo.id,
                name: matchedDemo.name,
                email: matchedDemo.email,
                role: matchedDemo.role,
                avatarInitials: matchedDemo.name
                    .split(/\s+/)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase(),
                department:
                    matchedDemo.role === 'Admin' ? 'Executive Administration' : 'Operasional',
                lastLogin: new Date().toISOString()
            };

            const mockToken = `demo_token_${matchedDemo.id}_${Date.now()}`;
            this.user = loggedUser;
            this.token = mockToken;
            this.isDemo = true;

            if (typeof window !== 'undefined' && credentials.rememberMe !== false) {
                localStorage.setItem('noirerp_auth_user', JSON.stringify(loggedUser));
                localStorage.setItem('noirerp_auth_token', mockToken);
                localStorage.setItem('noirerp_auth_demo', 'true');
            }
            this.loading = false;
            return { success: true, isDemo: true, user: loggedUser, token: mockToken };
        }

        // Akun kustom offline preview
        if (normalizedEmail.includes('@') && credentials.password.length >= 6) {
            const derivedName = normalizedEmail.split('@')[0].replace(/[._]/g, ' ');
            const formattedName = derivedName
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(' ');

            const newUser: AuthUser = {
                id: 'custom-' + Date.now(),
                name: formattedName || 'Staff Pengguna',
                email: normalizedEmail,
                role: normalizedEmail.includes('admin') ? 'Admin' : 'Staff',
                avatarInitials: (formattedName[0] || 'U').toUpperCase(),
                department: 'Operasional',
                lastLogin: new Date().toISOString()
            };

            const mockToken = `custom_token_${Date.now()}`;
            this.user = newUser;
            this.token = mockToken;
            this.isDemo = true;

            if (typeof window !== 'undefined' && credentials.rememberMe !== false) {
                localStorage.setItem('noirerp_auth_user', JSON.stringify(newUser));
                localStorage.setItem('noirerp_auth_token', mockToken);
                localStorage.setItem('noirerp_auth_demo', 'true');
            }
            this.loading = false;
            return { success: true, isDemo: true, user: newUser, token: mockToken };
        }

        this.loading = false;
        return {
            success: false,
            message: 'Kombinasi email atau kata sandi tidak ditemukan. Masukkan kata sandi minimal 6 karakter.'
        };
    }

    loginAsGuest() {
        const guestUser: AuthUser = {
            id: 'guest',
            name: 'Pengguna Tamu',
            email: 'guest@noirerp.dev',
            role: 'Guest',
            avatarInitials: 'TM',
            department: 'Mode Preview',
            lastLogin: new Date().toISOString()
        };
        const guestToken = `guest_token_${Date.now()}`;
        this.user = guestUser;
        this.token = guestToken;
        this.isDemo = true;

        if (typeof window !== 'undefined') {
            localStorage.setItem('noirerp_auth_user', JSON.stringify(guestUser));
            localStorage.setItem('noirerp_auth_token', guestToken);
            localStorage.setItem('noirerp_auth_demo', 'true');
        }
    }

    logout() {
        this.user = null;
        this.token = null;
        this.isDemo = false;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('noirerp_auth_user');
            localStorage.removeItem('noirerp_auth_token');
            localStorage.removeItem('noirerp_auth_demo');
        }
    }
}

export const authState = new AuthState();

