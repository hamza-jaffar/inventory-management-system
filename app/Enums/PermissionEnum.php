<?php

namespace App\Enums;

enum PermissionEnum: string
{
    // Dashboard
    case VIEW_DASHBOARD = 'view dashboard';

    // Categories
    case VIEW_CATEGORIES = 'view categories';
    case CREATE_CATEGORIES = 'create categories';
    case EDIT_CATEGORIES = 'edit categories';
    case DELETE_CATEGORIES = 'delete categories';

    // Suppliers
    case VIEW_SUPPLIERS = 'view suppliers';
    case CREATE_SUPPLIERS = 'create suppliers';
    case EDIT_SUPPLIERS = 'edit suppliers';
    case DELETE_SUPPLIERS = 'delete suppliers';

    // Products
    case VIEW_PRODUCTS = 'view products';
    case CREATE_PRODUCTS = 'create products';
    case EDIT_PRODUCTS = 'edit products';
    case DELETE_PRODUCTS = 'delete products';

    // Purchase Orders
    case VIEW_PURCHASES = 'view purchases';
    case CREATE_PURCHASES = 'create purchases';
    case EDIT_PURCHASES = 'edit purchases';
    case DELETE_PURCHASES = 'delete purchases';

    // Stock Adjustments
    case VIEW_ADJUSTMENTS = 'view adjustments';
    case CREATE_ADJUSTMENTS = 'create adjustments';
    case EDIT_ADJUSTMENTS = 'edit adjustments';
    case DELETE_ADJUSTMENTS = 'delete adjustments';

    // Inventory Ledgers
    case VIEW_LEDGERS = 'view ledgers';

    // POS / Sales
    case VIEW_POS = 'view pos';
    case CREATE_SALE = 'create sale';
    case VIEW_SALES = 'view sales';

    // System Settings & Users
    case MANAGE_USERS = 'manage users';
    case MANAGE_ROLES = 'manage roles';
    case MANAGE_PERMISSIONS = 'manage permissions';
    case MANAGE_SETTINGS = 'manage settings';

    /**
     * Group permissions for easier seeding and UI display.
     */
    public static function groupPermissions(): array
    {
        return [
            'Dashboard' => [
                self::VIEW_DASHBOARD,
            ],
            'Inventory Modules' => [
                self::VIEW_CATEGORIES, self::CREATE_CATEGORIES, self::EDIT_CATEGORIES, self::DELETE_CATEGORIES,
                self::VIEW_SUPPLIERS, self::CREATE_SUPPLIERS, self::EDIT_SUPPLIERS, self::DELETE_SUPPLIERS,
                self::VIEW_PRODUCTS, self::CREATE_PRODUCTS, self::EDIT_PRODUCTS, self::DELETE_PRODUCTS,
            ],
            'Purchasing' => [
                self::VIEW_PURCHASES, self::CREATE_PURCHASES, self::EDIT_PURCHASES, self::DELETE_PURCHASES,
            ],
            'Stock Management' => [
                self::VIEW_ADJUSTMENTS, self::CREATE_ADJUSTMENTS, self::EDIT_ADJUSTMENTS, self::DELETE_ADJUSTMENTS,
                self::VIEW_LEDGERS,
            ],
            'System Administration' => [
                self::MANAGE_USERS, self::MANAGE_ROLES, self::MANAGE_PERMISSIONS, self::MANAGE_SETTINGS,
            ],
        ];
    }
}
