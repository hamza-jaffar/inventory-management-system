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

interface ParentCategory {
    id: number;
    name: string;
}

interface CreateProps {
    parentCategories: ParentCategory[];
}

const CategoryCreate = ({ parentCategories }: CreateProps) => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        parent_id: '',
        is_active: true,
        sort_order: 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(categories.store().url);
    };

    return (
        <div className="mx-auto space-y-6 p-4">
            <Head title="Create Category" />

            <Heading
                title="Create Category"
                description="Add a new product category to your inventory"
            />

            <form onSubmit={submit} className="w-full space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>
                            Fill in the details for the new category.
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
                            <Label htmlFor="slug">Slug (Optional)</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) =>
                                    setData('slug', e.target.value)
                                }
                                placeholder="category-slug"
                            />
                            <InputError message={errors.slug} />
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
                                    {parentCategories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
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
                        <Button disabled={processing}>Create Category</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CategoryCreate;

CategoryCreate.layout = {
    breadcrumbs: [
        { title: 'Categories', href: categories.index() },
        { title: 'Create', href: categories.create().url },
    ],
};
