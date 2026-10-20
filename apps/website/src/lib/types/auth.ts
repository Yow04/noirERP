export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Staff' | 'Guest' | string;
    avatarInitials: string;
    department?: string;
    lastLogin?: string;
};

export type LoginCredentials = {
    email: string;
    password: string;
    rememberMe?: boolean;
};

export type DemoAccount = {
    id: string;
    label: string;
    email: string;
    password: string;
    role: 'Admin' | 'Staff';
    name: string;
    description: string;
};

export type AuthResponse = {
    success: boolean;
    message?: string;
    isDemo?: boolean;
    token?: string;
    user?: AuthUser;
    data?: {
        token: string;
        user: AuthUser;
    };
};
