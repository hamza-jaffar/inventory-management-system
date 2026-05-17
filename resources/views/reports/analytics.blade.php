<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>System Performance & Analytics Report</title>
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
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #2b6cb0;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-top: 20px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .card-table {
            width: 100%;
            margin-bottom: 15px;
        }
        .card {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
        }
        .card-val {
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
            margin-top: 5px;
        }
        .card-lbl {
            font-size: 9px;
            color: #718096;
            text-transform: uppercase;
            font-weight: bold;
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
            padding: 6px 8px;
            border: 1px solid #2d3748;
            text-transform: uppercase;
            font-size: 9px;
        }
        .data-table td {
            padding: 6px 8px;
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
                    <div class="report-title">Platform Analytics Report</div>
                    <div style="color: #718096; font-size: 10px;">
                        Generated: {{ now()->format('d M Y, H:i') }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <table style="width: 100%; margin-bottom: 10px;">
        <tr>
            <td style="font-weight: bold; color: #4a5568; width: 80px;">Date Filter:</td>
            <td>{{ $analytics['date_range']['formatted'] }}</td>
        </tr>
    </table>

    <div class="section-title">1. Financial Snapshot</div>
    <table class="card-table" style="border-spacing: 10px; border-collapse: separate; margin: 0 -10px;">
        <tr>
            <td style="width: 33%;">
                <div class="card">
                    <span class="card-lbl">Total Revenue</span>
                    <div class="card-val" style="color: #2b6cb0;">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($analytics['financials']['revenue'], 2) }}
                    </div>
                </div>
            </td>
            <td style="width: 33%;">
                <div class="card">
                    <span class="card-lbl">Cost of Goods Sold (COGS)</span>
                    <div class="card-val" style="color: #e53e3e;">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($analytics['financials']['cogs'], 2) }}
                    </div>
                </div>
            </td>
            <td style="width: 33%;">
                <div class="card">
                    <span class="card-lbl">Net Profit</span>
                    <div class="card-val" style="color: #38a169;">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($analytics['financials']['profit'], 2) }}
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">2. Sales Performance Milestones</div>
    <table class="card-table" style="border-spacing: 10px; border-collapse: separate; margin: 0 -10px;">
        <tr>
            <td style="width: 33%;">
                <div class="card">
                    <span class="card-lbl">Today's Sales</span>
                    <div class="card-val">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($analytics['sales']['daily'], 2) }}
                    </div>
                </div>
            </td>
            <td style="width: 33%;">
                <div class="card">
                    <span class="card-lbl">This Month's Sales</span>
                    <div class="card-val">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($analytics['sales']['monthly'], 2) }}
                    </div>
                </div>
            </td>
            <td style="width: 33%;">
                <div class="card">
                    <span class="card-lbl">This Year's Sales</span>
                    <div class="card-val">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($analytics['sales']['yearly'], 2) }}
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">3. Inventory Stock Status Overview</div>
    <table class="card-table" style="border-spacing: 10px; border-collapse: separate; margin: 0 -10px;">
        <tr>
            <td style="width: 33%;">
                <div class="card" style="border-left: 4px solid #38a169;">
                    <span class="card-lbl">Available Stock Products</span>
                    <div class="card-val" style="color: #38a169;">
                        {{ $analytics['stock_status']['available'] }}
                    </div>
                </div>
            </td>
            <td style="width: 33%;">
                <div class="card" style="border-left: 4px solid #dd6b20;">
                    <span class="card-lbl">Low Stock Warning</span>
                    <div class="card-val" style="color: #dd6b20;">
                        {{ $analytics['stock_status']['low_stock'] }}
                    </div>
                </div>
            </td>
            <td style="width: 33%;">
                <div class="card" style="border-left: 4px solid #e53e3e;">
                    <span class="card-lbl">Out of Stock</span>
                    <div class="card-val" style="color: #e53e3e;">
                        {{ $analytics['stock_status']['out_of_stock'] }}
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">4. Top 5 Best Selling Products</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 10%;">Rank</th>
                <th style="width: 45%;">Product Details</th>
                <th style="width: 20%; text-align: right;">Total Quantity Sold</th>
                <th style="width: 25%; text-align: right;">Total Generated Revenue</th>
            </tr>
        </thead>
        <tbody>
            @forelse($analytics['most_sold'] as $index => $item)
                <tr>
                    <td><strong>#{{ $index + 1 }}</strong></td>
                    <td>
                        <strong>{{ $item->name }}</strong><br>
                        <span style="color: #718096; font-size: 8px;">SKU: {{ $item->sku }}</span>
                    </td>
                    <td class="text-right" style="font-weight: bold;">{{ number_format($item->total_qty) }}</td>
                    <td class="text-right" style="font-weight: bold; color: #2d3748;">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($item->total_revenue, 2) }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; color: #a0aec0; padding: 15px;">
                        No sales data recorded within this date range.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">5. Recent Transactions</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 20%;">Order Number</th>
                <th style="width: 25%;">Cashier</th>
                <th style="width: 20%; text-align: right;">Grand Total</th>
                <th style="width: 15%;">Method</th>
                <th style="width: 20%;">Created At</th>
            </tr>
        </thead>
        <tbody>
            @forelse($analytics['recent_transactions'] as $tx)
                <tr>
                    <td style="font-weight: bold;">{{ $tx['order_number'] }}</td>
                    <td>{{ $tx['cashier_name'] }}</td>
                    <td class="text-right" style="font-weight: bold;">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($tx['grand_total'], 2) }}
                    </td>
                    <td style="text-transform: uppercase; font-size: 9px; font-weight: bold; color: #718096;">
                        {{ $tx['payment_method'] }}
                    </td>
                    <td style="color: #718096; font-size: 10px;">{{ $tx['created_at'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #a0aec0; padding: 15px;">
                        No transactions recorded within this date range.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Page 1 of 1 &mdash; Performance & System Analytics Report &mdash; {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_NAME, 'our platform') }}.
    </div>

</body>
</html>
