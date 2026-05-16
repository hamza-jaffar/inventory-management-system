import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import React, { FormEventHandler } from 'react';
import categories from '@/routes/categories';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    is_active: boolean;
    sort_order: number;
}

interface ParentCategory {
    id: number;
    name: string;
}

interface EditProps {
    category: Category;
    parentCategories: ParentCategory[];
}

const CategoryEdit = ({ category, parentCategories }: EditProps) => {
    const { data, setData, patch, processing, errors } = useForm({
        name: category.name || '',
        description: category.description || '',
        parent_id: category.parent_id?.toString() || '',
        is_active: !!category.is_active,
        sort_order: category.sort_order || 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(categories.update(category.id).url);
    };

    return (
        <div className="mx-auto space-y-6 p-4">
            <Head title={`Edit Category: ${category.name}`} />

            <Heading
                title="Edit Category"
                description={`Updating ${category.name}`}
            />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>
                            Update the category information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Category Name"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>


                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Brief description of the category"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="parent_id">Parent Category</Label>
                            <Select
                                value={data.parent_id}
                                onValueChange={(value) =>
                                    setData(
                                        'parent_id',
                                        value === 'none' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="parent_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select a parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {parentCategories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id.toString()}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.parent_id} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) =>
                                        setData(
                                            'sort_order',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    min="0"
                                />
                                <InputError message={errors.sort_order} />
                            </div>
                            <div className="flex items-center space-x-2 pt-0 md:pt-8">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', !!checked)
                                    }
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="cursor-pointer"
                                >
                                    Active
                                </Label>
                                <InputError message={errors.is_active} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6">
                        <Button variant="ghost" asChild>
                            <Link href={categories.index()}>Cancel</Link>
                        </Button>
                        <Button disabled={processing}>Update Category</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CategoryEdit;

CategoryEdit.layout = {
    breadcrumbs: [
        { title: 'Categories', href: categories.index() },
        { title: 'Edit', href: '#' },
    ],
};
