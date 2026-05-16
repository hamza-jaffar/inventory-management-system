<?php

namespace App\Services;

use App\Helpers\UniqueCodeHelper;
use App\Models\Supplier;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SupplierService
{
    /**
     * Get paginated suppliers with filters.
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Supplier::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('contact_name', 'like', "%{$search}%");
                });
            })
            ->when($filters['sort'] ?? null, function ($query, $sort) {
                $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
                $field = ltrim($sort, '-');
                $query->orderBy($field, $direction);
            }, function ($query) {
                $query->orderBy('name');
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Toggle supplier status.
     */
    public function toggleStatus(Supplier $supplier): Supplier
    {
        $supplier->update(['is_active' => ! $supplier->is_active]);

        return $supplier;
    }

    /**
     * Get all active suppliers for dropdowns.
     */
    public function getActiveSuppliers(): Collection
    {
        return Supplier::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * Create a new supplier.
     */
    public function create(array $data): Supplier
    {
        $data['code'] = UniqueCodeHelper::generate(Supplier::class, 'SUP');

        return Supplier::create($data);
    }

    /**
     * Update an existing supplier.
     */
    public function update(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);

        return $supplier;
    }

    /**
     * Delete a supplier.
     */
    public function delete(Supplier $supplier): bool
    {
        return $supplier->delete();
    }
}
