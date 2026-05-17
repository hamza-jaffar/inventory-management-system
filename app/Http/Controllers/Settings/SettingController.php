<?php

namespace App\Http\Controllers\Settings;

use App\Enums\SettingEnum;
use App\Helpers\StorageHelper;
use App\Http\Controllers\Controller;
use App\Services\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        return inertia('settings/setting', [
            'settings' => SettingService::allSettings(),
        ]);
    }

    /**
     * Update the settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $rules = [];

        foreach (SettingEnum::cases() as $case) {
            $rules[$case->value] = 'nullable|string|max:255';
        }

        // Override logo field to accept file upload
        $rules['app_logo_url'] = 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048';

        $validated = $request->validate($rules);

        // Handle logo upload separately
        if ($request->hasFile('app_logo_url')) {
            $oldLogoUrl = SettingService::getSetting(SettingEnum::APP_LOGO_URL);

            // Delete old logo if it was a locally stored path (not an external URL)
            if ($oldLogoUrl && ! str_starts_with((string) $oldLogoUrl, 'http')) {
                StorageHelper::delete($oldLogoUrl);
            }

            $path = StorageHelper::upload($request->file('app_logo_url'), 'logos');
            $validated['app_logo_url'] = StorageHelper::url($path);
        } else {
            // Don't overwrite the existing logo URL when no new file is uploaded
            unset($validated['app_logo_url']);
        }

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                SettingService::setSetting($key, $value);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Business settings updated successfully.')]);

        return back()->with('status', 'settings-updated');
    }
}
