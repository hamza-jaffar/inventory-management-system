<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class PurchaseOrderSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = Supplier::all();
        $products = Product::all();

        if ($suppliers->isEmpty() || $products->isEmpty()) {
            $this->command->warn('No suppliers or products found. Skipping PurchaseOrder seeding.');
            return;
        }

        // Create 10 random Purchase Orders
        for ($i = 0; $i < 10; $i++) {
            $supplier = $suppliers->random();
            
            // Create PO
            $po = PurchaseOrder::factory()->create([
                'supplier_id' => $supplier->id,
            ]);

            // Add 1 to 5 items to this PO
            $numberOfItems = rand(1, 5);
            $poProducts = $products->where('supplier_id', $supplier->id);
            
            // If supplier has no specific products, pick random ones (even if technically incorrect by our new logic, just for seeding purposes).
            if ($poProducts->isEmpty()) {
                $poProducts = $products;
            }

            $selectedProducts = $poProducts->random(min($numberOfItems, $poProducts->count()));
            
            $totalCost = 0;

            foreach ($selectedProducts as $product) {
                // Ensure received doesn't exceed ordered depending on status
                $qtyOrdered = rand(10, 100);
                
                if ($po->status === 'received') {
                    $qtyReceived = $qtyOrdered;
                } elseif ($po->status === 'partially_received') {
                    $qtyReceived = rand(1, $qtyOrdered - 1);
                } else {
                    $qtyReceived = 0;
                }

                $item = PurchaseOrderItem::factory()->create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $product->id,
                    'quantity_ordered' => $qtyOrdered,
                    'quantity_received' => $qtyReceived,
                    'unit_cost' => $product->cost_price,
                ]);

                $totalCost += ($item->quantity_ordered * $item->unit_cost);
            }

            // Update PO total cost to reflect actual items
            $po->update(['total_cost' => $totalCost]);
        }
    }
}
