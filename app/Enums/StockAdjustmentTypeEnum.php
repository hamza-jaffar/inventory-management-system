<?php

namespace App\Enums;

enum StockAdjustmentTypeEnum: string
{
    case ADD = 'add';
    case REMOVE = 'remove';

    case DAMAGE = 'damage';
    case THEFT = 'theft';
    case AUDIT_LOSS = 'audit_loss';
    case AUDIT_GAIN = 'audit_gain';
    case PROMO_SAMPLE = 'promo_sample';
}
