<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Product;
use App\Services\CategoryService;
use App\Services\ProductService;
use App\Services\SupplierService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Response;

class ProductController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:viewAny,App\Models\Product', only: ['index']),
            new Middleware('can:view,product', only: ['show']),
            new Middleware('can:create,App\Models\Product', only: ['create', 'store']),
            new Middleware('can:update,product', only: ['edit', 'update', 'toggleStatus']),
            new Middleware('can:delete,product', only: ['destroy']),
        ];
    }

    public function __construct(
        protected ProductService $productService,
        protected CategoryService $categoryService,
        protected SupplierService $supplierService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return inertia('products/index', [
            'products' => $this->productService->getPaginated($request->only(['search', 'sort', 'category_id'])),
            'filters' => $request->only(['search', 'sort', 'category_id']),
            'categories' => $this->categoryService->getActiveCategories(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return inertia('products/create', [
            'categories' => $this->categoryService->getActiveCategories(),
            'suppliers' => $this->supplierService->getActiveSuppliers(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $product = $this->productService->create($request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'product-created',
                'product' => $product,
            ]);
        }

        return redirect()->route('products.index')
            ->with('status', 'product-created');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): Response
    {
        return inertia('products/show', [
            'product' => $product->load(['category', 'supplier']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product): Response
    {
        return inertia('products/edit', [
            'product' => $product,
            'categories' => $this->categoryService->getActiveCategories(),
            'suppliers' => $this->supplierService->getActiveSuppliers(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->productService->update($product, $request->validated());

        return redirect()->route('products.index')
            ->with('status', 'product-updated');
    }

    /**
     * Toggle product status.
     */
    public function toggleStatus(Product $product): RedirectResponse
    {
        $this->productService->toggleStatus($product);

        return back()->with('status', 'product-status-updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $this->productService->delete($product);

        return redirect()->route('products.index')
            ->with('status', 'product-deleted');
    }
}
