import { Head, usePage } from '@inertiajs/react';
import {
    Package,
    AlertTriangle,
    Users,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    User as UserIcon,
    Calendar,
    Activity,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import StatCard from '@/components/stat-card';

interface DashboardProps {
    stats: any;
}

export default function Dashboard({ stats }: DashboardProps) {
    const { auth } = usePage().props as any;
    const { app_currency_symbol } = useSettings();
    const isAdmin =
        auth.roles.includes('admin') ||
        auth.roles.includes('inventory-manager');
    const isCashier = auth.roles.includes('cashier');

    return (
        <div className="flex flex-col gap-6 p-6">
            <Head title="Dashboard" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back, {auth.user.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Here's what's happening with your inventory and sales.
                    </p>
                </div>
                <div className="hidden items-center gap-2 rounded-lg border bg-card p-1 shadow-sm sm:flex">
                    <Badge variant="secondary" className="px-3 py-1 text-xs">
                        <Calendar className="mr-2 h-3 w-3" />
                        {format(new Date(), 'MMMM dd, yyyy')}
                    </Badge>
                </div>
            </div>

            {/* Admin/Manager Stats */}
            {isAdmin && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Sales Today"
                            value={`${app_currency_symbol}${Number(stats.sales_today).toFixed(2)}`}
                            icon={DollarSign}
                            description="From today's orders"
                            trend="up"
                            trendValue={`${stats.total_orders_today} orders`}
                            className="bg-linear-to-br from-card to-emerald-50/30 dark:to-emerald-950/20"
                        />
                        <StatCard
                            title="Sales This Month"
                            value={`${app_currency_symbol}${Number(stats.sales_this_month).toFixed(2)}`}
                            icon={TrendingUp}
                            description="Monthly revenue total"
                            className="bg-linear-to-br from-card to-blue-50/30 dark:to-blue-950/20"
                        />
                        <StatCard
                            title="Total Products"
                            value={stats.total_products}
                            icon={Package}
                            description="Items in catalog"
                            className="bg-linear-to-br from-card to-purple-50/30 dark:to-purple-950/20"
                        />
                        <StatCard
                            title="Low Stock Alert"
                            value={stats.low_stock_count}
                            icon={AlertTriangle}
                            description="Needs attention"
                            trend={stats.low_stock_count > 0 ? 'down' : 'up'}
                            trendValue={
                                stats.low_stock_count > 0 ? 'Urgent' : 'Good'
                            }
                            className={cn(
                                'bg-linear-to-br from-card',
                                stats.low_stock_count > 0
                                    ? 'to-rose-50/30 dark:to-rose-950/20'
                                    : 'to-emerald-50/30 dark:to-emerald-950/20',
                            )}
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="border-none shadow-md lg:col-span-4">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle>Sales Trend</CardTitle>
                                    <CardDescription>
                                        Revenue growth over the last 7 days.
                                    </CardDescription>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="h-[300px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.sales_history}>
                                        <defs>
                                            <linearGradient
                                                id="colorTotal"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-primary)"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-primary)"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 12,
                                                fill: 'hsl(var(--muted-foreground))',
                                            }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 12,
                                                fill: 'hsl(var(--muted-foreground))',
                                            }}
                                            tickFormatter={(value) =>
                                                `${app_currency_symbol}${value}`
                                            }
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor:
                                                    'hsl(var(--card))',
                                                borderColor:
                                                    'hsl(var(--border))',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                            itemStyle={{
                                                color: 'hsl(var(--primary))',
                                            }}
                                            formatter={(value: any) => [
                                                `${app_currency_symbol}${Number(value).toFixed(2)}`,
                                                'Revenue',
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Top Products</CardTitle>
                                <CardDescription>
                                    Most popular items by units sold.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {stats.top_products.map((item: any) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                                <Package className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="ml-4 min-w-0 flex-1 space-y-1">
                                                <p className="truncate text-sm leading-none font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.total_sold} units sold
                                                </p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-1 text-sm font-bold text-emerald-600">
                                                <TrendingUp className="h-4 w-4" />
                                                Popular
                                            </div>
                                        </div>
                                    ))}
                                    {stats.top_products.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40">
                                            <ShoppingBag className="mb-2 h-10 w-10" />
                                            <p className="text-sm">
                                                No sales data yet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest sales processed in the system.
                                </CardDescription>
                            </div>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Cashier</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.recent_sales.map((sale: any) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">
                                                {sale.order_number}
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                                    <UserIcon className="h-3 w-3" />
                                                </div>
                                                {sale.cashier?.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] tracking-wider uppercase"
                                                >
                                                    {sale.payment_method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {app_currency_symbol}
                                                {Number(
                                                    sale.grand_total,
                                                ).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {stats.recent_sales.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No recent sales.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Cashier Stats */}
            {isCashier && !isAdmin && (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="My Sales Today"
                            value={`${app_currency_symbol}${Number(stats.my_sales_today).toFixed(2)}`}
                            icon={DollarSign}
                            description="Personal total for today"
                            trend="up"
                            trendValue={`${stats.my_orders_today} orders`}
                            className="bg-linear-to-br from-card to-emerald-50/30 dark:to-emerald-950/20"
                        />
                        <StatCard
                            title="My Monthly Total"
                            value={`${app_currency_symbol}${Number(stats.my_sales_this_month).toFixed(2)}`}
                            icon={TrendingUp}
                            description="Total sales this month"
                            className="bg-linear-to-br from-card to-blue-50/30 dark:to-blue-950/20"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.my_orders_today}
                            icon={ShoppingBag}
                            description="Processed by me today"
                            className="bg-linear-to-br from-card to-purple-50/30 dark:to-purple-950/20"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle>My Performance</CardTitle>
                                    <CardDescription>
                                        Your daily sales trend.
                                    </CardDescription>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Activity className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="h-[250px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.my_sales_history}>
                                        <defs>
                                            <linearGradient
                                                id="colorMyTotal"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-primary)"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-primary)"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 10,
                                                fill: 'hsl(var(--muted-foreground))',
                                            }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 10,
                                                fill: 'hsl(var(--muted-foreground))',
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor:
                                                    'hsl(var(--card))',
                                                borderColor:
                                                    'hsl(var(--border))',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                            }}
                                            formatter={(value: any) => [
                                                `${app_currency_symbol}${Number(value).toFixed(2)}`,
                                                'Sales',
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorMyTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle>My Recent Sales</CardTitle>
                                <CardDescription>
                                    Your last processed transactions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead className="text-right">
                                                Total
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats.recent_my_sales.map(
                                            (sale: any) => (
                                                <TableRow key={sale.id}>
                                                    <TableCell className="text-xs font-medium">
                                                        {sale.order_number}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {format(
                                                            new Date(
                                                                sale.created_at,
                                                            ),
                                                            'hh:mm a',
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs font-bold text-primary">
                                                        {app_currency_symbol}
                                                        {Number(
                                                            sale.grand_total,
                                                        ).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                        {stats.recent_my_sales.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    No sales yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

Dashboard.layout = (page: any) => <AppLayout children={page} />;
