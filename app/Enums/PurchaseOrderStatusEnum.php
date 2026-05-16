<?php

namespace App\Enums;

enum PurchaseOrderStatusEnum: string
{
    case PENDING = 'pending';
    case RECEIVED = 'received';
    case CANCELLED = 'cancelled';

    case PARTIALLY_RECEIVED = 'partially_received';

    case ORDERED = 'ordered';
}
