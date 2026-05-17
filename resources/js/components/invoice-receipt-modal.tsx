import React, { useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { Printer, Download, ShoppingBag, Calendar, User, CreditCard } from 'lucide-react';
import { Order } from '@/types/data';

interface InvoiceReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export function InvoiceReceiptModal({ isOpen, onClose, order }: InvoiceReceiptModalProps) {
    const {
        app_name,
        app_currency_symbol,
        app_address,
        app_city,
        app_phone,
        app_email
    } = useSettings();

    const printAreaRef = useRef<HTMLDivElement>(null);

    if (!order) return null;

    const handlePrint = () => {
        // High quality POS print block using temporary iframe or window.print with @media print
        const printContent = printAreaRef.current?.innerHTML;
        if (!printContent) return;

        const originalContent = document.body.innerHTML;
        
        // Let's create a beautiful print style block
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Receipt #${order.order_number}</title>
                        <style>
                            body {
                                font-family: 'Courier New', Courier, monospace;
                                font-size: 12px;
                                color: #000;
                                padding: 20px;
                                max-width: 300px;
                                margin: 0 auto;
                            }
                            .text-center { text-align: center; }
                            .text-right { text-align: right; }
                            .bold { font-weight: bold; }
                            .divider { border-top: 1px dashed #000; margin: 10px 0; }
                            .header { margin-bottom: 15px; }
                            .header h2 { margin: 0 0 5px 0; font-size: 16px; text-transform: uppercase; }
                            .header p { margin: 2px 0; font-size: 11px; }
                            .meta-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                            .meta-table td, .items-table td { padding: 3px 0; }
                            .items-header { font-weight: bold; border-bottom: 1px dashed #000; }
                            .totals-section { margin-top: 10px; }
                            .totals-table { width: 100%; }
                            .totals-table td { padding: 2px 0; }
                            .footer { margin-top: 20px; font-size: 10px; text-align: center; }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(function() { window.close(); }, 500);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleDownload = () => {
        window.open(`/sales/${order.id}/download`, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Invoice Receipt
                    </DialogTitle>
                </DialogHeader>

                {/* Visible Modal Receipt View */}
                <div className="my-2 space-y-4">
                    {/* Invoice Layout */}
                    <div className="rounded-xl border p-4 bg-linear-to-b from-card to-muted/20 shadow-inner">
                        <div className="text-center space-y-1 pb-3 border-b border-dashed">
                            <h3 className="text-base font-bold tracking-tight uppercase">{app_name}</h3>
                            <p className="text-xs text-muted-foreground">{app_address} {app_city}</p>
                            {app_phone && <p className="text-[10px] text-muted-foreground">Tel: {app_phone}</p>}
                        </div>

                        {/* Metadata block */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-3 border-b border-dashed">
                            <div className="space-y-1">
                                <p className="text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    <span>Date: {new Date(order.created_at).toLocaleString()}</span>
                                </p>
                                <p className="text-muted-foreground flex items-center gap-1.5">
                                    <User className="h-3 w-3" />
                                    <span>Cashier: {order.cashier?.name}</span>
                                </p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="font-bold text-primary">#{order.order_number}</p>
                                <p className="text-muted-foreground flex items-center gap-1 justify-end">
                                    <CreditCard className="h-3 w-3" />
                                    <span className="uppercase">{order.payment_method}</span>
                                </p>
                            </div>
                        </div>

                        {/* Items list */}
                        <div className="py-3 border-b border-dashed space-y-2">
                            <div className="grid grid-cols-12 text-xs font-bold text-muted-foreground border-b pb-1">
                                <span className="col-span-6">Item</span>
                                <span className="col-span-2 text-center">Qty</span>
                                <span className="col-span-4 text-right">Price</span>
                            </div>

                            {order.items?.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 text-xs items-center py-1">
                                    <div className="col-span-6 min-w-0">
                                        <p className="font-medium truncate">{item.product?.name}</p>
                                        <span className="text-[10px] text-muted-foreground">SKU: {item.product?.sku}</span>
                                    </div>
                                    <span className="col-span-2 text-center font-semibold">{item.quantity}</span>
                                    <span className="col-span-4 text-right font-bold">
                                        {app_currency_symbol}{Number(item.total_price || (item.unit_price * item.quantity)).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals Summary */}
                        <div className="pt-3 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-semibold">{app_currency_symbol}{Number(order.sub_total).toFixed(2)}</span>
                            </div>
                            {Number(order.discount) > 0 && (
                                <div className="flex justify-between text-rose-500 font-semibold">
                                    <span>Discount:</span>
                                    <span>-{app_currency_symbol}{Number(order.discount).toFixed(2)}</span>
                                </div>
                            )}
                            {Number(order.tax) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax ({order.tax}%):</span>
                                    <span>{app_currency_symbol}{Number((order.sub_total - order.discount) * order.tax / 100).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold border-t pt-1.5">
                                <span>Grand Total:</span>
                                <span className="text-primary">{app_currency_symbol}{Number(order.grand_total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Paid Amount:</span>
                                <span>{app_currency_symbol}{Number(order.paid_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Change:</span>
                                <span>{app_currency_symbol}{Number(order.change_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-[10px] text-muted-foreground text-center mt-4 pt-3 border-t border-dashed">
                            Thank you for shopping with us!
                        </p>
                    </div>
                </div>

                {/* Print Template Holder (Hidden on main page display, styled strictly for POS printers) */}
                <div style={{ display: 'none' }}>
                    <div ref={printAreaRef}>
                        <div className="text-center header">
                            <h2>{app_name}</h2>
                            <p>{app_address}</p>
                            <p>{app_city}</p>
                            {app_phone && <p>Tel: {app_phone}</p>}
                        </div>

                        <div className="divider"></div>

                        <table className="meta-table">
                            <tr>
                                <td>Invoice: <strong>#{order.order_number}</strong></td>
                                <td className="text-right">Date: {new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td>Cashier: {order.cashier?.name}</td>
                                <td className="text-right">Pay: {order.payment_method.toUpperCase()}</td>
                            </tr>
                        </table>

                        <div className="divider"></div>

                        <table className="items-table">
                            <thead>
                                <tr className="items-header">
                                    <td>Description</td>
                                    <td className="text-center" style={{ width: '40px' }}>Qty</td>
                                    <td className="text-right" style={{ width: '70px' }}>Price</td>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            {item.product?.name}<br />
                                            <small>SKU: {item.product?.sku}</small>
                                        </td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-right">
                                            {app_currency_symbol}{Number(item.total_price || (item.unit_price * item.quantity)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="divider"></div>

                        <div className="totals-section">
                            <table className="totals-table">
                                <tr>
                                    <td>Subtotal:</td>
                                    <td className="text-right">{app_currency_symbol}{Number(order.sub_total).toFixed(2)}</td>
                                </tr>
                                {Number(order.discount) > 0 && (
                                    <tr>
                                        <td>Discount:</td>
                                        <td className="text-right">-{app_currency_symbol}{Number(order.discount).toFixed(2)}</td>
                                    </tr>
                                )}
                                {Number(order.tax) > 0 && (
                                    <tr>
                                        <td>Tax ({order.tax}%):</td>
                                        <td className="text-right">{app_currency_symbol}{Number((order.sub_total - order.discount) * order.tax / 100).toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr className="bold">
                                    <td>Total Amount:</td>
                                    <td className="text-right">{app_currency_symbol}{Number(order.grand_total).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Paid:</td>
                                    <td className="text-right">{app_currency_symbol}{Number(order.paid_amount).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Change:</td>
                                    <td className="text-right">{app_currency_symbol}{Number(order.change_amount).toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>

                        <div className="divider"></div>

                        <div className="footer">
                            <p>Thank you for shopping with us!</p>
                            <p>Software Powered by {app_name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 border-t pt-4">
                    <Button onClick={handlePrint} className="flex-1 gap-2 cursor-pointer">
                        <Printer className="h-4 w-4" />
                        Print Receipt
                    </Button>
                    <Button onClick={handleDownload} variant="secondary" className="flex-1 gap-2 cursor-pointer">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
