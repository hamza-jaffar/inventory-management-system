import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    PlusCircle,
    Pencil,
    Trash2,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    Check,
    X,
    Package,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import React, { useState, useEffect, useCallback } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/searchable-select';
import * as productsRoutes from '@/routes/products';
import { useSettings } from '@/hooks/use-settings';
import { debounce } from 'lodash';
import { Product } from '@/types/data';
import { usePermissions } from '@/hooks/use-permissions';

interface IndexProps {
    products: {
        data: Product[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        search?: string;
        sort?: string;
        category_id?: string;
    };
    categories: { id: number; name: string }[];
}

const ProductIndex = ({ products, filters, categories }: IndexProps) => {
    const { app_currency_symbol } = useSettings();
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const { can } = usePermissions();

    const confirmDelete = () => {
        if (productToDelete) {
            router.delete(productsRoutes.destroy(productToDelete).url, {
                onSuccess: () => setProductToDelete(null),
            });
        }
    };

    const handleFilter = useCallback(
        debounce((newFilters: any) => {
            router.get(
                productsRoutes.index().url,
                { ...filters, ...newFilters },
                { preserveState: true, replace: true },
            );
        }, 300),
        [filters],
    );

    useEffect(() => {
        if (search !== (filters.search || '')) {
            handleFilter({ search });
        }
    }, [search]);

    const toggleSort = (field: string) => {
        let newSort = field;
        if (filters.sort === field) {
            newSort = `-${field}`;
        } else if (filters.sort === `-${field}`) {
            newSort = '';
        }
        handleFilter({ sort: newSort });
    };

    const toggleStatus = (id: number) => {
        router.patch(
            productsRoutes.toggleStatus(id).url,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getSortIcon = (field: string) => {
        if (filters.sort === field)
            return <ChevronUp className="ml-2 h-4 w-4" />;
        if (filters.sort === `-${field}`)
            return <ChevronDown className="ml-2 h-4 w-4" />;
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
            <Head title="Products" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title="Products"
                    description="Manage your inventory and product catalog"
                />
                {can('create products') && (
                    <Button asChild>
                        <Link href={productsRoutes.create().url}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <SearchableSelect
                    options={[
                        { value: 'all', label: 'All Categories' },
                        ...categories.map((cat) => ({
                            value: cat.id.toString(),
                            label: cat.name,
                        })),
                    ]}
                    value={filters.category_id || 'all'}
                    onValueChange={(value) =>
                        handleFilter({
                            category_id: value === 'all' ? '' : value,
                        })
                    }
                    placeholder="All Categories"
                    searchPlaceholder="Search categories..."
                    className="w-full sm:w-[220px]"
                />
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleSort('name')}
                            >
                                <div className="flex items-center">
                                    Product {getSortIcon('name')}
                                </div>
                            </TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleSort('quantity')}
                            >
                                <div className="flex items-center">
                                    Stock {getSortIcon('quantity')}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleSort('sale_price')}
                            >
                                <div className="flex items-center">
                                    Price {getSortIcon('sale_price')}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleSort('is_active')}
                            >
                                <div className="flex items-center">
                                    Status {getSortIcon('is_active')}
                                </div>
                            </TableHead>
                            {can('edit products') || can('delete products') ? (
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            ) : null}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length > 0 ? (
                            products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-10 w-10 rounded-md border object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {product.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {product.sku}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {product.category?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={
                                                    product.quantity <=
                                                    product.safety_stock
                                                        ? 'font-bold text-destructive'
                                                        : ''
                                                }
                                            >
                                                {product.quantity}
                                            </span>
                                            {product.quantity <=
                                                product.safety_stock && (
                                                <Badge
                                                    variant="destructive"
                                                    className="h-5 px-1.5 text-[10px]"
                                                >
                                                    Low
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {app_currency_symbol}{' '}
                                        {product.sale_price > 0
                                            ? product.sale_price
                                            : product.retail_price}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                asChild
                                                disabled={!can('edit products')}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className={`h-8 p-0 hover:bg-transparent ${!can('edit products') ? 'cursor-default' : 'cursor-pointer'}`}
                                                >
                                                    <Badge
                                                        variant={
                                                            product.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {product.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            {can('edit products') && (
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            !product.is_active &&
                                                            toggleStatus(
                                                                product.id,
                                                            )
                                                        }
                                                    >
                                                        <Check
                                                            className={`mr-2 h-4 w-4 ${product.is_active ? 'opacity-100' : 'opacity-0'}`}
                                                        />
                                                        Active
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            product.is_active &&
                                                            toggleStatus(
                                                                product.id,
                                                            )
                                                        }
                                                    >
                                                        <X
                                                            className={`mr-2 h-4 w-4 ${!product.is_active ? 'opacity-100' : 'opacity-0'}`}
                                                        />
                                                        Inactive
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            )}
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {can('edit products') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={
                                                            productsRoutes.edit(
                                                                product.id,
                                                            ).url
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {can('delete products') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setProductToDelete(
                                                            product.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-24 text-center"
                                >
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {products.links.length > 3 && (
                <div className="flex items-center justify-center space-x-1 py-4">
                    {products.links.map((link, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            asChild={!!link.url}
                            disabled={!link.url}
                            className={
                                link.active
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    : ''
                            }
                        >
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            )}
                        </Button>
                    ))}
                </div>
            )}

            <AlertDialog
                open={!!productToDelete}
                onOpenChange={(open) => !open && setProductToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the product and all associated inventory
                            history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProductIndex;

ProductIndex.layout = {
    breadcrumbs: [{ title: 'Products', href: productsRoutes.index().url }],
};
