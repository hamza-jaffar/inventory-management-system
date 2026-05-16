<?php

namespace App\Http\Controllers;

use App\Services\InventoryLedgerService;
use Illuminate\Http\Request;
use Inertia\Response;

class InventoryLedgerController extends Controller
{
    public function __construct(
        protected InventoryLedgerService $inventoryLedgerService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['product_id', 'search', 'source_type', 'start_date', 'end_date', 'sort']);
        $ledgers = $this->inventoryLedgerService->getPaginated($filters);

        return inertia('inventory/ledgers/index', [
            'ledgers' => $ledgers,
            'filters' => $filters,
        ]);
    }
}
