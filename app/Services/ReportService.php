<?php

namespace App\Services;

use App\Models\InventoryLedger;
use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\StockAdjustment;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get overall system analytics statistics.
     */
    public function getAnalyticsData(?string $fromDate = null, ?string $toDate = null): array
    {
        // Parse date filters or fall back to last 1 month
        $start = $fromDate ? Carbon::parse($fromDate)->startOfDay() : Carbon::now()->subMonth()->startOfDay();
        $end = $toDate ? Carbon::parse($toDate)->endOfDay() : Carbon::now()->endOfDay();

        // 1. Sales Totals (Daily, Monthly, Yearly)
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfYear = Carbon::now()->startOfYear();

        $dailySales = SalesOrder::whereDate('created_at', $today)->sum('grand_total');
        $monthlySales = SalesOrder::where('created_at', '>=', $startOfMonth)->sum('grand_total');
        $yearlySales = SalesOrder::where('created_at', '>=', $startOfYear)->sum('grand_total');

        // 2. Inventory Stock Status
        $outOfStockCount = Product::where('quantity', '<=', 0)->count();
        $lowStockCount = Product::where('quantity', '>', 0)
            ->whereColumn('quantity', '<=', 'safety_stock')
            ->count();
        $availableStockCount = Product::whereColumn('quantity', '>', 'safety_stock')->count();

        // 3. Stock Movement Summary (filtered by date range)
        $totalAdjustments = StockAdjustment::whereBetween('created_at', [$start, $end])->count();
        $positiveAdjustments = StockAdjustment::whereBetween('created_at', [$start, $end])
            ->where('quantity_change', '>', 0)
            ->count();
        $negativeAdjustments = StockAdjustment::whereBetween('created_at', [$start, $end])
            ->where('quantity_change', '<', 0)
            ->count();

        // 4. Most Sold Products (filtered by date range)
        $mostSold = SalesOrderItem::query()
            ->join('products', 'sales_order_items.product_id', '=', 'products.id')
            ->whereBetween('sales_order_items.created_at', [$start, $end])
            ->select(
                'products.name',
                'products.sku',
                DB::raw('SUM(sales_order_items.quantity) as total_qty'),
                DB::raw('SUM(sales_order_items.total_price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // 5. Profit / Revenue Overview (filtered by date range)
        $revenue = SalesOrder::whereBetween('created_at', [$start, $end])->sum('grand_total');

        // Cost of Goods Sold (COGS) calculation based on cost_price of products sold
        $cogs = SalesOrderItem::query()
            ->join('products', 'sales_order_items.product_id', '=', 'products.id')
            ->whereBetween('sales_order_items.created_at', [$start, $end])
            ->sum(DB::raw('sales_order_items.quantity * products.cost_price'));

        $profit = $revenue - $cogs;

        // 6. Recent Transactions (filtered by date range)
        $recentTransactions = SalesOrder::with(['cashier:id,name'])
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'cashier_name' => $order->cashier?->name ?? 'System',
                'grand_total' => $order->grand_total,
                'payment_method' => $order->payment_method,
                'created_at' => $order->created_at->format('d M Y, H:i'),
            ]);

        return [
            'date_range' => [
                'from' => $start->toIso8601String(),
                'to' => $end->toIso8601String(),
                'formatted' => $start->format('d M Y').' - '.$end->format('d M Y'),
            ],
            'sales' => [
                'daily' => $dailySales,
                'monthly' => $monthlySales,
                'yearly' => $yearlySales,
            ],
            'stock_status' => [
                'out_of_stock' => $outOfStockCount,
                'low_stock' => $lowStockCount,
                'available' => $availableStockCount,
            ],
            'movements' => [
                'total' => $totalAdjustments,
                'positive' => $positiveAdjustments,
                'negative' => $negativeAdjustments,
            ],
            'most_sold' => $mostSold,
            'financials' => [
                'revenue' => $revenue,
                'cogs' => $cogs,
                'profit' => $profit,
            ],
            'recent_transactions' => $recentTransactions,
        ];
    }

    /**
     * Get Stock Adjustment data for tabular reports.
     */
    public function getStockAdjustmentData(?string $fromDate = null, ?string $toDate = null, ?int $productId = null): Collection
    {
        $query = StockAdjustment::with(['product', 'user']);

        if ($fromDate) {
            $query->where('created_at', '>=', Carbon::parse($fromDate)->startOfDay());
        }
        if ($toDate) {
            $query->where('created_at', '<=', Carbon::parse($toDate)->endOfDay());
        }
        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $query->latest()->get();
    }

    /**
     * Get Inventory Ledger entries for tabular reports.
     */
    public function getInventoryLedgerData(?string $fromDate = null, ?string $toDate = null, ?int $productId = null): Collection
    {
        $query = InventoryLedger::with(['product']);

        if ($fromDate) {
            $query->where('created_at', '>=', Carbon::parse($fromDate)->startOfDay());
        }
        if ($toDate) {
            $query->where('created_at', '<=', Carbon::parse($toDate)->endOfDay());
        }
        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $query->latest()->get();
    }

    /**
     * Get Sales History data for tabular reports.
     */
    public function getSalesHistoryData(?string $fromDate = null, ?string $toDate = null, ?string $paymentMethod = null): Collection
    {
        $query = SalesOrder::with(['cashier', 'items.product']);

        if ($fromDate) {
            $query->where('created_at', '>=', Carbon::parse($fromDate)->startOfDay());
        }
        if ($toDate) {
            $query->where('created_at', '<=', Carbon::parse($toDate)->endOfDay());
        }
        if ($paymentMethod && $paymentMethod !== 'all') {
            $query->where('payment_method', $paymentMethod);
        }

        return $query->latest()->get();
    }
}
