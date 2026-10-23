import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { authState } from '$lib/state/auth.svelte';

export interface ApiFetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined | null>;
    skipAuth?: boolean;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export async function apiFetch<T = any>(
    endpoint: string,
    options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
    const { params, skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

    // Resolusi URL endpoint
    let url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
        ? endpoint
        : `${PUBLIC_API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    // Tambahkan query parameters jika ada
    if (params) {
        const searchParams = new URLSearchParams();
        for (const [key, val] of Object.entries(params)) {
            if (val !== undefined && val !== null) {
                searchParams.append(key, String(val));
            }
        }
        const queryString = searchParams.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
    }

    const headers = new Headers(customHeaders || {});

    // Injeksi Bearer Token jika pengguna sudah terautentikasi
    if (!skipAuth && authState.token) {
        headers.set('Authorization', `Bearer ${authState.token}`);
    }

    // Default Content-Type JSON jika mengirim body
    if (fetchOptions.body && !(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers
        });

        // Tangani 401 Unauthorized secara global (hanya jika bukan mode demo offline)
        if (response.status === 401 && !skipAuth) {
            if (!authState.isDemo) {
                authState.logout();
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
                    window.location.href = `/login?from=${currentPath}`;
                }
            }
            return {
                success: false,
                message: 'Sesi Anda telah kedaluwarsa atau tidak memiliki akses. Silakan masuk kembali.'
            };
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            return {
                success: false,
                message: data?.message || `Permintaan gagal (${response.status})`,
                error: data?.error
            };
        }

        return data as ApiResponse<T>;
    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : 'Gagal menghubungi server.',
            error: String(err)
        };
    }
}

export async function fetchWithFallback<T>(
    endpoint: string,
    fallbackData: T,
    options?: ApiFetchOptions
): Promise<{ data: T; isDemo: boolean; error?: string }> {
    try {
        const res = await apiFetch<T>(endpoint, options);
        if (res.success && res.data !== undefined && res.data !== null) {
            return { data: res.data, isDemo: false };
        }
        return { data: fallbackData, isDemo: true, error: res.message };
    } catch {
        return { data: fallbackData, isDemo: true };
    }
}

// Shorthand methods
apiFetch.get = <T = any>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' });

apiFetch.post = <T = any>(endpoint: string, body?: any, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
        ...options,
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
    });

apiFetch.patch = <T = any>(endpoint: string, body?: any, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: body instanceof FormData ? body : JSON.stringify(body)
    });

apiFetch.delete = <T = any>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
