import { Link } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    LayoutGrid,
    Layers,
    Truck,
    Package,
    ShoppingCart,
    Users,
    Calculator,
    BarChart3,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import categories from '@/routes/categories';
import * as suppliers from '@/routes/suppliers';
import * as products from '@/routes/products';
import purchaseOrders from '@/routes/purchase-orders';

import { usePermissions } from '@/hooks/use-permissions';

export function AppSidebar() {
    const { can } = usePermissions();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
            // Everyone can view dashboard
        },
        ...(can('view analytics') ? [{
            title: 'Analytics Dashboard',
            href: '/analytics',
            icon: BarChart3,
        }] : []),
        ...(can('view categories') ? [{
            title: 'Categories',
            href: categories.index(),
            icon: Layers,
        }] : []),
        ...(can('view suppliers') ? [{
            title: 'Suppliers',
            href: suppliers.index().url,
            icon: Truck,
        }] : []),
        ...(can('view products') ? [{
            title: 'Products',
            href: products.index().url,
            icon: Package,
        }] : []),
        ...(can('view purchases') ? [{
            title: 'Purchase Orders',
            href: purchaseOrders.index().url,
            icon: ShoppingCart,
        }] : []),
        ...(can('view adjustments') ? [{
            title: 'Stock Adjustments',
            href: '/stock-adjustments',
            icon: Package,
        }] : []),
        ...(can('view ledgers') ? [{
            title: 'Inventory Ledgers',
            href: '/inventory-ledgers',
            icon: BookOpen,
        }] : []),
        ...(can('view pos') ? [{
            title: 'POS (Sell)',
            href: '/pos',
            icon: Calculator,
        }] : []),
        ...(can('view sales') ? [{
            title: 'Sales History',
            href: '/sales',
            icon: ShoppingCart,
        }] : []),
        ...(can('manage users') ? [{
            title: 'User Management',
            href: '/users',
            icon: Users,
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
