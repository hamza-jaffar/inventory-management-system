<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'product_id',
    'quantity_before',
    'quantity_after',
    'variance',
    'source_type',
    'source_id',
    'notes',
])]
class InventoryLedger extends Model
{
    /**
     * Get the product associated with the ledger entry.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the parent source model (SalesOrder, StockAdjustment, etc.).
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}
