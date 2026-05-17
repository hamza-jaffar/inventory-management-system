<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\SettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::middleware(['permission:'.PermissionEnum::MANAGE_SETTINGS->value])->group(function () {
        Route::get('settings/index', [SettingController::class, 'index'])->name('settings.index');
        Route::patch('settings/index', [SettingController::class, 'update'])->name('settings.update');
    });

    Route::middleware(['permission:'.PermissionEnum::MANAGE_BACKUPS->value])->group(function () {
        Route::get('backups', [BackupController::class, 'index'])->name('backups.index');
        Route::post('backups', [BackupController::class, 'store'])->name('backups.store');
        Route::get('backups/{backup}/download', [BackupController::class, 'download'])->name('backups.download');
        Route::delete('backups/{backup}', [BackupController::class, 'destroy'])->name('backups.destroy');
    });

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
