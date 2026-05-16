import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';

interface StockAdjustmentIndexProps {
    adjustments: {
        data: any[];
        links: any[];
    };
    filters: {
        search?: string;
        type?: string;
        start_date?: string;
        end_date?: string;
    };
}

const StockAdjustmentIndex = ({
    adjustments,
    filters,
}: StockAdjustmentIndexProps) => {
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/stock-adjustments',
            {
                search,
                start_date: startDate,
                end_date: endDate,
                type: filters.type,
            },
            { preserveState: true },
        );
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'damage':
                return <Badge variant="destructive">Damage</Badge>;
            case 'theft':
                return <Badge variant="destructive">Theft</Badge>;
            case 'audit_loss':
                return <Badge variant="destructive">Audit Loss</Badge>;
            case 'audit_gain':
                return (
                    <Badge
                        variant="default"
                        className="bg-green-500 hover:bg-green-600"
                    >
                        Audit Gain
                    </Badge>
                );
            case 'promo_sample':
                return <Badge variant="secondary">Promo/Sample</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <>
            <Head title="Stock Adjustments" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Stock Adjustments"
                        description="Manage manual stock adjustments."
                    />
                    <Button asChild>
                        <Link href="/stock-adjustments/create">
                            <Plus className="mr-2 h-4 w-4" /> New Adjustment
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="space-y-4 pb-4">
                        <CardTitle>History</CardTitle>
                        <form
                            onSubmit={handleSearch}
                            className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                        >
                            <div className="relative w-full sm:w-auto sm:flex-1 lg:max-w-[300px]">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search product..."
                                    className="w-full pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select
                                value={filters.type || 'all'}
                                onValueChange={(value) => {
                                    filters.type = value === 'all' ? '' : value;
                                    handleSearch(
                                        new Event(
                                            'submit',
                                        ) as unknown as React.FormEvent,
                                    );
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Types
                                    </SelectItem>
                                    <SelectItem value="damage">
                                        Damage
                                    </SelectItem>
                                    <SelectItem value="theft">Theft</SelectItem>
                                    <SelectItem value="audit_loss">
                                        Audit Loss
                                    </SelectItem>
                                    <SelectItem value="audit_gain">
                                        Audit Gain
                                    </SelectItem>
                                    <SelectItem value="promo_sample">
                                        Promo/Sample
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                type="date"
                                className="w-full sm:w-auto"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="hidden text-muted-foreground sm:inline">
                                to
                            </span>
                            <Input
                                type="date"
                                className="w-full sm:w-auto"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <Button
                                type="submit"
                                variant="secondary"
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">
                                        Change
                                    </TableHead>
                                    <TableHead>Reason</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adjustments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No stock adjustments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    adjustments.data.map((adjustment) => (
                                        <TableRow key={adjustment.id}>
                                            <TableCell>
                                                {format(
                                                    new Date(
                                                        adjustment.created_at,
                                                    ),
                                                    'MMM dd, yyyy HH:mm',
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {adjustment.product?.name}
                                                <div className="text-xs text-muted-foreground">
                                                    {adjustment.product?.sku}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getTypeBadge(adjustment.type)}
                                            </TableCell>
                                            <TableCell>
                                                {adjustment.user?.name}
                                            </TableCell>
                                            <TableCell
                                                className={`text-right font-medium ${adjustment.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {adjustment.quantity_change > 0
                                                    ? '+'
                                                    : ''}
                                                {adjustment.quantity_change}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                                {adjustment.reason || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination here if needed, omitted for brevity, but normally you'd map links */}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default StockAdjustmentIndex;

StockAdjustmentIndex.layout = {
    breadcrumbs: [{ title: 'Stock Adjustments', href: '/stock-adjustments' }],
};
