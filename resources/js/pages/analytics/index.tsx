import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Download,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    CreditCard,
    ShoppingBag
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

interface AnalyticsProps {
    analytics: {
        date_range: {
            from: string;
            to: string;
            formatted: string;
        };
        sales: {
            daily: number;
            monthly: number;
            yearly: number;
        };
        stock_status: {
            out_of_stock: number;
            low_stock: number;
            available: number;
        };
        movements: {
            total: number;
            positive: number;
            negative: number;
        };
        most_sold: Array<{
            name: string;
            sku: string;
            total_qty: number;
            total_revenue: number;
        }>;
        financials: {
            revenue: number;
            cogs: number;
            profit: number;
        };
        recent_transactions: Array<{
            id: number;
            order_number: string;
            cashier_name: string;
            grand_total: number;
            payment_method: string;
            created_at: string;
        }>;
    };
    filters: {
        from_date: string | null;
        to_date: string | null;
    };
}

export default function Analytics({ analytics, filters }: AnalyticsProps) {
    const { app_currency_symbol } = useSettings();

    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleApplyFilters = () => {
        setIsLoading(true);
        router.get(
            '/analytics',
            { from_date: fromDate, to_date: toDate },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

    const handleClearFilters = () => {
        setFromDate('');
        setToDate('');
        setIsLoading(true);
        router.get(
            '/analytics',
            {},
            {
                preserveState: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

    // Helper for standalone reports download
    const handleDownloadReport = (type: 'adjustments' | 'ledger' | 'sales') => {
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append('from_date', fromDate);
        if (toDate) queryParams.append('to_date', toDate);

        let url = '';
        if (type === 'adjustments') url = `/reports/stock-adjustments?${queryParams.toString()}`;
        if (type === 'ledger') url = `/reports/inventory-ledger?${queryParams.toString()}`;
        if (type === 'sales') url = `/reports/sales-history?${queryParams.toString()}`;

        window.open(url, '_blank');
    };

    // Export current filtered view
    const handleExportAnalyticsPdf = () => {
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append('from_date', fromDate);
        if (toDate) queryParams.append('to_date', toDate);

        window.open(`/analytics/export?${queryParams.toString()}`, '_blank');
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <Head title="System Analytics" />

            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">System Performance & Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        Overall catalog statistics, stock movement ratios, and sales margins.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleExportAnalyticsPdf}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export Current View
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <Card className="border-none shadow-md bg-linear-to-br from-card to-muted/20">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="grid flex-1 gap-2 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Date From</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Date To</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleApplyFilters}
                                disabled={isLoading}
                                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                            >
                                {isLoading ? 'Applying...' : 'Apply Filters'}
                            </button>
                            {(fromDate || toDate) && (
                                <button
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-xs font-semibold shadow-xs hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Showing data for: <strong>{analytics.date_range.formatted}</strong></span>
                    </div>
                </CardContent>
            </Card>

            {/* Financial Overview (Revenue, COGS, Profit) */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md bg-linear-to-br from-card to-blue-50/20 dark:to-blue-950/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {app_currency_symbol}{Number(analytics.financials.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Total invoice value</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-linear-to-br from-card to-rose-50/20 dark:to-rose-950/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cost of Goods Sold (COGS)</CardTitle>
                        <div className="rounded-full bg-rose-500/10 p-2 text-rose-500">
                            <TrendingDown className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                            {app_currency_symbol}{Number(analytics.financials.cogs).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Calculated product cost basis</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-linear-to-br from-card to-emerald-50/20 dark:to-emerald-950/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Margin / Profit</CardTitle>
                        <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {app_currency_symbol}{Number(analytics.financials.profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Gross earnings after cost deductions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Milestones & Standalone Reports Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sales Milestones */}
                <Card className="border-none shadow-md lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Sales Milestones Overview</CardTitle>
                        <CardDescription>Consolidated sales metrics across different timespans.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1 rounded-lg border p-4 bg-muted/10">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Today's Sales</span>
                            <span className="text-xl font-bold">{app_currency_symbol}{Number(analytics.sales.daily).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col gap-1 rounded-lg border p-4 bg-muted/10">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">This Month</span>
                            <span className="text-xl font-bold">{app_currency_symbol}{Number(analytics.sales.monthly).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col gap-1 rounded-lg border p-4 bg-muted/10">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">This Year</span>
                            <span className="text-xl font-bold">{app_currency_symbol}{Number(analytics.sales.yearly).toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Print Center Downloads */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Download Standalone Reports</CardTitle>
                        <CardDescription>Generate customized PDF records with current dates.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <button
                            onClick={() => handleDownloadReport('adjustments')}
                            className="inline-flex w-full items-center justify-between rounded-lg border p-3 text-xs font-semibold hover:bg-muted/30 transition-all cursor-pointer text-left"
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-orange-500" />
                                Stock Adjustment Report
                            </span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>

                        <button
                            onClick={() => handleDownloadReport('ledger')}
                            className="inline-flex w-full items-center justify-between rounded-lg border p-3 text-xs font-semibold hover:bg-muted/30 transition-all cursor-pointer text-left"
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                Inventory Ledger Report
                            </span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>

                        <button
                            onClick={() => handleDownloadReport('sales')}
                            className="inline-flex w-full items-center justify-between rounded-lg border p-3 text-xs font-semibold hover:bg-muted/30 transition-all cursor-pointer text-left"
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-500" />
                                Sales History Report
                            </span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </CardContent>
                </Card>
            </div>

            {/* Stock status & movement overview */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Stock Level breakdown */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Catalog Stock Status</CardTitle>
                        <CardDescription>Live health breakdown of all catalog SKUs.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 p-4 text-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Available</span>
                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{analytics.stock_status.available}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center rounded-lg border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 p-4 text-center">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Low Stock</span>
                            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{analytics.stock_status.low_stock}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center rounded-lg border border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10 p-4 text-center">
                            <Package className="h-5 w-5 text-rose-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Out of Stock</span>
                            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{analytics.stock_status.out_of_stock}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Stock movement ratio */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Stock Movement Ratio</CardTitle>
                        <CardDescription>Stock modifications within the current date range.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
                            <Activity className="h-5 w-5 text-indigo-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Changes</span>
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{analytics.movements.total}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center rounded-lg border border-emerald-500/10 p-4 text-center">
                            <ArrowUpRight className="h-5 w-5 text-emerald-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Additions</span>
                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{analytics.movements.positive}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center rounded-lg border border-rose-500/10 p-4 text-center">
                            <ArrowDownRight className="h-5 w-5 text-rose-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Subtractions</span>
                            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{analytics.movements.negative}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grid for tables */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Most Sold Products */}
                <Card className="border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-base font-semibold">Top 5 Best Selling Items</CardTitle>
                            <CardDescription>Calculated by overall transaction quantities.</CardDescription>
                        </div>
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Qty Sold</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analytics.most_sold.map((product, idx) => (
                                    <TableRow key={product.sku}>
                                        <TableCell className="font-bold">#{idx + 1}</TableCell>
                                        <TableCell>
                                            <span className="block font-medium truncate max-w-[180px]">{product.name}</span>
                                            <span className="block text-[10px] text-muted-foreground">SKU: {product.sku}</span>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{product.total_qty}</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                                            {app_currency_symbol}{Number(product.total_revenue).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {analytics.most_sold.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No sales found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                            <CardDescription>Processed during current timespan.</CardDescription>
                        </div>
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Cashier</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analytics.recent_transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-bold">{tx.order_number}</TableCell>
                                        <TableCell className="text-xs truncate max-w-[120px]">{tx.cashier_name}</TableCell>
                                        <TableCell className="text-right font-bold">
                                            {app_currency_symbol}{Number(tx.grand_total).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
                                                {tx.payment_method}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {analytics.recent_transactions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Analytics.layout = (page: any) => <AppLayout children={page} />;
