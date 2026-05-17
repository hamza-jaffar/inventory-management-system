<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(
    'filename',
    'disk',
    'path',
    'size',
    'type',
    'status',
    'notes',
)]
class Backup extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    /**
     * Human-readable file size.
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;

        if ($bytes >= 1_048_576) {
            return round($bytes / 1_048_576, 2).' MB';
        }

        if ($bytes >= 1_024) {
            return round($bytes / 1_024, 2).' KB';
        }

        return $bytes.' B';
    }
}
