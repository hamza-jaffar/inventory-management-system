<?php

namespace Database\Factories;

use App\Helpers\SlugHelper;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'name' => ucfirst($name),
            'slug' => SlugHelper::generate($name, Category::class),
            'description' => $this->faker->sentence(),
            'parent_id' => null,
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(0, 100),
        ];
    }
}
