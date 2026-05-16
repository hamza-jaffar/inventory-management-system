<?php

namespace Database\Factories;

use App\Helpers\SlugHelper;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);
        $cost = $this->faker->randomFloat(2, 10, 100);

        return [
            'name' => ucfirst($name),
            'sku' => $this->faker->unique()->bothify('PROD-####-????'),
            'barcode' => $this->faker->unique()->ean13(),
            'slug' => SlugHelper::generate($name, Product::class),
            'description' => $this->faker->paragraph(),
            'quantity' => $this->faker->numberBetween(0, 500),
            'safety_stock' => $this->faker->numberBetween(5, 50),
            'cost_price' => $cost,
            'sale_price' => $cost * 1.5,
            'retail_price' => $cost * 2,
            'category_id' => Category::inRandomOrder()->first()?->id,
            'supplier_id' => Supplier::inRandomOrder()->first()?->id,
            'is_active' => true,
            'image_path' => null,
        ];
    }
}
