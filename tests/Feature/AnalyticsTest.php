<?php

use App\Enums\PermissionEnum;
use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\StockAdjustment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed Spatie roles and permissions
    $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
});

test('guest cannot access analytics or standalone reports', function () {
    $this->get(route('analytics.index'))->assertRedirect('/login');
    $this->get(route('analytics.export'))->assertRedirect('/login');
    $this->get(route('reports.stock-adjustments'))->assertRedirect('/login');
    $this->get(route('reports.inventory-ledger'))->assertRedirect('/login');
    $this->get(route('reports.sales-history'))->assertRedirect('/login');
});

test('unauthorized user cannot manage analytics or reports', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('analytics.index'))->assertStatus(403);
    $this->actingAs($user)->get(route('analytics.export'))->assertStatus(403);
    $this->actingAs($user)->get(route('reports.stock-adjustments'))->assertStatus(403);
});

test('authorized user can view analytics and export all PDF reports', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(PermissionEnum::VIEW_ANALYTICS->value);
    $user->givePermissionTo(PermissionEnum::VIEW_REPORTS->value);

    // Create a dummy product, adjustment, and sales order to ensure data exists
    $product = Product::factory()->create([
        'name' => 'Premium Test Product',
        'sku' => 'PRM-TST-001',
        'quantity' => 15,
        'safety_stock' => 5,
        'cost_price' => 10.00,
        'sale_price' => 20.00,
    ]);

    StockAdjustment::create([
        'product_id' => $product->id,
        'user_id' => $user->id,
        'quantity_change' => 5,
        'type' => 'addition',
        'reason' => 'Restock',
    ]);

    SalesOrder::create([
        'order_number' => 'SO-10001',
        'cashier_id' => $user->id,
        'sub_total' => 20.00,
        'discount' => 0,
        'tax' => 0,
        'grand_total' => 20.00,
        'paid_amount' => 20.00,
        'change_amount' => 0,
        'payment_method' => 'cash',
        'order_status' => 'completed',
    ]);

    // 1. Visit index page
    $response = $this->actingAs($user)->get(route('analytics.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('analytics/index')
        ->has('analytics.sales')
        ->has('analytics.stock_status')
        ->has('analytics.financials')
    );

    // 2. Export analytics PDF
    $response = $this->actingAs($user)->get(route('analytics.export'));
    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');

    // 3. Export Stock Adjustments PDF
    $response = $this->actingAs($user)->get(route('reports.stock-adjustments'));
    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');

    // 4. Export Inventory Ledger PDF
    $response = $this->actingAs($user)->get(route('reports.inventory-ledger'));
    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');

    // 5. Export Sales History PDF
    $response = $this->actingAs($user)->get(route('reports.sales-history'));
    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});
