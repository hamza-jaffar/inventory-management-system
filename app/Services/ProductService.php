<?php

namespace App\Services;

use App\Helpers\SlugHelper;
use App\Helpers\StorageHelper;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    /**
     * Get all active products.
     */
    public function getActiveProducts()
    {
        return Product::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'cost_price', 'supplier_id']);
    }

    /**
     * Get paginated products with filters.
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Product::with(['category', 'supplier'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($filters['category_id'] ?? null, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($filters['sort'] ?? null, function ($query, $sort) {
                $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
                $field = ltrim($sort, '-');
                $query->orderBy($field, $direction);
            }, function ($query) {
                $query->latest();
            })
            ->paginate($perPage)
            ->through(function ($product) {
                $product->image_url = StorageHelper::url($product->image_path);

                return $product;
            })
            ->withQueryString();
    }

    /**
     * Create a new product.
     */
    public function create(array $data): Product
    {
        $data['slug'] = SlugHelper::generate($data['name'], Product::class);

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image_path'] = StorageHelper::upload($data['image'], 'products');
        }

        return Product::create($data);
    }

    /**
     * Update an existing product.
     */
    public function update(Product $product, array $data): Product
    {
        if ($product->name !== $data['name']) {
            $data['slug'] = SlugHelper::generate($data['name'], Product::class);
        }

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            // Delete old image
            StorageHelper::delete($product->image_path);
            $data['image_path'] = StorageHelper::upload($data['image'], 'products');
        }

        $product->update($data);

        return $product;
    }

    /**
     * Toggle product status.
     */
    public function toggleStatus(Product $product): Product
    {
        $product->update(['is_active' => ! $product->is_active]);

        return $product;
    }

    /**
     * Delete a product.
     */
    public function delete(Product $product): bool
    {
        StorageHelper::delete($product->image_path);

        return $product->delete();
    }
}
