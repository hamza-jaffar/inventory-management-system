<?php

namespace App\Services;

use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get statistics for the dashboard based on user role.
     */
    public function getStats(User $user): array
    {
        $stats = [];

        if ($user->hasRole('admin') || $user->hasRole('inventory-manager')) {
            $stats = $this->getAdminStats();
        } elseif ($user->hasRole('cashier')) {
            $stats = $this->getCashierStats($user);
        }

        return $stats;
    }

    /**
     * Get statistics for Admin and Manager.
     */
    private function getAdminStats(): array
    {
        $today = Carbon::today();
        $month = Carbon::now()->startOfMonth();

        return [
            'total_products' => Product::count(),
            'low_stock_count' => Product::whereColumn('quantity', '<=', 'safety_stock')->count(),
            'total_suppliers' => Supplier::count(),
            'sales_today' => SalesOrder::whereDate('created_at', $today)->sum('grand_total'),
            'sales_this_month' => SalesOrder::where('created_at', '>=', $month)->sum('grand_total'),
            'total_orders_today' => SalesOrder::whereDate('created_at', $today)->count(),
            'sales_history' => $this->getSalesHistory(),
            'recent_sales' => SalesOrder::with('cashier')->latest()->take(5)->get(),
            'top_products' => DB::table('sales_order_items')
                ->join('products', 'sales_order_items.product_id', '=', 'products.id')
                ->select('products.name', DB::raw('SUM(sales_order_items.quantity) as total_sold'))
                ->groupBy('products.id', 'products.name')
                ->orderByDesc('total_sold')
                ->take(5)
                ->get(),
        ];
    }

    /**
     * Get statistics for Cashier.
     */
    private function getCashierStats(User $user): array
    {
        $today = Carbon::today();
        $month = Carbon::now()->startOfMonth();

        return [
            'my_sales_today' => SalesOrder::where('cashier_id', $user->id)
                ->whereDate('created_at', $today)
                ->sum('grand_total'),
            'my_orders_today' => SalesOrder::where('cashier_id', $user->id)
                ->whereDate('created_at', $today)
                ->count(),
            'my_sales_this_month' => SalesOrder::where('cashier_id', $user->id)
                ->where('created_at', '>=', $month)
                ->sum('grand_total'),
            'recent_my_sales' => SalesOrder::where('cashier_id', $user->id)
                ->latest()
                ->take(5)
                ->get(),
            'my_sales_history' => $this->getCashierSalesHistory($user),
        ];
    }

    /**
     * Get sales history for the last 7 days.
     */
    private function getSalesHistory(): array
    {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $data[] = [
                'date' => $date->format('M d'),
                'total' => SalesOrder::whereDate('created_at', $date)->sum('grand_total'),
            ];
        }

        return $data;
    }

    /**
     * Get sales history for a specific cashier for the last 7 days.
     */
    private function getCashierSalesHistory(User $user): array
    {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $data[] = [
                'date' => $date->format('M d'),
                'total' => SalesOrder::where('cashier_id', $user->id)
                    ->whereDate('created_at', $date)
                    ->sum('grand_total'),
            ];
        }

        return $data;
    }
}
