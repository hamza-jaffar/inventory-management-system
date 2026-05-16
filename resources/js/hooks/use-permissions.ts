import { usePage } from '@inertiajs/react';
import { User } from '@/types';

type AuthProps = {
    user: User;
    permissions: string[];
    roles: string[];
};

export function usePermissions() {
    const { auth } = usePage<{ auth: AuthProps }>().props;
    const permissions = auth.permissions || [];
    const roles = auth.roles || [];

    const can = (permission: string) => {
        // Admin gets access to everything
        if (roles.includes('admin')) return true;
        return permissions.includes(permission);
    };

    const hasRole = (role: string) => {
        return roles.includes(role);
    };

    const is = (role: string) => hasRole(role);

    return { can, hasRole, is, permissions, roles };
}
