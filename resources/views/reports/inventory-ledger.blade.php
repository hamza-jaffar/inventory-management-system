<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inventory Ledger Report</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #333333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
        }
        .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #1a202c;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .report-title {
            font-size: 14px;
            font-weight: bold;
            color: #4a5568;
            margin: 0 0 10px 0;
            text-transform: uppercase;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .meta-table td {
            padding: 3px 0;
            vertical-align: top;
        }
        .meta-label {
            font-weight: bold;
            color: #4a5568;
            width: 120px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .data-table th {
            background-color: #2d3748;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #2d3748;
            text-transform: uppercase;
            font-size: 10px;
        }
        .data-table td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
        }
        .data-table tr:nth-child(even) {
            background-color: #f7fafc;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            text-align: center;
            color: #718096;
            font-size: 9px;
        }
    </style>
</head>
<body>

    <div class="header">
        <table style="width: 100%;">
            <tr>
                <td>
                    <h1 class="company-name">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_NAME, 'Inventory Management') }}
                    </h1>
                    <div style="color: #718096; font-size: 10px;">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_ADDRESS, '') }}
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CITY, '') }}
                    </div>
                </td>
                <td style="text-align: right; vertical-align: top;">
                    <div class="report-title">Inventory Ledger Report</div>
                    <div style="color: #718096; font-size: 10px;">
                        Generated: {{ now()->format('d M Y, H:i') }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <table class="meta-table">
        <tr>
            <td class="meta-label">Date Range:</td>
            <td>{{ $date_range ?? 'All Time' }}</td>
            <td class="meta-label" style="text-align: right;">Total Ledger Entries:</td>
            <td style="text-align: right; font-weight: bold;">{{ count($ledgers) }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 8%;">ID</th>
                <th style="width: 25%;">Product</th>
                <th style="width: 12%; text-align: right;">Before</th>
                <th style="width: 12%; text-align: right;">After</th>
                <th style="width: 12%; text-align: right;">Variance</th>
                <th style="width: 15%;">Source Type</th>
                <th style="width: 16%;">Notes</th>
            </tr>
        </thead>
        <tbody>
            @forelse($ledgers as $ledger)
                <tr>
                    <td>#{{ $ledger->id }}</td>
                    <td>
                        <strong>{{ $ledger->product?->name }}</strong><br>
                        <span style="color: #718096; font-size: 9px;">SKU: {{ $ledger->product?->sku }}</span>
                    </td>
                    <td class="text-right">{{ $ledger->quantity_before }}</td>
                    <td class="text-right">{{ $ledger->quantity_after }}</td>
                    <td class="text-right" style="font-weight: bold; color: {{ $ledger->variance > 0 ? '#276749' : ($ledger->variance < 0 ? '#9b2c2c' : '#718096') }}">
                        {{ $ledger->variance > 0 ? '+' : '' }}{{ $ledger->variance }}
                    </td>
                    <td>
                        <span style="text-transform: capitalize;">{{ str_replace('App\\Models\\', '', $ledger->source_type) }}</span>
                        @if($ledger->source_id)
                            <span style="color: #718096;">(#{{ $ledger->source_id }})</span>
                        @endif
                    </td>
                    <td>{{ $ledger->notes ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center; color: #a0aec0; padding: 20px;">
                        No ledger entries found for the selected criteria.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Page 1 of 1 &mdash; Thank you for choosing {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_NAME, 'our platform') }}.
    </div>

</body>
</html>
