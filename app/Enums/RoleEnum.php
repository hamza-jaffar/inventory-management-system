<?php

namespace App\Enums;

enum RoleEnum: string
{
    case ADMIN = 'admin';
    case INVENTORY_MANAGER = 'inventory-manager';
    case CASHIER = 'cashier';
    case VIEWER = 'viewer';

    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Administrator',
            self::INVENTORY_MANAGER => 'Inventory Manager',
            self::CASHIER => 'Cashier',
            self::VIEWER => 'Viewer',
        };
    }
}
