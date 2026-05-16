<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesOrder extends Model
{
    protected $fillable = [
        'order_number',
        'cashier_id',
        'sub_total',
        'discount',
        'tax',
        'grand_total',
        'paid_amount',
        'change_amount',
        'payment_method',
        'order_status',
        'notes',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
