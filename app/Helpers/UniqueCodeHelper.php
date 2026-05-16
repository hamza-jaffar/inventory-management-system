<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class UniqueCodeHelper
{
    /**
     * Generate a unique code for a model.
     * Format: PREFIX-RANDOM (e.g., SUP-ABC123)
     */
    public static function generate(string $modelClass, string $prefix = '', string $field = 'code', int $length = 6): string
    {
        do {
            $random = strtoupper(Str::random($length));
            $code = $prefix ? "{$prefix}-{$random}" : $random;
        } while ($modelClass::where($field, $code)->exists());

        return $code;
    }
}
