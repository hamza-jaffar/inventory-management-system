<?php

namespace App\Services;

use App\Models\InventoryLedger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class InventoryLedgerService
{
    /**
     * Get paginated ledger entries.
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = InventoryLedger::with(['product', 'source'])->latest();

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['source_type'])) {
            $query->where('source_type', 'like', '%' . $filters['source_type'] . '%');
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
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
            
            $allowedSorts = ['quantity_before', 'quantity_after', 'variance', 'created_at'];
            if (in_array($field, $allowedSorts)) {
                $query->orderBy($field, $direction);
            }
        }

        return $query->paginate($perPage)->withQueryString();
    }
    /**
     * Record an inventory change in the ledger.
     */
    public function record(
        int $productId,
        int $quantityBefore,
        int $quantityAfter,
        Model $source
    ): InventoryLedger {
        return InventoryLedger::create([
            'product_id' => $productId,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'variance' => $quantityAfter - $quantityBefore,
            'source_type' => $source->getMorphClass(),
            'source_id' => $source->getKey(),
        ]);
    }
}
