import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useSettings } from '@/hooks/use-settings';
import purchaseOrders from '@/routes/purchase-orders';

interface POItem {
    id: number;
    product_id: number;
    quantity_ordered: number;
    quantity_received: number;
    unit_cost: string;
    product: {
        name: string;
        sku: string;
    };
}

interface PurchaseOrder {
    id: number;
    po_number: string;
    status: string;
    total_cost: string;
    ordered_at: string;
    received_at: string | null;
    supplier: {
        name: string;
    };
    items: POItem[];
}

interface ShowProps {
    purchaseOrder: PurchaseOrder;
}

export default function PurchaseOrderShow({ purchaseOrder }: ShowProps) {
    const { app_currency_symbol } = useSettings();
    const canReceive =
        purchaseOrder.status === 'ordered' ||
        purchaseOrder.status === 'partially_received';
    const canCancel = ['pending', 'ordered', 'partially_received'].includes(
        purchaseOrder.status,
    );

    const { data, setData, post, processing } = useForm({
        items: purchaseOrder.items.map((item) => ({
            id: item.id,
            quantity_received: item.quantity_received.toString(),
        })),
    });

    const updateReceivedQty = (index: number, val: string) => {
        const newItems = [...data.items];
        newItems[index].quantity_received = val;
        setData('items', newItems);
    };

    const handleReceive = (e: React.FormEvent) => {
        e.preventDefault();
        post(purchaseOrders.receive(purchaseOrder.id).url);
    };

    const handleCancel = () => {
        if (
            confirm(
                'Are you sure you want to cancel this Purchase Order? Any received stock will be reversed.',
            )
        ) {
            router.post(purchaseOrders.cancel(purchaseOrder.id).url);
        }
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
            <Head title={`PO: ${purchaseOrder.po_number}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={purchaseOrders.index().url}>
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {purchaseOrder.po_number}
                                </h1>
                                {getStatusBadge(purchaseOrder.status)}
                            </div>
                            <p className="text-muted-foreground">
                                Supplier: {purchaseOrder.supplier.name}
                            </p>
                        </div>
                    </div>
                    {canCancel && (
                        <Button variant="destructive" onClick={handleCancel}>
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Cost
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {app_currency_symbol}
                                {parseFloat(purchaseOrder.total_cost).toFixed(
                                    2,
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Ordered Date
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {purchaseOrder.ordered_at
                                    ? format(
                                          new Date(purchaseOrder.ordered_at),
                                          'MMM dd, yyyy',
                                      )
                                    : 'N/A'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Received Date
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {purchaseOrder.received_at
                                    ? format(
                                          new Date(purchaseOrder.received_at),
                                          'MMM dd, yyyy',
                                      )
                                    : 'Pending'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {purchaseOrder.items.reduce(
                                    (sum, item) => sum + item.quantity_received,
                                    0,
                                )}{' '}
                                /{' '}
                                {purchaseOrder.items.reduce(
                                    (sum, item) => sum + item.quantity_ordered,
                                    0,
                                )}{' '}
                                Items
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <form onSubmit={handleReceive}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">
                                            Ordered
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Previously Received
                                        </TableHead>
                                        <TableHead className="text-center">
                                            New Total Received
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Unit Cost
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Subtotal
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchaseOrder.items.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {item.product.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.product.sku}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity_ordered}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity_received}
                                            </TableCell>
                                            <TableCell className="text-center align-middle">
                                                {canReceive ? (
                                                    <Input
                                                        type="number"
                                                        min={
                                                            item.quantity_received
                                                        }
                                                        max={
                                                            item.quantity_ordered
                                                        }
                                                        className="mx-auto w-24 text-center"
                                                        value={
                                                            data.items[index]
                                                                .quantity_received
                                                        }
                                                        onChange={(e) =>
                                                            updateReceivedQty(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    item.quantity_received
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {app_currency_symbol}
                                                {parseFloat(
                                                    item.unit_cost,
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {app_currency_symbol}
                                                {(
                                                    item.quantity_ordered *
                                                    parseFloat(item.unit_cost)
                                                ).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {canReceive && (
                                <div className="mt-6 flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        <CheckCircle className="mr-2 h-4 w-4" />{' '}
                                        Save Received Quantities
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}
