<?php

use App\Enums\SettingEnum;
use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

it('can set and get a setting', function () {
    $key = SettingEnum::APP_NAME;
    $value = 'My Inventory System';

    SettingService::setSetting($key, $value);

    expect(SettingService::getSetting($key))->toBe($value)
        ->and(Setting::where('key', $key->value)->first()->value)->toBe($value);
});

it('caches the setting value', function () {
    $key = SettingEnum::APP_CURRENCY;
    $value = 'USD';

    SettingService::setSetting($key, $value);

    // Verify cache has the value
    expect(Cache::get('setting:'.$key->value))->toBe($value);

    // Change database value directly to bypass service set (which updates cache)
    $setting = Setting::where('key', $key->value)->first();
    $setting->value = 'EUR';
    $setting->save();

    // Should still return cached value
    expect(SettingService::getSetting($key))->toBe($value);

    // Clear cache and check again
    Cache::forget('setting:'.$key->value);
    expect(SettingService::getSetting($key))->toBe('EUR');
});

it('can delete a setting and clear its cache', function () {
    $key = SettingEnum::APP_EMAIL;
    $value = 'admin@example.com';

    SettingService::setSetting($key, $value);
    expect(Cache::has('setting:'.$key->value))->toBeTrue();

    SettingService::forgetSetting($key);

    expect(Setting::where('key', $key->value)->exists())->toBeFalse()
        ->and(Cache::has('setting:'.$key->value))->toBeFalse();
});

it('can get all settings and caches them', function () {
    SettingService::setSetting(SettingEnum::APP_NAME, 'Test App');
    SettingService::setSetting(SettingEnum::APP_CURRENCY, 'GBP');

    $all = SettingService::allSettings();

    expect($all)->toBeCollection()
        ->and($all->get(SettingEnum::APP_NAME->value))->toBe('Test App')
        ->and($all->get(SettingEnum::APP_CURRENCY->value))->toBe('GBP');

    expect(Cache::has('setting:all'))->toBeTrue();
});

it('returns default value if setting does not exist', function () {
    $key = SettingEnum::APP_TIMEZONE;

    expect(SettingService::getSetting($key, 'UTC'))->toBe('UTC');
});
