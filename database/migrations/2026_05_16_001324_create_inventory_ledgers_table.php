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
        Schema::create('inventory_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();

            // Tracking the shift
            $table->integer('quantity_before');
            $table->integer('quantity_after');
            $table->integer('variance')->comment('The difference, e.g., -5 or +20');

            // Polymorphic relation to link back to the cause (Sale, PO, or Manual Adjustment)
            $table->string('source_type')->comment('App\Models\SalesOrder, App\Models\StockAdjustment, etc.');
            $table->unsignedBigInteger('source_id');

            $table->timestamps();

            $table->index(['source_type', 'source_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_ledgers');
    }
};
