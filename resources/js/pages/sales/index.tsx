import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import * as salesRoute from '@/routes/sales';
import { Order } from '@/types/data';
import { InvoiceReceiptModal } from '@/components/invoice-receipt-modal';

interface IndexProps {
    orders: {
        data: Order[];
    };
}

const SalesIndex = ({ orders }: IndexProps) => {
    const { app_currency_symbol } = useSettings();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
            <Head title="Sales History" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title="Sales History"
                    description="View and manage all sale transactions"
                />
                <Button asChild>
                    <Link href={salesRoute.pos().url}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Sale (POS)
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Cashier</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.data.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    {order.order_number}
                                </TableCell>
                                <TableCell>
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{order.cashier?.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="uppercase">
                                        {order.payment_method}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {app_currency_symbol} {Number(order.grand_total).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="default"
                                        className="bg-green-500 hover:bg-green-600 uppercase"
                                    >
                                        {order.order_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedOrder(order)}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.data.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-24 text-center"
                                >
                                    No sales found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Receipt invoice details overlay modal */}
            <InvoiceReceiptModal
                isOpen={selectedOrder !== null}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
        </div>
    );
};

SalesIndex.layout = (page: any) => <AppLayout children={page} />;

export default SalesIndex;
