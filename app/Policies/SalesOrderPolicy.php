<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\SalesOrder;
use App\Models\User;

class SalesOrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can(PermissionEnum::VIEW_SALES->value) || $user->can(PermissionEnum::VIEW_POS->value);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SalesOrder $salesOrder): bool
    {
        return $user->can(PermissionEnum::VIEW_SALES->value) || $user->can(PermissionEnum::VIEW_POS->value);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can(PermissionEnum::CREATE_SALE->value);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SalesOrder $salesOrder): bool
    {
        return false; // Sales orders are usually immutable once completed
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SalesOrder $salesOrder): bool
    {
        return false;
    }
}
