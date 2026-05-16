import type { Auth } from '@/types/auth';

export interface AppSettings {
    app_name: string;
    app_logo_url: string | null;
    app_currency_symbol: string;
    app_currency: string;
    app_address: string | null;
    app_city: string | null;
    app_state: string | null;
    app_country: string | null;
    app_phone: string | null;
    app_email: string | null;
}

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            settings: AppSettings;
            [key: string]: unknown;
        };
    }
}
