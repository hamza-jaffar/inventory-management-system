<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class CategoryService
{
    /**
     * Get paginated categories.
     */
    public function getPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return Category::with('parent')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * Get all active categories for dropdowns.
     */
    public function getActiveCategories(): Collection
    {
        return Category::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * Create a new category.
     */
    public function create(array $data): Category
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return Category::create($data);
    }

    /**
     * Update an existing category.
     */
    public function update(Category $category, array $data): Category
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $category;
    }

    /**
     * Delete a category.
     */
    public function delete(Category $category): bool
    {
        return $category->delete();
    }
}
