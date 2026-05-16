<?php

namespace Database\Factories;

use App\Helpers\UniqueCodeHelper;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'code' => UniqueCodeHelper::generate(Supplier::class, 'SUP'),
            'tax_number' => $this->faker->numerify('VAT-########'),
            'contact_name' => $this->faker->name(),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'website' => $this->faker->url(),
            'address_line_1' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state_region' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->countryISOAlpha3(),
            'lead_time_days' => $this->faker->numberBetween(1, 30),
            'payment_terms' => $this->faker->randomElement(['Net 30', 'Net 60', 'COD', 'Prepaid']),
            'notes' => $this->faker->paragraph(),
            'is_active' => true,
        ];
    }
}
