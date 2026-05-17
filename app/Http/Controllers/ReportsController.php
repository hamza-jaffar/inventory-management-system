<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function __construct(protected ReportService $reportService) {}

    /**
     * Download Stock Adjustments PDF Report.
     */
    public function stockAdjustments(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $productId = $request->input('product_id') ? (int) $request->input('product_id') : null;

        $adjustments = $this->reportService->getStockAdjustmentData($fromDate, $toDate, $productId);

        $dateRange = 'All Time';
        if ($fromDate && $toDate) {
            $dateRange = Carbon::parse($fromDate)->format('d M Y').' - '.Carbon::parse($toDate)->format('d M Y');
        } elseif ($fromDate) {
            $dateRange = 'From '.Carbon::parse($fromDate)->format('d M Y');
        } elseif ($toDate) {
            $dateRange = 'Until '.Carbon::parse($toDate)->format('d M Y');
        }

        $pdf = Pdf::loadView('reports.stock-adjustments', [
            'adjustments' => $adjustments,
            'date_range' => $dateRange,
        ]);

        return $pdf->download('stock-adjustments-'.now()->format('YmdHis').'.pdf');
    }

    /**
     * Download Inventory Ledger PDF Report.
     */
    public function inventoryLedger(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $productId = $request->input('product_id') ? (int) $request->input('product_id') : null;

        $ledgers = $this->reportService->getInventoryLedgerData($fromDate, $toDate, $productId);

        $dateRange = 'All Time';
        if ($fromDate && $toDate) {
            $dateRange = Carbon::parse($fromDate)->format('d M Y').' - '.Carbon::parse($toDate)->format('d M Y');
        } elseif ($fromDate) {
            $dateRange = 'From '.Carbon::parse($fromDate)->format('d M Y');
        } elseif ($toDate) {
            $dateRange = 'Until '.Carbon::parse($toDate)->format('d M Y');
        }

        $pdf = Pdf::loadView('reports.inventory-ledger', [
            'ledgers' => $ledgers,
            'date_range' => $dateRange,
        ]);

        return $pdf->download('inventory-ledger-'.now()->format('YmdHis').'.pdf');
    }

    /**
     * Download Sales History PDF Report.
     */
    public function salesHistory(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $paymentMethod = $request->input('payment_method');

        $sales = $this->reportService->getSalesHistoryData($fromDate, $toDate, $paymentMethod);

        $dateRange = 'All Time';
        if ($fromDate && $toDate) {
            $dateRange = Carbon::parse($fromDate)->format('d M Y').' - '.Carbon::parse($toDate)->format('d M Y');
        } elseif ($fromDate) {
            $dateRange = 'From '.Carbon::parse($fromDate)->format('d M Y');
        } elseif ($toDate) {
            $dateRange = 'Until '.Carbon::parse($toDate)->format('d M Y');
        }

        $pdf = Pdf::loadView('reports.sales-history', [
            'sales' => $sales,
            'date_range' => $dateRange,
        ]);

        return $pdf->download('sales-history-'.now()->format('YmdHis').'.pdf');
    }
}
