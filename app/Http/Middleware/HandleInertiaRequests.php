<?php

namespace App\Http\Middleware;

use App\Services\SettingService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = SettingService::allSettings();

        return [
            ...parent::share($request),
            'name' => $settings->get('app_name', config('app.name')),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
                'roles' => $request->user() ? $request->user()->getRoleNames() : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'settings' => [
                'app_name' => $settings->get('app_name', config('app.name')),
                'app_logo_url' => $settings->get('app_logo_url'),
                'app_currency_symbol' => $settings->get('app_currency_symbol', '$'),
                'app_currency' => $settings->get('app_currency', 'USD'),
                'app_address' => $settings->get('app_address'),
                'app_city' => $settings->get('app_city'),
                'app_state' => $settings->get('app_state'),
                'app_country' => $settings->get('app_country'),
                'app_phone' => $settings->get('app_phone'),
                'app_email' => $settings->get('app_email'),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'created_order' => $request->session()->get('created_order'),
            ],
        ];
    }
}
