import { Form, Head } from '@inertiajs/react';
import SettingController from '@/actions/App/Http/Controllers/Settings/SettingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import settings from '@/routes/settings';

interface SettingsProps {
    settings: Record<string, string>;
}

export default function SettingPage({
    settings: initialSettings,
}: SettingsProps) {
    return (
        <>
            <Head title="Business settings" />

            <h1 className="sr-only">Business settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Business information"
                    description="Update your business details and regional preferences"
                />

                <Form
                    {...SettingController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <div className="grid gap-6">
                            {/* Business Info Section */}
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="app_name">
                                        Business Name
                                    </Label>
                                    <Input
                                        id="app_name"
                                        name="app_name"
                                        defaultValue={initialSettings.app_name}
                                        placeholder="e.g. Acme Corp"
                                    />
                                    <InputError message={errors.app_name} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_email">
                                            Business Email
                                        </Label>
                                        <Input
                                            id="app_email"
                                            name="app_email"
                                            type="email"
                                            defaultValue={
                                                initialSettings.app_email
                                            }
                                            placeholder="contact@business.com"
                                        />
                                        <InputError
                                            message={errors.app_email}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_phone">
                                            Business Phone
                                        </Label>
                                        <Input
                                            id="app_phone"
                                            name="app_phone"
                                            defaultValue={
                                                initialSettings.app_phone
                                            }
                                            placeholder="+1 234 567 890"
                                        />
                                        <InputError
                                            message={errors.app_phone}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Regional Settings Section */}
                            <div className="grid gap-4 border-t pt-4">
                                <Heading
                                    variant="small"
                                    title="Regional settings"
                                    description="Configure currency and localization"
                                />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_currency">
                                            Currency Code
                                        </Label>
                                        <Input
                                            id="app_currency"
                                            name="app_currency"
                                            defaultValue={
                                                initialSettings.app_currency
                                            }
                                            placeholder="USD"
                                        />
                                        <InputError
                                            message={errors.app_currency}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_currency_symbol">
                                            Currency Symbol
                                        </Label>
                                        <Input
                                            id="app_currency_symbol"
                                            name="app_currency_symbol"
                                            defaultValue={
                                                initialSettings.app_currency_symbol
                                            }
                                            placeholder="$"
                                        />
                                        <InputError
                                            message={errors.app_currency_symbol}
                                        />
                                    </div>
                                </div>

                                {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_timezone">
                                            Timezone
                                        </Label>
                                        <Input
                                            id="app_timezone"
                                            name="app_timezone"
                                            defaultValue={
                                                initialSettings.app_timezone
                                            }
                                            placeholder="UTC"
                                        />
                                        <InputError
                                            message={errors.app_timezone}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_language">
                                            Default Language
                                        </Label>
                                        <Input
                                            id="app_language"
                                            name="app_language"
                                            defaultValue={
                                                initialSettings.app_language
                                            }
                                            placeholder="English"
                                        />
                                        <InputError
                                            message={errors.app_language}
                                        />
                                    </div>
                                </div> */}
                            </div>

                            {/* Address Section */}
                            <div className="grid gap-4 border-t pt-4">
                                <Heading
                                    variant="small"
                                    title="Location & Address"
                                    description="Physical address details"
                                />
                                <div className="grid gap-2">
                                    <Label htmlFor="app_address">Address</Label>
                                    <Input
                                        id="app_address"
                                        name="app_address"
                                        defaultValue={
                                            initialSettings.app_address
                                        }
                                        placeholder="123 Street Name"
                                    />
                                    <InputError message={errors.app_address} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_city">City</Label>
                                        <Input
                                            id="app_city"
                                            name="app_city"
                                            defaultValue={
                                                initialSettings.app_city
                                            }
                                        />
                                        <InputError message={errors.app_city} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_state">State</Label>
                                        <Input
                                            id="app_state"
                                            name="app_state"
                                            defaultValue={
                                                initialSettings.app_state
                                            }
                                        />
                                        <InputError
                                            message={errors.app_state}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_country">
                                            Country
                                        </Label>
                                        <Input
                                            id="app_country"
                                            name="app_country"
                                            defaultValue={
                                                initialSettings.app_country
                                            }
                                        />
                                        <InputError
                                            message={errors.app_country}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 border-t pt-4">
                                <Button disabled={processing}>
                                    Save Business Settings
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </>
    );
}

SettingPage.layout = {
    breadcrumbs: [
        {
            title: 'Business settings',
            href: settings.index(),
        },
    ],
};
