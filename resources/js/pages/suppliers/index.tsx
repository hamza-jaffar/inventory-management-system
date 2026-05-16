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
import { PlusCircle, Pencil, Trash2, Mail, Phone, Globe } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import React, { useState } from 'react';
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
import * as suppliersRoutes from '@/routes/suppliers';

interface Supplier {
    id: number;
    name: string;
    code: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    is_active: boolean;
}

interface IndexProps {
    suppliers: {
        data: Supplier[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

const SupplierIndex = ({ suppliers }: IndexProps) => {
    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);

    const confirmDelete = () => {
        if (supplierToDelete) {
            router.delete(suppliersRoutes.destroy(supplierToDelete).url, {
                onSuccess: () => setSupplierToDelete(null),
            });
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
            <Head title="Suppliers" />

            <div className="flex items-center justify-between">
                <Heading
                    title="Suppliers"
                    description="Manage your product suppliers and contact information"
                />
                <Button asChild>
                    <Link href={suppliersRoutes.create().url}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Communication</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.data.length > 0 ? (
                            suppliers.data.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{supplier.name}</span>
                                            <span className="text-xs text-muted-foreground">{supplier.code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{supplier.contact_name || '-'}</TableCell>
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
                                        <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                                            {supplier.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={suppliersRoutes.edit(supplier.id).url}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSupplierToDelete(supplier.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
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
                            className={link.active ? 'bg-primary text-primary-foreground' : ''}
                        >
                            {link.url ? (
                                <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
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
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the supplier
                            and all associated record history.
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
