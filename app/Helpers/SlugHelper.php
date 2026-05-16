<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class SlugHelper
{
    /**
     * Generate a unique slug for a model.
     */
    public static function generate(string $name, string $modelClass, string $field = 'slug'): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while ($modelClass::where($field, $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        return $slug;
    }
}
