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
    Mail,
    Phone,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    Check,
    X,
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
import * as suppliersRoutes from '@/routes/suppliers';
import { debounce } from 'lodash';
import { Supplier } from '@/types/data';

interface IndexProps {
    suppliers: {
        data: Supplier[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        search?: string;
        sort?: string;
    };
}

const SupplierIndex = ({ suppliers, filters }: IndexProps) => {
    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(
        null,
    );
    const [search, setSearch] = useState(filters.search || '');

    const confirmDelete = () => {
        if (supplierToDelete) {
            router.delete(suppliersRoutes.destroy(supplierToDelete).url, {
                onSuccess: () => setSupplierToDelete(null),
            });
        }
    };

    const handleSearch = useCallback(
        debounce((value: string) => {
            router.get(
                suppliersRoutes.index().url,
                { ...filters, search: value },
                { preserveState: true, replace: true },
            );
        }, 300),
        [filters],
    );

    useEffect(() => {
        if (search !== (filters.search || '')) {
            handleSearch(search);
        }
    }, [search]);

    const toggleSort = (field: string) => {
        let newSort = field;
        if (filters.sort === field) {
            newSort = `-${field}`;
        } else if (filters.sort === `-${field}`) {
            newSort = '';
        }

        router.get(
            suppliersRoutes.index().url,
            { ...filters, sort: newSort },
            { preserveState: true },
        );
    };

    const toggleStatus = (id: number) => {
        router.patch(
            suppliersRoutes.toggleStatus(id).url,
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
            <Head title="Suppliers" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title="Suppliers"
                    description="Manage your product suppliers and contact information"
                />
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search suppliers..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button asChild>
                        <Link href={suppliersRoutes.create().url}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Supplier
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleSort('name')}
                            >
                                <div className="flex items-center">
                                    Supplier {getSortIcon('name')}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleSort('contact_name')}
                            >
                                <div className="flex items-center">
                                    Contact {getSortIcon('contact_name')}
                                </div>
                            </TableHead>
                            <TableHead>Communication</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleSort('is_active')}
                            >
                                <div className="flex items-center">
                                    Status {getSortIcon('is_active')}
                                </div>
                            </TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.data.length > 0 ? (
                            suppliers.data.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {supplier.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {supplier.code}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {supplier.contact_name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {supplier.email && (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Mail className="mr-1 h-3 w-3" />
                                                    {supplier.email}
                                                </div>
                                            )}
                                            {supplier.phone && (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Phone className="mr-1 h-3 w-3" />
                                                    {supplier.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 p-0 hover:bg-transparent"
                                                >
                                                    <Badge
                                                        variant={
                                                            supplier.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="cursor-pointer"
                                                    >
                                                        {supplier.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        !supplier.is_active &&
                                                        toggleStatus(
                                                            supplier.id,
                                                        )
                                                    }
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${supplier.is_active ? 'opacity-100' : 'opacity-0'}`}
                                                    />
                                                    Active
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        supplier.is_active &&
                                                        toggleStatus(
                                                            supplier.id,
                                                        )
                                                    }
                                                >
                                                    <X
                                                        className={`mr-2 h-4 w-4 ${!supplier.is_active ? 'opacity-100' : 'opacity-0'}`}
                                                    />
                                                    Inactive
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={
                                                        suppliersRoutes.edit(
                                                            supplier.id,
                                                        ).url
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setSupplierToDelete(
                                                        supplier.id,
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center"
                                >
                                    No suppliers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {suppliers.links.length > 3 && (
                <div className="flex items-center justify-center space-x-1 py-4">
                    {suppliers.links.map((link, index) => (
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
                open={!!supplierToDelete}
                onOpenChange={(open) => !open && setSupplierToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the supplier and all associated record
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

export default SupplierIndex;

SupplierIndex.layout = {
    breadcrumbs: [{ title: 'Suppliers', href: suppliersRoutes.index().url }],
};
