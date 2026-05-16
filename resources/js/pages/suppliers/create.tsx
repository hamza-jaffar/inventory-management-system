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
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import React, { FormEventHandler } from 'react';
import * as suppliersRoutes from '@/routes/suppliers';

const SupplierCreate = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        tax_number: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_region: '',
        postal_code: '',
        country: '',
        lead_time_days: 0,
        payment_terms: '',
        notes: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(suppliersRoutes.store().url);
    };

    return (
        <div className="mx-auto space-y-6 p-4">
            <Head title="Create Supplier" />

            <Heading
                title="Create Supplier"
                description="Add a new supplier to your directory"
            />

            <form onSubmit={submit} className="w-full space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>General supplier details and contact person.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Company Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Supplier Name"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tax_number">Tax Number</Label>
                                <Input
                                    id="tax_number"
                                    value={data.tax_number}
                                    onChange={(e) => setData('tax_number', e.target.value)}
                                    placeholder="VAT / Tax ID"
                                />
                                <InputError message={errors.tax_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_name">Contact Person</Label>
                                <Input
                                    id="contact_name"
                                    value={data.contact_name}
                                    onChange={(e) => setData('contact_name', e.target.value)}
                                    placeholder="Name of contact person"
                                />
                                <InputError message={errors.contact_name} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="contact@supplier.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+1 234 567 890"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://www.supplier.com"
                                />
                                <InputError message={errors.website} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Address & Logistics</CardTitle>
                            <CardDescription>Shipping address and business terms.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="address_line_1">Address Line 1</Label>
                                <Input
                                    id="address_line_1"
                                    value={data.address_line_1}
                                    onChange={(e) => setData('address_line_1', e.target.value)}
                                    placeholder="Street address"
                                />
                                <InputError message={errors.address_line_1} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="City"
                                    />
                                    <InputError message={errors.city} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="state_region">State / Region</Label>
                                    <Input
                                        id="state_region"
                                        value={data.state_region}
                                        onChange={(e) => setData('state_region', e.target.value)}
                                        placeholder="State"
                                    />
                                    <InputError message={errors.state_region} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="ZIP / Postal Code"
                                    />
                                    <InputError message={errors.postal_code} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="Country"
                                    />
                                    <InputError message={errors.country} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                                    <Input
                                        id="lead_time_days"
                                        type="number"
                                        value={data.lead_time_days}
                                        onChange={(e) => setData('lead_time_days', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    <InputError message={errors.lead_time_days} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_terms">Payment Terms</Label>
                                    <Input
                                        id="payment_terms"
                                        value={data.payment_terms}
                                        onChange={(e) => setData('payment_terms', e.target.value)}
                                        placeholder="Net 30, COD, etc."
                                    />
                                    <InputError message={errors.payment_terms} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer font-medium">
                                    Active Supplier
                                </Label>
                                <InputError message={errors.is_active} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Any additional information about this supplier..."
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6">
                        <Button variant="ghost" asChild>
                            <Link href={suppliersRoutes.index().url}>Cancel</Link>
                        </Button>
                        <Button disabled={processing}>Create Supplier</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default SupplierCreate;

SupplierCreate.layout = {
    breadcrumbs: [
        { title: 'Suppliers', href: suppliersRoutes.index().url },
        { title: 'Create', href: suppliersRoutes.create().url },
    ],
};
