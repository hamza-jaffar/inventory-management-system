<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(
    'name',
    'sku',
    'barcode',
    'slug',
    'description',
    'quantity',
    'safety_stock',
    'cost_price',
    'sale_price',
    'retail_price',
    'category_id',
    'supplier_id',
    'is_active',
    'image_path'
)]
class Product extends Model
{
    use SoftDeletes;

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
