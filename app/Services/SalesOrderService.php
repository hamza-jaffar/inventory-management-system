<?php

namespace App\Services;

use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SalesOrderService
{
    public function __construct(
        protected InventoryLedgerService $inventoryLedgerService
    ) {}

    /**
     * Create a new sales order and update inventory.
     */
    public function createOrder(array $data): SalesOrder
    {
        return DB::transaction(function () use ($data) {
            // 1. Generate Order Number
            $data['order_number'] = 'INV-'.strtoupper(Str::random(8));
            $data['cashier_id'] = auth()->id();

            // 2. Create Sales Order
            $order = SalesOrder::create($data);

            // 3. Process Items
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Create Order Item
                SalesOrderItem::create([
                    'sales_order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);

                // Update Inventory
                $oldQuantity = $product->quantity;
                $newQuantity = $oldQuantity - $item['quantity'];

                $product->update(['quantity' => $newQuantity]);

                // Record in Ledger
                $this->inventoryLedgerService->record(
                    $product->id,
                    $oldQuantity,
                    $newQuantity,
                    $order,
                    "Sale Order #{$order->order_number}"
                );
            }

            return $order;
        });
    }

    /**
     * Get paginated sales orders.
     */
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        return SalesOrder::with(['cashier', 'items.product'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('order_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }
}
