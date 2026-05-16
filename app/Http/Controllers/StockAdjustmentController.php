<?php

namespace App\Http\Controllers;

use App\Services\StockAdjustmentService;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function __construct(
        protected StockAdjustmentService $stockAdjustmentService,
        protected ProductService $productService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type', 'start_date', 'end_date', 'sort']);
        $adjustments = $this->stockAdjustmentService->getPaginated($filters);

        return inertia('inventory/stock-adjustments/index', [
            'adjustments' => $adjustments,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return inertia('inventory/stock-adjustments/create', [
            'products' => $this->productService->getActiveProducts()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity_change' => 'required|integer|min:1',
            'type' => 'required|string|in:damage,theft,audit_loss,audit_gain,promo_sample',
            'reason' => 'nullable|string',
        ]);

        $this->stockAdjustmentService->adjustStock($validated);

        return redirect()->route('stock-adjustments.index')->with('success', 'Stock adjustment created successfully.');
    }
}
