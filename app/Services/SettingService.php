<?php

namespace App\Services;

use App\Enums\SettingEnum;
use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    /**
     * The cache prefix for settings.
     */
    private const string CACHE_PREFIX = 'setting:';

    /**
     * The cache TTL in seconds (24 hours).
     */
    private const int CACHE_TTL = 86400;

    /**
     * Get a setting value by its enum or string key.
     */
    public static function getSetting(SettingEnum|string $key, mixed $default = null): mixed
    {
        $keyName = $key instanceof SettingEnum ? $key->value : $key;

        return Cache::remember(
            self::CACHE_PREFIX.$keyName,
            self::CACHE_TTL,
            function () use ($keyName, $default) {
                $setting = Setting::where('key', $keyName)->first();

                return $setting ? $setting->value : $default;
            }
        );
    }

    /**
     * Set a setting value in the database and update the cache.
     */
    public static function setSetting(SettingEnum|string $key, mixed $value): Setting
    {
        $keyName = $key instanceof SettingEnum ? $key->value : $key;

        $setting = Setting::updateOrCreate(
            ['key' => $keyName],
            ['value' => $value]
        );

        // Update the cache immediately
        Cache::put(self::CACHE_PREFIX.$keyName, $value, self::CACHE_TTL);

        // Also invalidate the 'all' settings cache if you use one
        Cache::forget(self::CACHE_PREFIX.'all');

        return $setting;
    }

    /**
     * Remove a setting from the database and clear its cache.
     */
    public static function forgetSetting(SettingEnum|string $key): bool
    {
        $keyName = $key instanceof SettingEnum ? $key->value : $key;

        Cache::forget(self::CACHE_PREFIX.$keyName);
        Cache::forget(self::CACHE_PREFIX.'all');

        return (bool) Setting::where('key', $keyName)->delete();
    }

    /**
     * Get all settings as a key-value collection.
     *
     * @return Collection<string, mixed>
     */
    public static function allSettings(): Collection
    {
        $settings = Cache::get(self::CACHE_PREFIX.'all');

        if (! ($settings instanceof Collection)) {
            $settings = Setting::all()->pluck('value', 'key');
            Cache::put(self::CACHE_PREFIX.'all', $settings, self::CACHE_TTL);
        }

        return $settings;
    }

    /**
     * Flush all settings cache.
     */
    public static function flushCache(): void
    {
        foreach (SettingEnum::cases() as $case) {
            Cache::forget(self::CACHE_PREFIX.$case->value);
        }

        Cache::forget(self::CACHE_PREFIX.'all');
    }
}
