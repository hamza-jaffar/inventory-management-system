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
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained(table: 'products')->onDelete('cascade');
            $table->foreignId('user_id')->constrained(table: 'users')->comment('Who made the adjustment');

            $table->integer('quantity_change')->comment('Can be positive (e.g., +10 found) or negative (e.g., -2 broken)');
            $table->string('type')->comment('damage, theft, audit_loss, audit_gain, promo_sample');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
