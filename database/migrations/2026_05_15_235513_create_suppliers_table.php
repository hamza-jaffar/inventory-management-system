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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();

            // Company Profile
            $table->string('name')->unique()->comment('Official company or vendor name');
            $table->string('code')->unique()->nullable()->comment('Custom internal supplier code, e.g., SUP-001');
            $table->string('tax_number')->unique()->nullable()->comment('VAT, EIN, or GST number for tax invoices');

            // Primary Contact Person
            $table->string('contact_name')->nullable()->comment('Name of the account manager or agent');
            $table->string('email')->nullable()->index();
            $table->string('phone', 30)->nullable();
            $table->string('website')->nullable();

            // Physical / Billing Address
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state_region')->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 3)->nullable()->comment('ISO 3-letter country code, e.g., USA, CAN');

            // Inventory Settings & Performance Metrics
            $table->integer('lead_time_days')->default(0)->comment('Average days it takes to deliver goods after order');
            $table->string('payment_terms')->nullable()->comment('e.g., Net 30, Net 60, Due on Receipt');
            $table->text('notes')->nullable()->comment('Internal notes about reliability or contract details');

            // Status
            $table->boolean('is_active')->default(true)->index();

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
        Schema::dropIfExists('suppliers');
    }
};
