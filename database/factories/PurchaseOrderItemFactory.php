<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseOrderItemFactory extends Factory
{
    public function definition(): array
    {
        $qtyOrdered = fake()->numberBetween(10, 100);
        $qtyReceived = fake()->numberBetween(0, $qtyOrdered);

        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'product_id' => Product::factory(),
            'quantity_ordered' => $qtyOrdered,
            'quantity_received' => $qtyReceived,
            'unit_cost' => fake()->randomFloat(2, 5, 500),
        ];
    }
}
