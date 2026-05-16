<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Identification
            $table->string('name', 150);
            $table->string('sku', 50)->unique()->comment('Stock Keeping Unit');
            $table->string('barcode', 50)->nullable()->unique()->index()->comment('UPC, EAN, or ISBN');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Inventory & Stock Control
            // Using integer assuming whole units. Use decimal(10,2) if selling by weight/length.
            $table->integer('quantity')->default(0);
            $table->integer('safety_stock')->default(5)->comment('Alert threshold when stock runs low');

            // Financials (Using unsigned to prevent negative prices)
            $table->decimal('cost_price', 10, 2)->unsigned()->default(0.00)->comment('What you paid for it');
            $table->decimal('sale_price', 10, 2)->unsigned()->default(0.00)->comment('What you sell it for');
            $table->decimal('retail_price', 10, 2)->unsigned()->nullable()->comment('MSRP / Original price before discounts');

            // Relationships (Foreign Keys)
            $table->foreignId('category_id')->nullable()->constrained(table: 'categories')->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained(table: 'suppliers')->nullOnDelete();

            // Statuses & Tracking
            $table->boolean('is_active')->default(true)->index();
            $table->string('image_path')->nullable();

            // System Tracking
            $table->timestamps();
            $table->softDeletes()->comment('Prevents breaking order history when a product is deleted');

            // Composite Indexes for high-performance searching
            $table->index(['name', 'sku', 'barcode']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
