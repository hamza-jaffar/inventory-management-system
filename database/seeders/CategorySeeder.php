<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 10 parent categories
        $parents = Category::factory()->count(5)->create();

        // Create 15 sub-categories
        foreach ($parents as $parent) {
            Category::factory()->count(rand(1, 3))->create([
                'parent_id' => $parent->id,
            ]);
        }
    }
}
