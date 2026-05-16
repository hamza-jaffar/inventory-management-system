<?php

namespace App\Services;

use App\Helpers\UniqueCodeHelper;
use App\Models\Supplier;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SupplierService
{
    /**
     * Get paginated suppliers.
     */
    public function getPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return Supplier::query()
            ->orderBy('name')
            ->paginate($perPage);
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
