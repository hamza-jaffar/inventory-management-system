import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import * as productsRoutes from '@/routes/products';
import { SearchableSelect } from '@/components/searchable-select';
import React, { useRef, useState } from 'react';
import { ImagePlus, X, Loader2, Camera } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { BarcodeScanner } from '@/components/barcode-scanner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface CreateProps {
    categories: { id: number; name: string }[];
    suppliers: { id: number; name: string }[];
}

const ProductCreate = ({ categories, suppliers }: CreateProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        quantity: 0,
        safety_stock: 5,
        cost_price: 0,
        sale_price: 0,
        retail_price: '',
        category_id: '',
        supplier_id: '',
        is_active: true,
        is_active: true,
        image: null as File | null,
    });
    
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useBarcodeScanner((scanned) => {
        setData('barcode', scanned);
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(productsRoutes.store().url);
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
            <Head title="Create Product" />

            <div className="flex items-center justify-between">
                <Heading
                    title="Create Product"
                    description="Add a new product to your inventory"
                />
                <Button variant="outline" asChild>
                    <Link href={productsRoutes.index().url}>Cancel</Link>
                </Button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
                <div className="space-y-6 lg:col-span-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Main product details and identification
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Wireless Mouse G502"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">
                                        SKU (Stock Keeping Unit)
                                    </Label>
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(e) =>
                                            setData('sku', e.target.value)
                                        }
                                        placeholder="e.g. LOGI-G502-BLK"
                                    />
                                    {errors.sku && (
                                        <p className="text-sm text-destructive">
                                            {errors.sku}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="barcode">
                                        Barcode (Optional)
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="barcode"
                                            value={data.barcode}
                                            onChange={(e) =>
                                                setData('barcode', e.target.value)
                                            }
                                            placeholder="UPC, EAN, or ISBN"
                                            className="flex-1"
                                        />
                                        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="outline" className="shrink-0 px-3">
                                                    <Camera className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Scan Barcode</DialogTitle>
                                                </DialogHeader>
                                                <div className="p-4">
                                                    <BarcodeScanner 
                                                        onScan={(scanned) => {
                                                            setData('barcode', scanned);
                                                            setIsScannerOpen(false);
                                                        }} 
                                                        onClose={() => setIsScannerOpen(false)} 
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    {errors.barcode && (
                                        <p className="text-sm text-destructive">
                                            {errors.barcode}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={4}
                                    placeholder="Provide a detailed description of the product..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory & Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory & Pricing</CardTitle>
                            <CardDescription>
                                Stock levels and financial details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">
                                        Initial Quantity
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) =>
                                            setData(
                                                'quantity',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    {errors.quantity && (
                                        <p className="text-sm text-destructive">
                                            {errors.quantity}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="safety_stock">
                                        Safety Stock Level
                                    </Label>
                                    <Input
                                        id="safety_stock"
                                        type="number"
                                        value={data.safety_stock}
                                        onChange={(e) =>
                                            setData(
                                                'safety_stock',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    {errors.safety_stock && (
                                        <p className="text-sm text-destructive">
                                            {errors.safety_stock}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="cost_price">
                                        Cost Price ($)
                                    </Label>
                                    <Input
                                        id="cost_price"
                                        type="number"
                                        step="0.01"
                                        value={data.cost_price}
                                        onChange={(e) =>
                                            setData(
                                                'cost_price',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    {errors.cost_price && (
                                        <p className="text-sm text-destructive">
                                            {errors.cost_price}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sale_price">
                                        Sale Price ($)
                                    </Label>
                                    <Input
                                        id="sale_price"
                                        type="number"
                                        step="0.01"
                                        value={data.sale_price}
                                        onChange={(e) =>
                                            setData(
                                                'sale_price',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    {errors.sale_price && (
                                        <p className="text-sm text-destructive">
                                            {errors.sale_price}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="retail_price">
                                        Retail Price ($)
                                    </Label>
                                    <Input
                                        id="retail_price"
                                        type="number"
                                        step="0.01"
                                        value={data.retail_price}
                                        onChange={(e) =>
                                            setData(
                                                'retail_price',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="MSRP (Optional)"
                                    />
                                    {errors.retail_price && (
                                        <p className="text-sm text-destructive">
                                            {errors.retail_price}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Image Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className="relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted/80"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                            <p className="text-sm font-medium text-white">
                                                Change Image
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                                        <ImagePlus className="h-10 w-10 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Click to upload
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG or WEBP (Max 2MB)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {imagePreview && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={removeImage}
                                >
                                    <X className="mr-2 h-4 w-4" /> Remove Image
                                </Button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {errors.image && (
                                <p className="text-sm text-destructive">
                                    {errors.image}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Classification */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <SearchableSelect
                                    options={categories.map((cat) => ({
                                        value: cat.id.toString(),
                                        label: cat.name,
                                    }))}
                                    value={data.category_id}
                                    onValueChange={(value) =>
                                        setData('category_id', value)
                                    }
                                    placeholder="Select a category"
                                    searchPlaceholder="Search categories..."
                                />
                                {errors.category_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.category_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supplier_id">
                                    Primary Supplier
                                </Label>
                                <SearchableSelect
                                    options={suppliers.map((sup) => ({
                                        value: sup.id.toString(),
                                        label: sup.name,
                                    }))}
                                    value={data.supplier_id}
                                    onValueChange={(value) =>
                                        setData('supplier_id', value)
                                    }
                                    placeholder="Select a supplier"
                                    searchPlaceholder="Search suppliers..."
                                />
                                {errors.supplier_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.supplier_id}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 py-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', !!checked)
                                    }
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="cursor-pointer text-sm leading-none font-medium"
                                >
                                    Publish product (Active)
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                Creating...
                            </>
                        ) : (
                            'Create Product'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProductCreate;

ProductCreate.layout = {
    breadcrumbs: [
        { title: 'Products', href: productsRoutes.index().url },
        { title: 'Create', href: productsRoutes.create().url },
    ],
};
