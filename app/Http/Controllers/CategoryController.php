<?php

namespace App\Http\Controllers;

use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return inertia('categories/index', [
            'categories' => $this->categoryService->getPaginated(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return inertia('categories/create', [
            'parentCategories' => $this->categoryService->getActiveCategories(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $this->categoryService->create($request->validated());

        return redirect()->route('categories.index')
            ->with('status', 'category-created');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category): Response
    {
        return inertia('categories/show', [
            'category' => $category->load('parent', 'children'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category): Response
    {
        return inertia('categories/edit', [
            'category' => $category,
            'parentCategories' => $this->categoryService->getActiveCategories()
                ->where('id', '!=', $category->id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $this->categoryService->update($category, $request->validated());

        return redirect()->route('categories.index')
            ->with('status', 'category-updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $this->categoryService->delete($category);

        return redirect()->route('categories.index')
            ->with('status', 'category-deleted');
    }
}
