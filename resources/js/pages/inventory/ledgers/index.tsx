import { Head } from '@inertiajs/react';
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
import { Search } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InventoryLedgerIndexProps {
    ledgers: {
        data: any[];
        links: any[];
    };
    filters: {
        search?: string;
        source_type?: string;
        start_date?: string;
        end_date?: string;
    };
}

const InventoryLedgerIndex = ({
    ledgers,
    filters,
}: InventoryLedgerIndexProps) => {
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/inventory-ledgers',
            { 
                search, 
                start_date: startDate, 
                end_date: endDate,
                source_type: filters.source_type
            },
            { preserveState: true },
        );
    };

    const getSourceTypeFriendly = (type: string) => {
        if (!type) return '-';
        if (type.includes('StockAdjustment')) return 'Stock Adjustment';
        if (type.includes('PurchaseOrder')) return 'Purchase Order';
        if (type.includes('Product')) return 'Product Edit';
        return type.split('\\').pop() || type;
    };

    return (
        <>
            <Head title="Inventory Ledgers" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Inventory Ledger
                    </h1>
                    <p className="text-muted-foreground">
                        Detailed history of all stock movements and changes.
                    </p>
                </div>

                <Card>
                    <CardHeader className="space-y-4 pb-4">
                        <CardTitle>Transactions</CardTitle>
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
                                value={filters.source_type || 'all'}
                                onValueChange={(value) => {
                                    filters.source_type =
                                        value === 'all' ? '' : value;
                                    handleSearch(
                                        new Event(
                                            'submit',
                                        ) as unknown as React.FormEvent,
                                    );
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <SelectValue placeholder="All Sources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Sources
                                    </SelectItem>
                                    <SelectItem value="StockAdjustment">
                                        Stock Adjustment
                                    </SelectItem>
                                    <SelectItem value="PurchaseOrder">
                                        Purchase Order
                                    </SelectItem>
                                    <SelectItem value="Product">
                                        Product Edit
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
                                    <TableHead>Source</TableHead>
                                    <TableHead className="text-right">
                                        Before
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Variance
                                    </TableHead>
                                    <TableHead className="text-right">
                                        After
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledgers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No ledger entries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ledgers.data.map((ledger) => (
                                        <TableRow key={ledger.id}>
                                            <TableCell>
                                                {format(
                                                    new Date(ledger.created_at),
                                                    'MMM dd, yyyy HH:mm',
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {ledger.product?.name}
                                                <div className="text-xs text-muted-foreground">
                                                    {ledger.product?.sku}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getSourceTypeFriendly(
                                                        ledger.source_type,
                                                    )}
                                                </Badge>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    ID: {ledger.source_id}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {ledger.quantity_before}
                                            </TableCell>
                                            <TableCell
                                                className={`text-right font-bold ${ledger.variance > 0 ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {ledger.variance > 0 ? '+' : ''}
                                                {ledger.variance}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {ledger.quantity_after}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default InventoryLedgerIndex;

InventoryLedgerIndex.layout = {
    breadcrumbs: [{ title: 'Inventory Ledger', href: '/inventory-ledger' }],
};
