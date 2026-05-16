<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockAdjustment;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class StockAdjustmentService
{
    public function __construct(
        protected InventoryLedgerService $inventoryLedgerService
    ) {}

    /**
     * Get paginated stock adjustments.
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = StockAdjustment::with(['product', 'user'])->latest();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (!empty($filters['sort'])) {
            $sort = $filters['sort'];
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $field = ltrim($sort, '-');
            
            $allowedSorts = ['quantity_change', 'type', 'created_at'];
            if (in_array($field, $allowedSorts)) {
                $query->orderBy($field, $direction);
            }
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Create a new stock adjustment.
     */
    public function adjustStock(array $data): StockAdjustment
    {
        return DB::transaction(function () use ($data) {
            $product = Product::findOrFail($data['product_id']);
            $quantityBefore = $product->quantity;
            
            // Determine sign
            $isNegative = in_array($data['type'], ['damage', 'theft', 'audit_loss', 'promo_sample']);
            $actualChange = $isNegative ? -abs($data['quantity_change']) : abs($data['quantity_change']);
            
            $quantityAfter = $quantityBefore + $actualChange;
            
            if ($quantityAfter < 0) {
                throw new \Exception("Stock cannot be negative.");
            }

            $adjustment = StockAdjustment::create([
                'product_id' => $data['product_id'],
                'user_id' => $data['user_id'] ?? auth()->id(),
                'quantity_change' => $actualChange,
                'type' => $data['type'],
                'reason' => $data['reason'] ?? null,
            ]);

            $product->update(['quantity' => $quantityAfter]);

            $this->inventoryLedgerService->record(
                $product->id,
                $quantityBefore,
                $quantityAfter,
                $adjustment
            );

            return $adjustment;
        });
    }
}
