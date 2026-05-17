<?php

namespace App\Http\Controllers;

use App\Models\SalesOrder;
use App\Services\ProductService;
use App\Services\SalesOrderService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class SalesOrderController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:viewAny,App\Models\SalesOrder', only: ['index', 'pos']),
            new Middleware('can:view,sales_order', only: ['show', 'download']),
            new Middleware('can:create,App\Models\SalesOrder', only: ['store']),
        ];
    }

    public function __construct(
        protected SalesOrderService $salesOrderService,
        protected ProductService $productService
    ) {}

    /**
     * Display a listing of sales orders.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('sales/index', [
            'orders' => $this->salesOrderService->getPaginated($request->only(['search'])),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the POS interface.
     */
    public function pos(Request $request): Response
    {
        // This will be the main POS page
        return Inertia::render('sales/pos', [
            'products' => $this->productService->getActiveProducts(),
        ]);
    }

    /**
     * Store a newly created sales order.
     */
    public function store(Request $request)
    {
        // For simplicity using Request directly, but should use StoreSalesOrderRequest
        $validated = $request->validate([
            'sub_total' => 'required|numeric',
            'discount' => 'required|numeric',
            'tax' => 'required|numeric',
            'grand_total' => 'required|numeric',
            'paid_amount' => 'required|numeric',
            'change_amount' => 'required|numeric',
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
        ]);

        $order = $this->salesOrderService->createOrder($validated);
        $order->load(['cashier', 'items.product']);

        return redirect()->route('sales.pos')
            ->with('success', "Order #{$order->order_number} created successfully.")
            ->with('created_order', $order);
    }

    /**
     * Display the specified sales order details (as JSON).
     */
    public function show(SalesOrder $salesOrder)
    {
        $salesOrder->load(['cashier', 'items.product']);

        return response()->json($salesOrder);
    }

    /**
     * Download the invoice PDF.
     */
    public function download(SalesOrder $salesOrder)
    {
        $salesOrder->load(['cashier', 'items.product']);

        $pdf = Pdf::loadView('reports.invoice', [
            'order' => $salesOrder,
        ]);

        return $pdf->download('invoice-'.$salesOrder->order_number.'.pdf');
    }
}
