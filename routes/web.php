<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\InventoryLedgerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\SalesOrderController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware(['permission:'.PermissionEnum::MANAGE_USERS->value])->group(function () {
        Route::resource('users', UserController::class)->only(['index', 'update']);
    });

    Route::middleware(['permission:'.PermissionEnum::VIEW_CATEGORIES->value])->group(function () {
        Route::resource('categories', CategoryController::class);
        Route::patch('categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('categories.toggle-status');
    });

    Route::middleware(['permission:'.PermissionEnum::VIEW_SUPPLIERS->value])->group(function () {
        Route::resource('suppliers', SupplierController::class);
        Route::patch('suppliers/{supplier}/toggle-status', [SupplierController::class, 'toggleStatus'])->name('suppliers.toggle-status');
    });

    Route::middleware(['permission:'.PermissionEnum::VIEW_PRODUCTS->value])->group(function () {
        Route::resource('products', ProductController::class);
        Route::patch('products/{product}/toggle-status', [ProductController::class, 'toggleStatus'])->name('products.toggle-status');
    });

    Route::middleware(['permission:'.PermissionEnum::VIEW_PURCHASES->value])->group(function () {
        Route::resource('purchase-orders', PurchaseOrderController::class)->except(['edit', 'update', 'destroy']);
        Route::post('purchase-orders/{purchase_order}/receive', [PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
        Route::post('purchase-orders/{purchase_order}/cancel', [PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
    });

    Route::middleware(['permission:'.PermissionEnum::VIEW_ADJUSTMENTS->value])->group(function () {
        Route::resource('stock-adjustments', StockAdjustmentController::class)->only(['index', 'create', 'store']);
    });

    Route::middleware(['permission:'.PermissionEnum::VIEW_LEDGERS->value])->group(function () {
        Route::get('inventory-ledgers', [InventoryLedgerController::class, 'index'])->name('inventory-ledgers.index');
    });

    // Sales & POS
    Route::middleware(['permission:'.PermissionEnum::VIEW_POS->value])->group(function () {
        Route::get('pos', [SalesOrderController::class, 'pos'])->name('sales.pos');
        Route::post('pos', [SalesOrderController::class, 'store'])->name('sales.store');
    });

    Route::middleware(['permission:'.PermissionEnum::VIEW_SALES->value])->group(function () {
        Route::get('sales', [SalesOrderController::class, 'index'])->name('sales.index');
    });
});

require __DIR__.'/settings.php';
