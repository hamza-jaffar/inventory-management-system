<?php

namespace App\Services;

use App\Helpers\UniqueCodeHelper;
use App\Models\Product;
use App\Models\PurchaseOrder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PurchaseOrderService
{
    public function __construct(
        protected InventoryLedgerService $inventoryLedgerService
    ) {
    }
    /**
     * Get paginated and filtered purchase orders.
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = PurchaseOrder::query()
            ->with(['supplier', 'items.product'])
            ->latest();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['sort'])) {
            $sort = $filters['sort'];
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $field = ltrim($sort, '-');

            $allowedSorts = ['po_number', 'total_cost', 'status', 'ordered_at', 'received_at'];
            if (in_array($field, $allowedSorts)) {
                $query->orderBy($field, $direction);
            }
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new purchase order with items.
     */
    public function createPurchaseOrder(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data) {
            $poNumber = UniqueCodeHelper::generate(
                PurchaseOrder::class,
                'PO-' . date('Y'),
                'po_number',
                6
            );

            $purchaseOrder = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $data['supplier_id'],
                'status' => 'ordered',
                'ordered_at' => now(),
                'total_cost' => 0, // Will be calculated below
            ]);

            $totalCost = 0;

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity_ordered'] * $item['unit_cost'];
                $totalCost += $subtotal;

                $purchaseOrder->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity_ordered' => $item['quantity_ordered'],
                    'quantity_received' => 0,
                    'unit_cost' => $item['unit_cost'],
                ]);
            }

            $purchaseOrder->update(['total_cost' => $totalCost]);

            return $purchaseOrder;
        });
    }

    /**
     * Mark a purchase order as received and update stock.
     */
    public function receivePurchaseOrder(PurchaseOrder $purchaseOrder, array $receivedItems): PurchaseOrder
    {
        return DB::transaction(function () use ($purchaseOrder, $receivedItems) {
            $allReceived = true;
            $anyReceived = false;

            foreach ($receivedItems as $itemData) {
                $item = $purchaseOrder->items()->find($itemData['id']);

                if (!$item)
                    continue;

                $receivedQty = (int) $itemData['quantity_received'];

                // Calculate how much new stock is being added in this transaction
                $newlyReceivedQty = $receivedQty - $item->quantity_received;

                if ($newlyReceivedQty > 0) {
                    $item->update(['quantity_received' => $receivedQty]);

                    // Add newly received quantity to the product stock
                    $product = $item->product;
                    $quantityBefore = $product->quantity;
                    $quantityAfter = $quantityBefore + $newlyReceivedQty;
                    $product->update(['quantity' => $quantityAfter]);

                    $this->inventoryLedgerService->record(
                        $product->id,
                        $quantityBefore,
                        $quantityAfter,
                        $purchaseOrder // The source is the PO
                    );

                    // Update cost_price to the latest purchase price
                    $product->update(['cost_price' => $item->unit_cost]);
                }

                if ($receivedQty > 0) {
                    $anyReceived = true;
                }

                if ($receivedQty < $item->quantity_ordered) {
                    $allReceived = false;
                }
            }

            if ($allReceived) {
                $status = 'received';
            } elseif ($anyReceived) {
                $status = 'partially_received';
            } else {
                $status = 'ordered';
            }

            $purchaseOrder->update([
                'status' => $status,
                'received_at' => $allReceived ? now() : $purchaseOrder->received_at,
            ]);

            return $purchaseOrder;
        });
    }

    /**
     * Cancel a purchase order.
     */
    public function cancelPurchaseOrder(PurchaseOrder $purchaseOrder): PurchaseOrder
    {
        return DB::transaction(function () use ($purchaseOrder) {
            if (in_array($purchaseOrder->status, ['ordered', 'partially_received', 'received'])) {
                foreach ($purchaseOrder->items as $item) {
                    if ($item->quantity_received > 0) {
                        $product = $item->product;
                        $quantityBefore = $product->quantity;
                        $quantityAfter = $quantityBefore - $item->quantity_received;

                        $product->update(['quantity' => $quantityAfter]);
                        $item->update(['quantity_received' => 0]);

                        $this->inventoryLedgerService->record(
                            $product->id,
                            $quantityBefore,
                            $quantityAfter,
                            $purchaseOrder // The source is the PO
                        );
                    }
                }
            }

            $purchaseOrder->update([
                'status' => 'cancelled',
            ]);

            return $purchaseOrder;
        });
    }
}
