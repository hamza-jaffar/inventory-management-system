<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware(['permission:' . \App\Enums\PermissionEnum::MANAGE_USERS->value])->group(function () {
        Route::resource('users', \App\Http\Controllers\UserController::class)->only(['index', 'update']);
    });

    Route::middleware(['permission:' . \App\Enums\PermissionEnum::VIEW_CATEGORIES->value])->group(function () {
        Route::resource('categories', CategoryController::class);
        Route::patch('categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('categories.toggle-status');
    });

    Route::middleware(['permission:' . \App\Enums\PermissionEnum::VIEW_SUPPLIERS->value])->group(function () {
        Route::resource('suppliers', SupplierController::class);
        Route::patch('suppliers/{supplier}/toggle-status', [SupplierController::class, 'toggleStatus'])->name('suppliers.toggle-status');
    });

    Route::middleware(['permission:' . \App\Enums\PermissionEnum::VIEW_PRODUCTS->value])->group(function () {
        Route::resource('products', ProductController::class);
        Route::patch('products/{product}/toggle-status', [ProductController::class, 'toggleStatus'])->name('products.toggle-status');
    });

    Route::middleware(['permission:' . \App\Enums\PermissionEnum::VIEW_PURCHASES->value])->group(function () {
        Route::resource('purchase-orders', App\Http\Controllers\PurchaseOrderController::class)->except(['edit', 'update', 'destroy']);
        Route::post('purchase-orders/{purchase_order}/receive', [App\Http\Controllers\PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
        Route::post('purchase-orders/{purchase_order}/cancel', [App\Http\Controllers\PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
    });

    Route::middleware(['permission:' . \App\Enums\PermissionEnum::VIEW_ADJUSTMENTS->value])->group(function () {
        Route::resource('stock-adjustments', App\Http\Controllers\StockAdjustmentController::class)->only(['index', 'create', 'store']);
    });

    Route::middleware(['permission:' . \App\Enums\PermissionEnum::VIEW_LEDGERS->value])->group(function () {
        Route::get('inventory-ledgers', [App\Http\Controllers\InventoryLedgerController::class, 'index'])->name('inventory-ledgers.index');
    });
});

require __DIR__ . '/settings.php';
