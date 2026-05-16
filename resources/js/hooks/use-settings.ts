import { usePage } from '@inertiajs/react';
import type { AppSettings } from '@/types/global';

export function useSettings(): AppSettings {
    const { settings } = usePage<{ settings: AppSettings }>().props;

    return {
        app_name: settings?.app_name ?? 'My Company',
        app_logo_url: settings?.app_logo_url ?? null,
        app_currency_symbol: settings?.app_currency_symbol ?? '$',
        app_currency: settings?.app_currency ?? 'USD',
        app_address: settings?.app_address ?? null,
        app_city: settings?.app_city ?? null,
        app_state: settings?.app_state ?? null,
        app_country: settings?.app_country ?? null,
        app_phone: settings?.app_phone ?? null,
        app_email: settings?.app_email ?? null,
    };
}
