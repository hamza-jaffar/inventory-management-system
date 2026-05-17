<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales History Report</title>
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
        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-weight: bold;
            border-radius: 4px;
            font-size: 9px;
            text-transform: uppercase;
        }
        .badge-completed {
            background-color: #c6f6d5;
            color: #22543d;
        }
        .badge-pending {
            background-color: #feebc8;
            color: #744210;
        }
        .badge-cancelled {
            background-color: #fed7d7;
            color: #742a2a;
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
                    <div class="report-title">Sales History Report</div>
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
            <td class="meta-label" style="text-align: right;">Total Sales Count:</td>
            <td style="text-align: right; font-weight: bold;">{{ count($sales) }}</td>
        </tr>
        <tr>
            <td class="meta-label">Total Revenue:</td>
            <td style="font-weight: bold; color: #2b6cb0;">
                {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($sales->sum('grand_total'), 2) }}
            </td>
            <td colspan="2"></td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%;">Order Number</th>
                <th style="width: 15%;">Cashier</th>
                <th style="width: 15%; text-align: right;">Sub Total</th>
                <th style="width: 10%; text-align: right;">Discount</th>
                <th style="width: 15%; text-align: right;">Grand Total</th>
                <th style="width: 15%;">Payment Method</th>
                <th style="width: 15%;">Created At</th>
            </tr>
        </thead>
        <tbody>
            @forelse($sales as $order)
                <tr>
                    <td style="font-weight: bold;">{{ $order->order_number }}</td>
                    <td>{{ $order->cashier?->name ?? 'System' }}</td>
                    <td class="text-right">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($order->sub_total, 2) }}
                    </td>
                    <td class="text-right">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($order->discount, 2) }}
                    </td>
                    <td class="text-right" style="font-weight: bold; color: #2d3748;">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($order->grand_total, 2) }}
                    </td>
                    <td style="text-transform: uppercase; font-weight: bold; color: #4a5568;">
                        {{ $order->payment_method }}
                    </td>
                    <td style="color: #718096; font-size: 10px;">
                        {{ $order->created_at->format('d M Y, H:i') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center; color: #a0aec0; padding: 20px;">
                        No sales orders found for the selected criteria.
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
