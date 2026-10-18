import type { AuthUser, DemoAccount, LoginCredentials } from '$lib/types/auth';

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
    loading = $state(false);

    constructor() {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('noirerp_auth_user');
                if (stored) {
                    this.user = JSON.parse(stored);
                } else {
                    // Default default demo user untuk akses langsung
                    const defaultAcc = DEMO_ACCOUNTS[0];
                    this.user = {
                        id: defaultAcc.id,
                        name: defaultAcc.name,
                        email: defaultAcc.email,
                        role: defaultAcc.role,
                        avatarInitials: 'AD',
                        department: 'Executive Administration',
                        lastLogin: new Date().toISOString()
                    };
                }
            } catch {
                this.user = null;
            }
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

    async login(credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> {
        this.loading = true;
        const normalizedEmail = credentials.email.trim().toLowerCase();

        // Artificial subtle delay to simulate secure authentication handshake
        await new Promise((resolve) => setTimeout(resolve, 600));

        try {
            // Cek apakah email cocok dengan salah satu akun demo
            const matchedDemo = DEMO_ACCOUNTS.find(
                (acc) => acc.email.toLowerCase() === normalizedEmail
            );

            if (matchedDemo) {
                if (credentials.password !== matchedDemo.password && credentials.password !== 'admin123') {
                    this.loading = false;
                    return {
                        success: false,
                        message: 'Kata sandi tidak valid. Gunakan kata sandi demo: password123'
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

                this.user = loggedUser;
                if (typeof window !== 'undefined' && credentials.rememberMe !== false) {
                    localStorage.setItem('noirerp_auth_user', JSON.stringify(loggedUser));
                }
                this.loading = false;
                return { success: true };
            }

            // Jika bukan demo account tapi email dan password valid (min 6 karakter)
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

                this.user = newUser;
                if (typeof window !== 'undefined' && credentials.rememberMe !== false) {
                    localStorage.setItem('noirerp_auth_user', JSON.stringify(newUser));
                }
                this.loading = false;
                return { success: true };
            }

            this.loading = false;
            return {
                success: false,
                message: 'Kombinasi email atau kata sandi tidak ditemukan. Masukkan kata sandi minimal 6 karakter.'
            };
        } catch (err) {
            this.loading = false;
            return {
                success: false,
                message: err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat autentikasi.'
            };
        }
    }

    logout() {
        this.user = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('noirerp_auth_user');
        }
    }
}

export const authState = new AuthState();
