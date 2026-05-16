<?php

namespace App\Services;

use App\Helpers\SlugHelper;
use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CategoryService
{
    /**
     * Get paginated categories with filters.
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Category::with('parent')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($filters['sort'] ?? null, function ($query, $sort) {
                $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
                $field = ltrim($sort, '-');
                $query->orderBy($field, $direction);
            }, function ($query) {
                $query->orderBy('sort_order')->orderBy('name');
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Toggle category status.
     */
    public function toggleStatus(Category $category): Category
    {
        $category->update(['is_active' => ! $category->is_active]);

        return $category;
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
        $data['slug'] = SlugHelper::generate($data['name'], Category::class);

        return Category::create($data);
    }

    /**
     * Update an existing category.
     */
    public function update(Category $category, array $data): Category
    {
        if ($category->name !== $data['name']) {
            $data['slug'] = SlugHelper::generate($data['name'], Category::class);
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
