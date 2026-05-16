import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import products from '@/routes/products';
import { SearchableSelect } from '@/components/searchable-select';

interface ProductCreateModalProps {
    categories: any[];
    suppliers: any[];
    onSuccess: (product: any) => void;
    defaultSupplierId?: string;
}

export function ProductCreateModal({
    categories,
    suppliers,
    onSuccess,
    defaultSupplierId = '',
}: ProductCreateModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: '',
        category_id: '',
        supplier_id: defaultSupplierId,
        sku: '',
        barcode: '',
        description: '',
        cost_price: '',
        selling_price: '',
        safety_stock: '10',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open && defaultSupplierId) {
            setData((prev) => ({ ...prev, supplier_id: defaultSupplierId }));
        }
    }, [open, defaultSupplierId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) =>
                formData.append(key, value),
            );

            const response = await axios.post(products.store().url, formData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Product created successfully');
            setOpen(false);
            onSuccess(response.data.product);
            // reset
            setData({
                name: '',
                category_id: '',
                supplier_id: '',
                sku: '',
                barcode: '',
                description: '',
                cost_price: '',
                selling_price: '',
                safety_stock: '10',
            });
        } catch (error: any) {
            if (error.response?.status === 422) {
                const errorData = error.response.data.errors;
                const formattedErrors: Record<string, string> = {};
                for (const key in errorData) {
                    formattedErrors[key] = errorData[key][0];
                }
                setErrors(formattedErrors);
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Product
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Product</DialogTitle>
                    <DialogDescription>
                        Add a new product to your catalog.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="product_name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="product_name"
                                value={data.name}
                                onChange={(e) =>
                                    setData({ ...data, name: e.target.value })
                                }
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category_id">
                                Category{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <SearchableSelect
                                options={categories.map(c => ({ value: c.id.toString(), label: c.name }))}
                                value={data.category_id}
                                onValueChange={(val) => setData({ ...data, category_id: val })}
                                placeholder="Select Category"
                            />
                            <InputError message={errors.category_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier_id">
                                Supplier{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <SearchableSelect
                                options={suppliers.map(s => ({ value: s.id.toString(), label: s.name }))}
                                value={data.supplier_id}
                                onValueChange={(val) => setData({ ...data, supplier_id: val })}
                                placeholder="Select Supplier"
                            />
                            <InputError message={errors.supplier_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sku">
                                SKU <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="sku"
                                value={data.sku}
                                onChange={(e) =>
                                    setData({ ...data, sku: e.target.value })
                                }
                            />
                            <InputError message={errors.sku} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cost_price">
                                Cost Price{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="cost_price"
                                type="number"
                                step="0.01"
                                value={data.cost_price}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        cost_price: e.target.value,
                                    })
                                }
                            />
                            <InputError message={errors.cost_price} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="selling_price">
                                Selling Price{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="selling_price"
                                type="number"
                                step="0.01"
                                value={data.selling_price}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        selling_price: e.target.value,
                                    })
                                }
                            />
                            <InputError message={errors.selling_price} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="safety_stock">Safety Stock</Label>
                            <Input
                                id="safety_stock"
                                type="number"
                                value={data.safety_stock}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        safety_stock: e.target.value,
                                    })
                                }
                            />
                            <InputError message={errors.safety_stock} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    description: e.target.value,
                                })
                            }
                        />
                        <InputError message={errors.description} />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
