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
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useSettings } from '@/hooks/use-settings';
import { format } from 'date-fns';
import * as purchaseOrder from '@/routes/purchase-orders';

interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier: {
        id: number;
        name: string;
    };
    status: string;
    total_cost: string;
    ordered_at: string;
    received_at: string | null;
}

interface IndexProps {
    purchaseOrders: {
        data: PurchaseOrder[];
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function PurchaseOrderIndex({
    purchaseOrders,
    filters,
}: IndexProps) {
    const { app_currency_symbol } = useSettings();
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            purchaseOrder.index().url,
            { search },
            { preserveState: true },
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'ordered':
                return (
                    <Badge
                        variant="default"
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        Ordered
                    </Badge>
                );
            case 'partially_received':
                return (
                    <Badge
                        variant="default"
                        className="bg-yellow-500 hover:bg-yellow-600"
                    >
                        Partially Received
                    </Badge>
                );
            case 'received':
                return (
                    <Badge
                        variant="default"
                        className="bg-green-500 hover:bg-green-600"
                    >
                        Received
                    </Badge>
                );
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Purchase Orders" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Purchase Orders
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your purchase orders and incoming inventory.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={purchaseOrder.create().url}>
                            <Plus className="mr-2 h-4 w-4" /> Create PO
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle>All Purchase Orders</CardTitle>
                            <form
                                onSubmit={handleSearch}
                                className="flex max-w-sm items-center space-x-2"
                            >
                                <div className="relative w-full">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search POs..."
                                        className="w-full pl-8"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    size="sm"
                                >
                                    Search
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date Ordered</TableHead>
                                    <TableHead className="text-right">
                                        Total Cost
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseOrders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No purchase orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    purchaseOrders.data.map((po) => (
                                        <TableRow key={po.id}>
                                            <TableCell className="font-medium">
                                                {po.po_number}
                                            </TableCell>
                                            <TableCell>
                                                {po.supplier?.name}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(po.status)}
                                            </TableCell>
                                            <TableCell>
                                                {format(
                                                    new Date(po.ordered_at),
                                                    'MMM dd, yyyy',
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {app_currency_symbol}
                                                {parseFloat(
                                                    po.total_cost,
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={
                                                            purchaseOrder.show(
                                                                po.id,
                                                            ).url
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            View
                                                        </span>
                                                    </Link>
                                                </Button>
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
}
