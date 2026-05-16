import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { SearchableSelect } from '@/components/searchable-select';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { SupplierCreateModal } from '@/components/supplier-create-modal';
import { ProductCreateModal } from '@/components/product-create-modal';
import { useState } from 'react';
import { toast } from 'sonner';
import purchaseOrders from '@/routes/purchase-orders';

interface Product {
    id: number;
    name: string;
    sku: string;
    cost_price: string;
    supplier_id: number;
}

interface Supplier {
    id: number;
    name: string;
}

interface CreateProps {
    suppliers: Supplier[];
    products: Product[];
    categories: any[];
}

export default function PurchaseOrderCreate({
    suppliers: initialSuppliers,
    products: initialProducts,
    categories,
}: CreateProps) {
    const [suppliers, setSuppliers] = useState(initialSuppliers);
    const [products, setProducts] = useState(initialProducts);

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        items: [] as {
            product_id: string;
            quantity_ordered: string;
            unit_cost: string;
        }[],
    });

    const addItem = () => {
        setData('items', [
            ...data.items,
            { product_id: '', quantity_ordered: '1', unit_cost: '0' },
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...data.items];
        (newItems[index] as any)[field] = value;

        // Auto-fill unit cost when a product is selected
        if (field === 'product_id') {
            const product = products.find((p) => p.id.toString() === value);
            if (product) {
                newItems[index].unit_cost = product.cost_price;
                
                // Auto-select supplier if not set
                if (!data.supplier_id) {
                    setData((prev) => ({
                        ...prev,
                        supplier_id: product.supplier_id.toString(),
                        items: newItems,
                    }));
                    return; // Prevent double state update
                }
            }
        }

        setData('items', newItems);
    };

    const calculateTotal = () => {
        return data.items
            .reduce((total, item) => {
                return (
                    total +
                    parseFloat(item.quantity_ordered || '0') *
                        parseFloat(item.unit_cost || '0')
                );
            }, 0)
            .toFixed(2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(purchaseOrders.store().url);
    };

    const handleSupplierCreated = (supplier: Supplier) => {
        setSuppliers([...suppliers, supplier]);
        setData('supplier_id', supplier.id.toString());
    };

    const handleProductCreated = (product: Product) => {
        setProducts([...products, product]);
        // We could auto add it to the list here if we want, but letting them select is fine.
    };

    return (
        <>
            <Head title="Create Purchase Order" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={purchaseOrders.index().url}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Create Purchase Order
                        </h1>
                        <p className="text-muted-foreground">
                            Issue a new purchase order to a supplier.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>PO Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid max-w-sm gap-2">
                                <Label htmlFor="supplier_id">
                                    Select Supplier
                                </Label>
                                <div className="flex items-center gap-2">
                                    <SearchableSelect
                                        options={suppliers.map((s) => ({
                                            value: s.id.toString(),
                                            label: s.name,
                                        }))}
                                        value={data.supplier_id}
                                        onValueChange={(val) =>
                                            setData('supplier_id', val)
                                        }
                                        placeholder="Select supplier..."
                                    />
                                    <SupplierCreateModal
                                        onSuccess={handleSupplierCreated}
                                    />
                                </div>
                                {errors.supplier_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.supplier_id}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Order Items</CardTitle>
                                <CardDescription>
                                    Add products to this purchase order.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Only show ProductCreateModal if categories are available. 
                                    Wait, ProductCreateModal needs categories and suppliers.
                                    Let's pass them or fetch them. 
                                    Wait, create() in controller didn't pass categories! I will fix the controller to pass categories.
                                */}
                                <ProductCreateModal
                                    categories={categories || []}
                                    suppliers={suppliers}
                                    defaultSupplierId={data.supplier_id}
                                    onSuccess={handleProductCreated}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[400px]">
                                            Product
                                        </TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-4 text-center text-muted-foreground"
                                            >
                                                No items added yet. Click below
                                                to add an item.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <SearchableSelect
                                                        options={products
                                                            .filter(p => !data.supplier_id || p.supplier_id.toString() === data.supplier_id)
                                                            .map((p) => ({
                                                                value: p.id.toString(),
                                                                label: `${p.name} (${p.sku})`,
                                                            }))}
                                                        value={item.product_id}
                                                        onValueChange={(val) =>
                                                            updateItem(
                                                                index,
                                                                'product_id',
                                                                val,
                                                            )
                                                        }
                                                        placeholder="Select product..."
                                                    />
                                                    {errors[
                                                        `items.${index}.product_id`
                                                    ] && (
                                                        <p className="mt-1 text-xs text-destructive">
                                                            {
                                                                errors[
                                                                    `items.${index}.product_id`
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            item.quantity_ordered
                                                        }
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'quantity_ordered',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {errors[
                                                        `items.${index}.quantity_ordered`
                                                    ] && (
                                                        <p className="mt-1 text-xs text-destructive">
                                                            {
                                                                errors[
                                                                    `items.${index}.quantity_ordered`
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unit_cost}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'unit_cost',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {errors[
                                                        `items.${index}.unit_cost`
                                                    ] && (
                                                        <p className="mt-1 text-xs text-destructive">
                                                            {
                                                                errors[
                                                                    `items.${index}.unit_cost`
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-middle">
                                                    {(
                                                        parseFloat(
                                                            item.quantity_ordered ||
                                                                '0',
                                                        ) *
                                                        parseFloat(
                                                            item.unit_cost ||
                                                                '0',
                                                        )
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            {typeof errors.items === 'string' && (
                                <p className="mt-2 text-sm text-destructive">
                                    {errors.items}
                                </p>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addItem}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                                <div className="text-xl font-bold">
                                    Total: {calculateTotal()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.get(purchaseOrders.index().url)
                            }
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || data.items.length === 0}
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Purchase Order
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
