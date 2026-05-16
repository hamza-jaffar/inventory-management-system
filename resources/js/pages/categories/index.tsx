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
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
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
import * as categoriesRoutes from '@/routes/categories';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent?: { name: string };
    is_active: boolean;
    sort_order: number;
}

interface IndexProps {
    categories: {
        data: Category[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

const CategoryIndex = ({ categories }: IndexProps) => {
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(
        null,
    );

    const confirmDelete = () => {
        if (categoryToDelete) {
            router.delete(categoriesRoutes.destroy(categoryToDelete), {
                onSuccess: () => setCategoryToDelete(null),
            });
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
            <Head title="Categories" />

            <div className="flex items-center justify-between">
                <Heading
                    title="Categories"
                    description="Manage your product categories"
                />
                <Button asChild>
                    <Link href={categoriesRoutes.create().url}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sort Order</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.data.length > 0 ? (
                            categories.data.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {category.name}
                                    </TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell>
                                        {category.parent?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                category.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {category.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{category.sort_order}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={categoriesRoutes.edit(
                                                        category.id,
                                                    )}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setCategoryToDelete(
                                                        category.id,
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
                                    colSpan={6}
                                    className="h-24 text-center"
                                >
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {categories.links.length > 3 && (
                <div className="flex items-center justify-center space-x-1 py-4">
                    {categories.links.map((link, index) => (
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
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the category and remove it from our servers.
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

export default CategoryIndex;

CategoryIndex.layout = {
    breadcrumbs: [{ title: 'Categories', href: categoriesRoutes.index() }],
};
