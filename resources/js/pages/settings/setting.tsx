import { Head, useForm, router } from '@inertiajs/react';
import SettingController from '@/actions/App/Http/Controllers/Settings/SettingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import settings from '@/routes/settings';
import { useSettings } from '@/hooks/use-settings';
import { usePermissions } from '@/hooks/use-permissions';
import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2, Loader2, Database, Clock, PlayCircle } from 'lucide-react';

interface SettingsProps {
    settings: Record<string, string>;
}

export default function SettingPage({
    settings: initialSettings,
}: SettingsProps) {
    const { can } = usePermissions();
    const [backingUp, setBackingUp] = useState(false);
    const { app_logo_url: currentLogoUrl, app_name: companyName } =
        useSettings();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        currentLogoUrl,
    );

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        app_name: initialSettings.app_name || '',
        app_email: initialSettings.app_email || '',
        app_phone: initialSettings.app_phone || '',
        app_currency: initialSettings.app_currency || '',
        app_currency_symbol: initialSettings.app_currency_symbol || '',
        app_address: initialSettings.app_address || '',
        app_city: initialSettings.app_city || '',
        app_state: initialSettings.app_state || '',
        app_country: initialSettings.app_country || '',
        app_logo_url: null as File | null,
        backup_enabled: initialSettings.backup_enabled ?? 'true',
        backup_frequency_days: initialSettings.backup_frequency_days || '7',
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('app_logo_url', file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setData('app_logo_url', null);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(SettingController.update.url());
    };

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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6">
                        {/* Logo Upload Section */}
                        <div className="grid gap-4 rounded-lg border p-4">
                            <Heading
                                variant="small"
                                title="Company Logo"
                                description="Displayed in the sidebar and on documents"
                            />
                            <div className="flex items-start gap-6">
                                {/* Preview */}
                                <div
                                    className="relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted/80"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    {logoPreview ? (
                                        <>
                                            <img
                                                src={logoPreview}
                                                alt={companyName}
                                                className="h-full w-full object-contain p-1"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                                <p className="text-xs font-medium text-white">
                                                    Change
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-center">
                                            <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                            <p className="text-[10px] text-muted-foreground">
                                                Upload logo
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Instructions & Actions */}
                                <div className="flex flex-col gap-2 pt-1">
                                    <p className="text-sm text-muted-foreground">
                                        PNG, JPG, WEBP or SVG. Max 2MB.
                                        Recommended size: 200×200px.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <ImagePlus className="mr-2 h-4 w-4" />
                                            {logoPreview
                                                ? 'Change Logo'
                                                : 'Upload Logo'}
                                        </Button>
                                        {logoPreview && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={removeLogo}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    {errors.app_logo_url && (
                                        <InputError
                                            message={errors.app_logo_url}
                                        />
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                            </div>
                        </div>

                        {/* Business Info Section */}
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="app_name">Business Name</Label>
                                <Input
                                    id="app_name"
                                    value={data.app_name}
                                    onChange={(e) =>
                                        setData('app_name', e.target.value)
                                    }
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
                                        type="email"
                                        value={data.app_email}
                                        onChange={(e) =>
                                            setData('app_email', e.target.value)
                                        }
                                        placeholder="contact@business.com"
                                    />
                                    <InputError message={errors.app_email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="app_phone">
                                        Business Phone
                                    </Label>
                                    <Input
                                        id="app_phone"
                                        value={data.app_phone}
                                        onChange={(e) =>
                                            setData('app_phone', e.target.value)
                                        }
                                        placeholder="+1 234 567 890"
                                    />
                                    <InputError message={errors.app_phone} />
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
                                        value={data.app_currency}
                                        onChange={(e) =>
                                            setData(
                                                'app_currency',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="USD"
                                    />
                                    <InputError message={errors.app_currency} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="app_currency_symbol">
                                        Currency Symbol
                                    </Label>
                                    <Input
                                        id="app_currency_symbol"
                                        value={data.app_currency_symbol}
                                        onChange={(e) =>
                                            setData(
                                                'app_currency_symbol',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="$"
                                    />
                                    <InputError
                                        message={errors.app_currency_symbol}
                                    />
                                </div>
                            </div>
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
                                    value={data.app_address}
                                    onChange={(e) =>
                                        setData('app_address', e.target.value)
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
                                        value={data.app_city}
                                        onChange={(e) =>
                                            setData('app_city', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.app_city} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="app_state">State</Label>
                                    <Input
                                        id="app_state"
                                        value={data.app_state}
                                        onChange={(e) =>
                                            setData('app_state', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.app_state} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="app_country">Country</Label>
                                    <Input
                                        id="app_country"
                                        value={data.app_country}
                                        onChange={(e) =>
                                            setData(
                                                'app_country',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.app_country} />
                                </div>
                            </div>
                        </div>

                        {/* Database Backups Section */}
                        {can('manage backups') && (
                            <div className="grid gap-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <Heading
                                        variant="small"
                                        title="Database Backups"
                                        description="Configure automated backups and trigger manual snapshots of your database"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        disabled={backingUp}
                                        onClick={() => {
                                            setBackingUp(true);
                                            router.post('/backups', {}, {
                                                onFinish: () => setBackingUp(false),
                                            });
                                        }}
                                        className="transition-all hover:scale-102 hover:shadow-sm"
                                    >
                                        {backingUp ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Backing up...
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                                Run Backup Now
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="grid gap-6 rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="backup_enabled"
                                            checked={data.backup_enabled === 'true'}
                                            onCheckedChange={(checked) =>
                                                setData('backup_enabled', checked ? 'true' : 'false')
                                            }
                                            className="mt-1"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor="backup_enabled"
                                                className="text-sm font-semibold cursor-pointer select-none"
                                            >
                                                Enable Automated Backups
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                When enabled, the system will automatically run background snapshots of your database at set intervals.
                                            </p>
                                        </div>
                                    </div>

                                    {data.backup_enabled === 'true' && (
                                        <div className="grid gap-2 pl-7 max-w-xs animate-in fade-in slide-in-from-top-2 duration-200">
                                            <Label htmlFor="backup_frequency_days" className="text-sm font-medium">
                                                Backup Interval (Days)
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="backup_frequency_days"
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={data.backup_frequency_days}
                                                    onChange={(e) =>
                                                        setData('backup_frequency_days', e.target.value)
                                                    }
                                                    className="w-24 font-mono font-medium"
                                                />
                                                <span className="text-sm text-muted-foreground">days</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" />
                                                Recommended: 1 day for active production systems, 7 days for staging.
                                            </p>
                                            <InputError message={errors.backup_frequency_days} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 border-t pt-4">
                            <Button disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                        Saving...
                                    </>
                                ) : (
                                    'Save Business Settings'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
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
