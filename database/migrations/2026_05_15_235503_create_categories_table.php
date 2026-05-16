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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // Basic Info
            $table->string('name')->unique();
            $table->string('slug')->unique()->comment('Used for clean URL generation');
            $table->text('description')->nullable();

            // Self-referencing relationship for Subcategories (e.g., Electronics -> Laptops)
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete()
                ->comment('Links a subcategory to its parent category');

            // Status & Order
            $table->boolean('is_active')->default(true)->index();
            $table->integer('sort_order')->default(0)->comment('For custom sorting in frontend menus');

            // System Tracking
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
