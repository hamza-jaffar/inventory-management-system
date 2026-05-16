<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Permissions
        foreach (PermissionEnum::cases() as $permission) {
            Permission::findOrCreate($permission->value);
        }

        // 2. Create Roles and Assign Permissions

        // --- ADMIN ---
        // Admin gets all permissions dynamically
        $adminRole = Role::findOrCreate(RoleEnum::ADMIN->value);
        $adminRole->givePermissionTo(Permission::all());

        // --- INVENTORY MANAGER ---
        $managerRole = Role::findOrCreate(RoleEnum::INVENTORY_MANAGER->value);
        $managerRole->givePermissionTo([
            PermissionEnum::VIEW_DASHBOARD->value,
            
            PermissionEnum::VIEW_CATEGORIES->value,
            PermissionEnum::CREATE_CATEGORIES->value,
            PermissionEnum::EDIT_CATEGORIES->value,
            PermissionEnum::DELETE_CATEGORIES->value,

            PermissionEnum::VIEW_SUPPLIERS->value,
            PermissionEnum::CREATE_SUPPLIERS->value,
            PermissionEnum::EDIT_SUPPLIERS->value,
            PermissionEnum::DELETE_SUPPLIERS->value,

            PermissionEnum::VIEW_PRODUCTS->value,
            PermissionEnum::CREATE_PRODUCTS->value,
            PermissionEnum::EDIT_PRODUCTS->value,
            PermissionEnum::DELETE_PRODUCTS->value,

            PermissionEnum::VIEW_PURCHASES->value,
            PermissionEnum::CREATE_PURCHASES->value,
            PermissionEnum::EDIT_PURCHASES->value,
            PermissionEnum::DELETE_PURCHASES->value,

            PermissionEnum::VIEW_ADJUSTMENTS->value,
            PermissionEnum::CREATE_ADJUSTMENTS->value,
            PermissionEnum::EDIT_ADJUSTMENTS->value,
            PermissionEnum::DELETE_ADJUSTMENTS->value,

            PermissionEnum::VIEW_LEDGERS->value,
        ]);

        // --- CASHIER ---
        $cashierRole = Role::findOrCreate(RoleEnum::CASHIER->value);
        $cashierRole->givePermissionTo([
            PermissionEnum::VIEW_DASHBOARD->value,
            PermissionEnum::VIEW_PRODUCTS->value, // Can see products to sell them
        ]);

        // --- VIEWER ---
        $viewerRole = Role::findOrCreate(RoleEnum::VIEWER->value);
        $viewerRole->givePermissionTo([
            PermissionEnum::VIEW_DASHBOARD->value,
            PermissionEnum::VIEW_CATEGORIES->value,
            PermissionEnum::VIEW_SUPPLIERS->value,
            PermissionEnum::VIEW_PRODUCTS->value,
            PermissionEnum::VIEW_PURCHASES->value,
            PermissionEnum::VIEW_ADJUSTMENTS->value,
            PermissionEnum::VIEW_LEDGERS->value,
        ]);
    }
}
