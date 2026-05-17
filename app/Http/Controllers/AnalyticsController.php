<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(protected ReportService $reportService) {}

    /**
     * Display the platform analytics dashboard page.
     */
    public function index(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $analytics = $this->reportService->getAnalyticsData($fromDate, $toDate);

        return Inertia::render('analytics/index', [
            'analytics' => $analytics,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
        ]);
    }

    /**
     * Export currently filtered analytics as a PDF report.
     */
    public function exportPdf(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $analytics = $this->reportService->getAnalyticsData($fromDate, $toDate);

        $pdf = Pdf::loadView('reports.analytics', [
            'analytics' => $analytics,
        ]);

        return $pdf->download('system-analytics-'.now()->format('YmdHis').'.pdf');
    }
}
