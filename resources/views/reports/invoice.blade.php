<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #333333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 10px;
        }
        .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1a202c;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .invoice-title {
            font-size: 16px;
            font-weight: bold;
            color: #4a5568;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            text-align: right;
        }
        .info-table {
            width: 100%;
            margin-bottom: 25px;
        }
        .info-table td {
            vertical-align: top;
            padding: 2px 0;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
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
        .totals-table {
            width: 40%;
            float: right;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
        }
        .totals-label {
            font-weight: bold;
            color: #4a5568;
            background-color: #f7fafc;
        }
        .grand-total-row td {
            font-size: 13px;
            font-weight: bold;
            color: #1a202c;
            background-color: #edf2f7;
            border-top: 2px solid #cbd5e0;
        }
        .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            color: #718096;
            font-size: 9px;
            clear: both;
        }
    </style>
</head>
<body>

    <div class="invoice-box">
        <div class="header">
            <table style="width: 100%;">
                <tr>
                    <td>
                        <h1 class="company-name">
                            {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_NAME, 'Inventory Management') }}
                        </h1>
                        <div style="color: #718096; font-size: 10px;">
                            {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_ADDRESS, '') }}<br>
                            {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CITY, '') }}
                            @if(\App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_PHONE, ''))
                                | Phone: {{ \App\Services\SettingService::getSetting(\App\App_PHONE, '') }}
                            @endif
                        </div>
                    </td>
                    <td style="text-align: right; vertical-align: top;">
                        <div class="invoice-title">Sales Invoice</div>
                        <div style="font-weight: bold; font-size: 12px; color: #2d3748; margin-top: 5px;">
                            #{{ $order->order_number }}
                        </div>
                        <div style="color: #718096; font-size: 10px; margin-top: 2px;">
                            Date: {{ $order->created_at->format('d M Y, H:i') }}
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <table class="info-table">
            <tr>
                <td style="width: 50%;">
                    <strong style="font-size: 10px; color: #4a5568; text-transform: uppercase;">Cashier Details</strong><br>
                    <span style="font-size: 11px; font-weight: bold; color: #2d3748;">{{ $order->cashier?->name ?? 'System Cashier' }}</span><br>
                    <span style="color: #718096; font-size: 10px;">Email: {{ $order->cashier?->email ?? '-' }}</span>
                </td>
                <td style="width: 50%; text-align: right;">
                    <strong style="font-size: 10px; color: #4a5568; text-transform: uppercase;">Payment Details</strong><br>
                    <span style="font-size: 11px; font-weight: bold; color: #2d3748; text-transform: uppercase;">{{ $order->payment_method }}</span><br>
                    <span style="color: #718096; font-size: 10px;">Status: COMPLETED</span>
                </td>
            </tr>
        </table>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 50%;">Product Details</th>
                    <th style="width: 15%; text-align: right;">Unit Price</th>
                    <th style="width: 15%; text-align: right;">Quantity</th>
                    <th style="width: 20%; text-align: right;">Total Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product?->name }}</strong><br>
                            <span style="color: #718096; font-size: 8px;">SKU: {{ $item->product?->sku }}</span>
                        </td>
                        <td class="text-right">
                            {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($item->unit_price, 2) }}
                        </td>
                        <td class="text-right">{{ $item->quantity }}</td>
                        <td class="text-right" style="font-weight: bold;">
                            {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($item->total_price, 2) }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals-table">
            <tr>
                <td class="totals-label">Subtotal</td>
                <td class="text-right">
                    {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($order->sub_total, 2) }}
                </td>
            </tr>
            @if($order->discount > 0)
                <tr>
                    <td class="totals-label">Discount</td>
                    <td class="text-right" style="color: #c53030;">
                        -{{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($order->discount, 2) }}
                    </td>
                </tr>
            @endif
            @if($order->tax > 0)
                <tr>
                    <td class="totals-label">Tax ({{ $order->tax }}%)</td>
                    <td class="text-right">
                        {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format(($order->sub_total - $order->discount) * $order->tax / 100, 2) }}
                    </td>
                </tr>
            @endif
            <tr class="grand-total-row">
                <td class="totals-label">Grand Total</td>
                <td class="text-right">
                    {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($order->grand_total, 2) }}
                </td>
            </tr>
            <tr>
                <td class="totals-label">Paid Amount</td>
                <td class="text-right">
                    {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($order->paid_amount, 2) }}
                </td>
            </tr>
            <tr>
                <td class="totals-label">Change Amount</td>
                <td class="text-right">
                    {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_CURRENCY_SYMBOL, '$') }}{{ number_format($order->change_amount, 2) }}
                </td>
            </tr>
        </table>

        <div class="footer">
            Thank you for your business! &mdash; {{ \App\Services\SettingService::getSetting(\App\Enums\SettingEnum::APP_NAME, 'our store') }}
        </div>
    </div>

</body>
</html>
