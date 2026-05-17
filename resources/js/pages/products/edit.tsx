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
import { Loader2, Package, Camera } from 'lucide-react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { BarcodeScanner } from '@/components/barcode-scanner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Product {
    id: number;
    name: string;
    sku: string;
    barcode: string | null;
    description: string | null;
    quantity: number;
    safety_stock: number;
    cost_price: string;
    sale_price: string;
    retail_price: string | null;
    category_id: number | null;
    supplier_id: number | null;
    is_active: boolean;
    image_path: string | null;
    image_url: string | null;
}

interface EditProps {
    product: Product;
    categories: { id: number, name: string }[];
    suppliers: { id: number, name: string }[];
}

const ProductEdit = ({ product, categories, suppliers }: EditProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(product.image_url);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        description: product.description || '',
        quantity: product.quantity,
        safety_stock: product.safety_stock,
        cost_price: parseFloat(product.cost_price),
        sale_price: parseFloat(product.sale_price),
        retail_price: product.retail_price || '',
        category_id: product.category_id?.toString() || '',
        supplier_id: product.supplier_id?.toString() || '',
        is_active: product.is_active,
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
        // We use POST with _method PATCH because of file upload issues with standard PUT/PATCH
        post(productsRoutes.update(product.id).url);
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
            <Head title={`Edit ${product.name}`} />

            <div className="flex items-center justify-between">
                <Heading
                    title="Edit Product"
                    description={`Update details for ${product.name}`}
                />
                <Button variant="outline" asChild>
                    <Link href={productsRoutes.index().url}>Cancel</Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Main product details and identification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                    />
                                    {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Barcode (Optional)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="barcode"
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
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
                                    {errors.barcode && <p className="text-sm text-destructive">{errors.barcode}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory & Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory & Pricing</CardTitle>
                            <CardDescription>Stock levels and financial details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Stock Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="safety_stock">Safety Stock Level</Label>
                                    <Input
                                        id="safety_stock"
                                        type="number"
                                        value={data.safety_stock}
                                        onChange={(e) => setData('safety_stock', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.safety_stock && <p className="text-sm text-destructive">{errors.safety_stock}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="cost_price">Cost Price ($)</Label>
                                    <Input
                                        id="cost_price"
                                        type="number"
                                        step="0.01"
                                        value={data.cost_price}
                                        onChange={(e) => setData('cost_price', parseFloat(e.target.value) || 0)}
                                    />
                                    {errors.cost_price && <p className="text-sm text-destructive">{errors.cost_price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sale_price">Sale Price ($)</Label>
                                    <Input
                                        id="sale_price"
                                        type="number"
                                        step="0.01"
                                        value={data.sale_price}
                                        onChange={(e) => setData('sale_price', parseFloat(e.target.value) || 0)}
                                    />
                                    {errors.sale_price && <p className="text-sm text-destructive">{errors.sale_price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="retail_price">Retail Price ($)</Label>
                                    <Input
                                        id="retail_price"
                                        type="number"
                                        step="0.01"
                                        value={data.retail_price}
                                        onChange={(e) => setData('retail_price', e.target.value)}
                                    />
                                    {errors.retail_price && <p className="text-sm text-destructive">{errors.retail_price}</p>}
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
                                className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted/80 transition-colors overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm font-medium">Change Image</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                                        <Package className="h-10 w-10 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Click to upload</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (Max 2MB)</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
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
                                    onValueChange={(value) => setData('category_id', value)}
                                    placeholder="Select a category"
                                    searchPlaceholder="Search categories..."
                                />
                                {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supplier_id">Primary Supplier</Label>
                                <SearchableSelect
                                    options={suppliers.map((sup) => ({
                                        value: sup.id.toString(),
                                        label: sup.name,
                                    }))}
                                    value={data.supplier_id}
                                    onValueChange={(value) => setData('supplier_id', value)}
                                    placeholder="Select a supplier"
                                    searchPlaceholder="Search suppliers..."
                                />
                                {errors.supplier_id && <p className="text-sm text-destructive">{errors.supplier_id}</p>}
                            </div>

                            <div className="flex items-center space-x-2 py-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-medium leading-none cursor-pointer">
                                    Publish product (Active)
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;

ProductEdit.layout = {
    breadcrumbs: [
        { title: 'Products', href: productsRoutes.index().url },
        { title: 'Edit', href: productsRoutes.index().url }, // Using index as fallback/parent
    ],
};
