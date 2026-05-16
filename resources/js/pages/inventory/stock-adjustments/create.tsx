import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/searchable-select';
import { Product } from '@/types/data';

interface CreateProps {
    products: Product[];
}

export default function StockAdjustmentCreate({ products }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        quantity_change: '',
        type: 'damage',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stock-adjustments');
    };

    return (
        <>
            <Head title="Create Stock Adjustment" />

            <div className="mx-auto max-w-2xl flex-col gap-6 p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        New Stock Adjustment
                    </h1>
                    <p className="text-muted-foreground">
                        Adjust inventory manually for a product.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Adjustment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product_id">Product</Label>
                                <SearchableSelect
                                    options={products.map((p) => ({
                                        value: p.id.toString(),
                                        label: `${p.name} (${p.sku})`,
                                    }))}
                                    value={data.product_id}
                                    onValueChange={(val) =>
                                        setData('product_id', val)
                                    }
                                    placeholder="Select product..."
                                />
                                {errors.product_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.product_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Adjustment Type
                                    </Label>
                                    <select
                                        id="type"
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.type}
                                        onChange={(e) =>
                                            setData('type', e.target.value)
                                        }
                                    >
                                        <option value="damage">
                                            Damage (-)
                                        </option>
                                        <option value="theft">Theft (-)</option>
                                        <option value="audit_loss">
                                            Audit Loss (-)
                                        </option>
                                        <option value="audit_gain">
                                            Audit Gain (+)
                                        </option>
                                        <option value="promo_sample">
                                            Promo/Sample (-)
                                        </option>
                                    </select>
                                    {errors.type && (
                                        <p className="text-sm text-red-500">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity_change">
                                        Quantity (Absolute amount, e.g. 5)
                                    </Label>
                                    <Input
                                        id="quantity_change"
                                        type="number"
                                        min="1"
                                        value={data.quantity_change}
                                        onChange={(e) =>
                                            setData(
                                                'quantity_change',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="5"
                                    />
                                    {errors.quantity_change && (
                                        <p className="text-sm text-red-500">
                                            {errors.quantity_change}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    Reason (Optional)
                                </Label>
                                <Textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    placeholder="Briefly explain the adjustment..."
                                />
                                {errors.reason && (
                                    <p className="text-sm text-red-500">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/stock-adjustments">
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Save Adjustment
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StockAdjustmentCreate.layout = {
    breadcrumbs: [
        { title: 'Stock Adjustments', href: '/stock-adjustments' },
        { title: 'Create', href: '/stock-adjustments/create' },
    ],
};
