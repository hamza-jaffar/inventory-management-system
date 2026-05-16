<?php

namespace App\Http\Controllers;

use App\Http\Requests\PurchaseOrder\ReceivePurchaseOrderRequest;
use App\Http\Requests\PurchaseOrder\StorePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use App\Services\ProductService;
use App\Services\PurchaseOrderService;
use App\Services\SupplierService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function __construct(
        protected PurchaseOrderService $purchaseOrderService,
        protected SupplierService $supplierService,
        protected ProductService $productService,
        protected \App\Services\CategoryService $categoryService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $filterKeys = ['search', 'sort', 'status', 'start_date', 'end_date'];
        
        return inertia('purchase-orders/index', [
            'purchaseOrders' => $this->purchaseOrderService->getPaginated($request->only($filterKeys)),
            'filters' => $request->only($filterKeys),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return inertia('purchase-orders/create', [
            'suppliers' => $this->supplierService->getActiveSuppliers(),
            'products' => $this->productService->getActiveProducts(),
            'categories' => $this->categoryService->getActiveCategories(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePurchaseOrderRequest $request): RedirectResponse
    {
        $this->purchaseOrderService->createPurchaseOrder($request->validated());

        return redirect()->route('purchase-orders.index')
            ->with('status', 'purchase-order-created');
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load(['supplier', 'items.product']);
        return inertia('purchase-orders/show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    /**
     * Receive items for the purchase order.
     */
    public function receive(ReceivePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->purchaseOrderService->receivePurchaseOrder($purchaseOrder, $request->validated()['items']);

        return back()->with('status', 'purchase-order-received');
    }

    /**
     * Cancel the purchase order.
     */
    public function cancel(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->purchaseOrderService->cancelPurchaseOrder($purchaseOrder);

        return back()->with('status', 'purchase-order-cancelled');
    }
}
