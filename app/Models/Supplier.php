<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(
    'name',
    'code',
    'tax_number',
    'contact_name',
    'email',
    'phone',
    'website',
    'address_line_1',
    'address_line_2',
    'city',
    'state_region',
    'postal_code',
    'country',
    'lead_time_days',
    'payment_terms',
    'notes',
    'is_active'
)]
class Supplier extends Model
{
    use SoftDeletes;

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the purchase orders for the supplier.
     */
    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
