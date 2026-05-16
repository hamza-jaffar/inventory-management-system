<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign the admin role
        if (!$admin->hasRole(RoleEnum::ADMIN->value)) {
            $admin->assignRole(RoleEnum::ADMIN->value);
        }

        // Create a test Inventory Manager
        $manager = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Inventory Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$manager->hasRole(RoleEnum::INVENTORY_MANAGER->value)) {
            $manager->assignRole(RoleEnum::INVENTORY_MANAGER->value);
        }

        // Create a test Cashier
        $cashier = User::firstOrCreate(
            ['email' => 'cashier@example.com'],
            [
                'name' => 'Store Cashier',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$cashier->hasRole(RoleEnum::CASHIER->value)) {
            $cashier->assignRole(RoleEnum::CASHIER->value);
        }
    }
}
