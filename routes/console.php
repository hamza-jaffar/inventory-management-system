<?php

use App\Enums\SettingEnum;
use App\Models\Backup;
use App\Services\SettingService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-backup scheduler — respects the backup_frequency_days setting.
Schedule::call(function () {
    $enabled = SettingService::getSetting(SettingEnum::BACKUP_ENABLED, 'true');
    $frequencyDays = (int) SettingService::getSetting(SettingEnum::BACKUP_FREQUENCY_DAYS, 7);

    if ($enabled !== 'true' || $frequencyDays < 1) {
        return;
    }

    $lastBackup = Backup::where('type', 'auto')
        ->where('status', 'completed')
        ->latest()
        ->first();

    $shouldRun = ! $lastBackup || $lastBackup->created_at->addDays($frequencyDays)->isPast();

    if ($shouldRun) {
        Artisan::call('backup:run', ['--type' => 'auto']);
    }
})->daily()->name('auto-backup')->withoutOverlapping();
