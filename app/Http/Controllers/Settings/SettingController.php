<?php

namespace App\Http\Controllers\Settings;

use App\Enums\SettingEnum;
use App\Http\Controllers\Controller;
use App\Services\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $validated = $request->validate($rules);

        foreach ($validated as $key => $value) {
            SettingService::setSetting($key, $value);
        }

        return back()->with('status', 'settings-updated');
    }
}
