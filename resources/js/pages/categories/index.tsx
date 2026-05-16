import { Head, Link, router, usePage } from '@inertiajs/react';
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
import { PlusCircle, Pencil, Trash2, Search, ArrowUpDown, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
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
import * as categoriesRoutes from '@/routes/categories';
import { debounce } from 'lodash';

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
    filters: {
        search?: string;
        sort?: string;
    };
}

const CategoryIndex = ({ categories, filters }: IndexProps) => {
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const confirmDelete = () => {
        if (categoryToDelete) {
            router.delete(categoriesRoutes.destroy(categoryToDelete).url, {
                onSuccess: () => setCategoryToDelete(null),
            });
        }
    };

    const handleSearch = useCallback(
        debounce((value: string) => {
            router.get(
                categoriesRoutes.index().url,
                { ...filters, search: value },
                { preserveState: true, replace: true }
            );
        }, 300),
        [filters]
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
            categoriesRoutes.index().url,
            { ...filters, sort: newSort },
            { preserveState: true }
        );
    };

    const toggleStatus = (id: number) => {
        router.patch(categoriesRoutes.toggleStatus(id).url, {}, {
            preserveScroll: true,
        });
    };

    const getSortIcon = (field: string) => {
        if (filters.sort === field) return <ChevronUp className="ml-2 h-4 w-4" />;
        if (filters.sort === `-${field}`) return <ChevronDown className="ml-2 h-4 w-4" />;
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
            <Head title="Categories" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title="Categories"
                    description="Manage your product categories"
                />
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button asChild>
                        <Link href={categoriesRoutes.create().url}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('name')}>
                                <div className="flex items-center">
                                    Name {getSortIcon('name')}
                                </div>
                            </TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('is_active')}>
                                <div className="flex items-center">
                                    Status {getSortIcon('is_active')}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('sort_order')}>
                                <div className="flex items-center">
                                    Sort Order {getSortIcon('sort_order')}
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.data.length > 0 ? (
                            categories.data.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell>{category.parent?.name || '-'}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 p-0 hover:bg-transparent">
                                                    <Badge
                                                        variant={category.is_active ? 'default' : 'secondary'}
                                                        className="cursor-pointer"
                                                    >
                                                        {category.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuItem onClick={() => !category.is_active && toggleStatus(category.id)}>
                                                    <Check className={`mr-2 h-4 w-4 ${category.is_active ? 'opacity-100' : 'opacity-0'}`} />
                                                    Active
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => category.is_active && toggleStatus(category.id)}>
                                                    <X className={`mr-2 h-4 w-4 ${!category.is_active ? 'opacity-100' : 'opacity-0'}`} />
                                                    Inactive
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell>{category.sort_order}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={categoriesRoutes.edit(category.id).url}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setCategoryToDelete(category.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
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
                            className={link.active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
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
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category
                            and remove it from our servers.
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
    breadcrumbs: [{ title: 'Categories', href: categoriesRoutes.index().url }],
};
