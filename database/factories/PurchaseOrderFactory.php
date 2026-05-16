<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Helpers\UniqueCodeHelper;

class PurchaseOrderFactory extends Factory
{
    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'ordered', 'partially_received', 'received', 'cancelled']);
        
        $orderedAt = in_array($status, ['ordered', 'partially_received', 'received']) ? fake()->dateTimeBetween('-2 months', '-1 month') : null;
        $receivedAt = in_array($status, ['partially_received', 'received']) ? fake()->dateTimeBetween('-1 month', 'now') : null;

        return [
            'po_number' => UniqueCodeHelper::generate(PurchaseOrder::class, 'PO-' . date('Y'), 'po_number', 6),
            'supplier_id' => Supplier::factory(),
            'status' => $status,
            'total_cost' => fake()->randomFloat(2, 100, 10000),
            'ordered_at' => $orderedAt,
            'received_at' => $receivedAt,
        ];
    }
}
