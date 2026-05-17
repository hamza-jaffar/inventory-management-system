<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Stock Adjustment Report</title>
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
        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-weight: bold;
            border-radius: 4px;
            font-size: 9px;
            text-transform: uppercase;
        }
        .badge-addition {
            background-color: #c6f6d5;
            color: #22543d;
        }
        .badge-subtraction {
            background-color: #fed7d7;
            color: #742a2a;
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
                    <div class="report-title">Stock Adjustment Report</div>
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
            <td class="meta-label" style="text-align: right;">Total Adjustments:</td>
            <td style="text-align: right; font-weight: bold;">{{ count($adjustments) }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 8%;">ID</th>
                <th style="width: 32%;">Product</th>
                <th style="width: 15%;">User</th>
                <th style="width: 12%; text-align: right;">Change</th>
                <th style="width: 13%;">Type</th>
                <th style="width: 20%;">Reason</th>
            </tr>
        </thead>
        <tbody>
            @forelse($adjustments as $adj)
                <tr>
                    <td>#{{ $adj->id }}</td>
                    <td>
                        <strong>{{ $adj->product?->name }}</strong><br>
                        <span style="color: #718096; font-size: 9px;">SKU: {{ $adj->product?->sku }}</span>
                    </td>
                    <td>{{ $adj->user?->name ?? 'System' }}</td>
                    <td class="text-right" style="font-weight: bold; color: {{ $adj->quantity_change > 0 ? '#276749' : '#9b2c2c' }}">
                        {{ $adj->quantity_change > 0 ? '+' : '' }}{{ $adj->quantity_change }}
                    </td>
                    <td>
                        @if($adj->quantity_change > 0)
                            <span class="badge badge-addition">Addition</span>
                        @else
                            <span class="badge badge-subtraction">Subtraction</span>
                        @endif
                    </td>
                    <td>{{ $adj->reason ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #a0aec0; padding: 20px;">
                        No stock adjustment records found for the selected criteria.
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
