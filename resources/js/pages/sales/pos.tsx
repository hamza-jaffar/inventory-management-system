import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { InvoiceReceiptModal } from '@/components/invoice-receipt-modal';
import { Order } from '@/types/data';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Banknote,
    Calculator,
    Check,
    ChevronsUpDown,
    Command as CommandIcon,
    Camera,
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { toast } from 'sonner';
import { Product } from '@/types/data';
import * as salesRoute from '@/routes/sales';
import { cn, playSuccessSound, playErrorSound } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { BarcodeScanner } from '@/components/barcode-scanner';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface CartItem extends Product {
    cart_quantity: number;
    discount: number;
    tax: number;
}

interface POSProps {
    products: Product[];
}

const POS = ({ products }: POSProps) => {
    const { flash } = usePage().props as any;
    const { app_currency_symbol } = useSettings();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [openSearch, setOpenSearch] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [globalDiscount, setGlobalDiscount] = useState<number>(0);
    const [globalTax, setGlobalTax] = useState<number>(0);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    useEffect(() => {
        if (flash?.created_order) {
            setReceiptOrder(flash.created_order);
            setIsReceiptOpen(true);
        }
    }, [flash?.created_order]);

    const handleScan = (decodedText: string) => {
        const cleanText = decodedText.trim();
        const product = products.find((p) => p.barcode === cleanText || p.sku === cleanText);
        if (product) {
            playSuccessSound();
            addToCart(product);
            toast.success(`Added ${product.name} to cart`);
            setIsScannerOpen(false);
            setSearch('');
        } else {
            playErrorSound();
            toast.error(`Product with barcode ${cleanText} not found`);
        }
    };

    // Manual filtering for the command palette
    const filteredProducts = useMemo(() => {
        const active = products.filter((p) => p.is_active);
        if (!search) return active;
        const lower = search.toLowerCase();
        return active.filter(
            (p) =>
                p.name.toLowerCase().includes(lower) ||
                p.sku.toLowerCase().includes(lower) ||
                (p.barcode && p.barcode.toLowerCase().includes(lower)),
        );
    }, [products, search]);

    // Keyboard shortcut for search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpenSearch((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Hardware Barcode Scanner listener
    useEffect(() => {
        let barcodeBuffer = '';
        let lastKeyTime = Date.now();

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            const currentTime = Date.now();
            
            if (currentTime - lastKeyTime > 50) {
                barcodeBuffer = '';
            }

            if (e.key === 'Enter') {
                if (barcodeBuffer.length >= 3) {
                    e.preventDefault();
                    e.stopPropagation();
                    const scanned = barcodeBuffer;
                    barcodeBuffer = '';
                    handleScan(scanned);
                }
            } else if (e.key.length === 1) {
                barcodeBuffer += e.key;
            }

            lastKeyTime = currentTime;
        };

        // Use capture phase to intercept before inputs process it
        window.addEventListener('keydown', handleGlobalKeyDown, true);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
    }, [products]);

    const addToCart = (product: Product) => {
        if (product.quantity <= 0) {
            toast.error('Product out of stock');
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                if (existing.cart_quantity >= product.quantity) {
                    toast.error('Cannot exceed available stock');
                    return prev;
                }
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, cart_quantity: item.cart_quantity + 1 }
                        : item,
                );
            }
            return [
                ...prev,
                { ...product, cart_quantity: 1, discount: 0, tax: 0 },
            ];
        });
    };

    const removeFromCart = (id: number) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = item.cart_quantity + delta;
                    if (newQty < 1) return item;
                    if (newQty > item.quantity) {
                        toast.error('Cannot exceed available stock');
                        return item;
                    }
                    return { ...item, cart_quantity: newQty };
                }
                return item;
            }),
        );
    };

    const subTotal = useMemo(() => {
        return cart.reduce(
            (acc, item) =>
                acc +
                Number(item.sale_price || item.retail_price) *
                    item.cart_quantity,
            0,
        );
    }, [cart]);

    const grandTotal = useMemo(() => {
        const afterDiscount = subTotal - globalDiscount;
        const total = afterDiscount + (afterDiscount * globalTax) / 100;
        return Math.max(0, total);
    }, [subTotal, globalDiscount, globalTax]);

    const changeAmount = useMemo(() => {
        return Math.max(0, paidAmount - grandTotal);
    }, [paidAmount, grandTotal]);

    const handleSubmit = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        if (paidAmount < grandTotal && paymentMethod === 'Cash') {
            toast.error('Paid amount is less than grand total');
            return;
        }

        router.post(
            salesRoute.store().url,
            {
                sub_total: subTotal,
                discount: globalDiscount,
                tax: globalTax,
                grand_total: grandTotal,
                paid_amount: paidAmount,
                change_amount: changeAmount,
                payment_method: paymentMethod,
                items: cart.map((item) => ({
                    product_id: item.id,
                    quantity: item.cart_quantity,
                    unit_price: Number(item.sale_price || item.retail_price),
                })),
            },
            {
                onSuccess: () => {
                    setCart([]);
                    setPaidAmount(0);
                    setGlobalDiscount(0);
                    setGlobalTax(0);
                    toast.success('Order placed successfully');
                },
            },
        );
    };

    return (
        <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
            <Head title="Point of Sale" />

            <ResizablePanelGroup
                direction="horizontal"
                className="flex-1 rounded-lg border"
            >
                {/* Left Side: Product Search & List */}
                <ResizablePanel defaultSize={60} minSize={30}>
                    <div className="flex h-full flex-col p-4">
                        <div className="mb-4 flex gap-2">
                            <Popover
                                open={openSearch}
                                onOpenChange={setOpenSearch}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openSearch}
                                        className="h-12 flex-1 justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Search className="h-5 w-5 text-muted-foreground" />
                                            {search
                                                ? search
                                                : 'Search product... (Ctrl+K)'}
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="border-none p-0 shadow-2xl"
                                    align="start"
                                    style={{
                                        width: 'var(--radix-popover-trigger-width)',
                                    }}
                                >
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Type product name or SKU..."
                                            value={search}
                                            onValueChange={setSearch}
                                            autoFocus
                                        />
                                        <CommandList className="max-h-[350px]">
                                            <CommandEmpty>
                                                No product found for "{search}".
                                            </CommandEmpty>
                                            <CommandGroup heading="Available Products">
                                                {filteredProducts.map(
                                                    (product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            value={`${product.name} ${product.sku}`.toLowerCase()}
                                                            onSelect={() => {
                                                                if (
                                                                    product.quantity <=
                                                                    0
                                                                ) {
                                                                    toast.error(
                                                                        'Product out of stock',
                                                                    );
                                                                    return;
                                                                }
                                                                addToCart(
                                                                    product,
                                                                );
                                                                setOpenSearch(
                                                                    false,
                                                                );
                                                                setSearch('');
                                                            }}
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-3 px-4 py-3',
                                                                product.quantity <=
                                                                    0 &&
                                                                    'opacity-50 grayscale-[0.5]',
                                                            )}
                                                        >
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                                                {product.image_url ? (
                                                                    <img
                                                                        src={
                                                                            product.image_url
                                                                        }
                                                                        alt={
                                                                            product.name
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Search className="h-5 w-5 text-muted-foreground/50" />
                                                                )}
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 flex-col">
                                                                <span className="truncate">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </span>
                                                                <span className="truncate text-[10px] text-muted-foreground">
                                                                    SKU:{' '}
                                                                    {
                                                                        product.sku
                                                                    }{' '}
                                                                    •{' '}
                                                                    {product.quantity >
                                                                    0 ? (
                                                                        `Stock: ${product.quantity}`
                                                                    ) : (
                                                                        <span className="font-bold text-destructive">
                                                                            Out
                                                                            of
                                                                            Stock
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-primary">
                                                                    {
                                                                        app_currency_symbol
                                                                    }
                                                                    {Number(
                                                                        product.sale_price ||
                                                                            product.retail_price,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                                <div className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary uppercase">
                                                                    Add{' '}
                                                                    <Plus className="h-2 w-2" />
                                                                </div>
                                                            </div>
                                                        </CommandItem>
                                                    ),
                                                )}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="h-12 w-12 shrink-0">
                                        <Camera className="h-5 w-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Scan Barcode</DialogTitle>
                                    </DialogHeader>
                                    <div className="p-4">
                                        <BarcodeScanner 
                                            onScan={handleScan} 
                                            onClose={() => setIsScannerOpen(false)} 
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 rounded-lg border bg-card p-2 shadow-sm transition-all"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-semibold">
                                                {item.name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {app_currency_symbol}
                                                {Number(
                                                    item.sale_price ||
                                                        item.retail_price,
                                                ).toFixed(2)}{' '}
                                                / unit
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() =>
                                                    updateQuantity(item.id, -1)
                                                }
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-5 text-center text-xs">
                                                {item.cart_quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() =>
                                                    updateQuantity(item.id, 1)
                                                }
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="w-16 text-right text-xs font-bold">
                                            {app_currency_symbol}
                                            {(
                                                Number(
                                                    item.sale_price ||
                                                        item.retail_price,
                                                ) * item.cart_quantity
                                            ).toFixed(2)}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40">
                                        <ShoppingCart className="mb-2 h-10 w-10" />
                                        <p className="text-sm">
                                            No items in cart
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right Side: Cart & Checkout */}
                <ResizablePanel defaultSize={40} minSize={30}>
                    <div className="flex h-full flex-col bg-muted/30">
                        <div className="flex items-center justify-between border-b bg-card p-4">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Cart ({cart.length})
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCart([])}
                                className="text-destructive"
                            >
                                Clear
                            </Button>
                        </div>

                        <div className="space-y-4 border-t bg-card p-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Discount
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={globalDiscount}
                                            onChange={(e) =>
                                                setGlobalDiscount(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="h-8 pr-7 text-sm"
                                        />
                                        <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-muted-foreground">
                                            {app_currency_symbol}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Tax (%)
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={globalTax}
                                            onChange={(e) =>
                                                setGlobalTax(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="h-8 pr-6 text-sm"
                                        />
                                        <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 py-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span className="font-semibold">
                                        {app_currency_symbol}{' '}
                                        {subTotal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl">
                                    <span className="tracking-tight">
                                        Grand Total
                                    </span>
                                    <span className="text-primary">
                                        {app_currency_symbol}{' '}
                                        {grandTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex gap-1 rounded-lg bg-muted p-1">
                                    <Button
                                        variant={
                                            paymentMethod === 'Cash'
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        className={cn(
                                            'h-8 flex-1 gap-2 text-xs font-semibold shadow-none transition-all',
                                            paymentMethod === 'Cash' &&
                                                'bg-background shadow-sm',
                                        )}
                                        onClick={() => setPaymentMethod('Cash')}
                                    >
                                        <Banknote className="h-3.5 w-3.5" />{' '}
                                        Cash
                                    </Button>
                                    <Button
                                        variant={
                                            paymentMethod === 'Card'
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        className={cn(
                                            'h-8 flex-1 gap-2 text-xs shadow-none transition-all',
                                            paymentMethod === 'Card' &&
                                                'bg-background shadow-sm',
                                        )}
                                        onClick={() => setPaymentMethod('Card')}
                                    >
                                        <CreditCard className="h-3.5 w-3.5" />{' '}
                                        Card
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            Paid Amount
                                        </label>
                                        <Input
                                            type="number"
                                            value={paidAmount}
                                            onChange={(e) =>
                                                setPaidAmount(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="h-9 border-primary/20 bg-primary/5 text-lg"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            Change
                                        </label>
                                        <div className="flex h-9 items-center rounded-md border bg-muted/30 px-3 text-lg text-primary/80">
                                            {app_currency_symbol}{' '}
                                            {changeAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full gap-2 shadow-lg transition-transform active:scale-[0.98]"
                                    onClick={handleSubmit}
                                    disabled={cart.length === 0}
                                    variant="default"
                                >
                                    <Calculator className="h-5 w-5" /> Submit
                                    Order
                                </Button>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

            <InvoiceReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                order={receiptOrder}
            />
        </div>
    );
};

POS.layout = (page: any) => <AppLayout children={page} />;

export default POS;
