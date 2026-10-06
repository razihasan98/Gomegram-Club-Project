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
        // 1. Members Table
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('member_id')->unique();
            $table->string('name');
            $table->string('bangla_name')->nullable();
            $table->string('photo')->nullable();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->date('joining_date')->nullable();
            $table->string('membership_type')->default('General'); // General, Executive, Lifetime, Youth, Honorary
            $table->string('position')->nullable(); // President, Vice President, General Secretary, etc.
            $table->string('status')->default('Active'); // Active, Inactive
            $table->boolean('is_phone_public')->default(true);
            $table->boolean('is_email_public')->default(true);
            $table->boolean('is_address_public')->default(true);
            $table->boolean('is_financial_public')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Events Table
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('banner_image')->nullable();
            $table->date('event_date');
            $table->string('start_time')->nullable();
            $table->string('location');
            $table->decimal('event_fee', 10, 2)->default(0);
            $table->date('registration_deadline')->nullable();
            $table->string('status')->default('upcoming'); // upcoming, ongoing, completed, cancelled
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // 3. Event Member Fees Table
        Schema::create('event_member_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->decimal('event_fee', 10, 2)->default(0);
            $table->decimal('previous_due_at_time', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->unique(['event_id', 'member_id']);
            $table->timestamps();
        });

        // 4. Payment Transactions Table (Auditable ledger, supports partial installments)
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->foreignId('event_member_fee_id')->nullable()->constrained('event_member_fees')->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->date('payment_date');
            $table->string('payment_method')->default('Cash'); // Cash, Bank, bKash, Nagad, Rocket, Other
            $table->string('transaction_reference')->nullable();
            $table->string('received_by')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        // 5. Gallery Items Table
        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('caption')->nullable();
            $table->string('image_path');
            $table->string('category')->default('Puja Celebration'); // Puja Celebration, Annual Picnic, Sports, Cultural Program, Social Activities, Other
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 6. Contact Messages Table
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('subject')->nullable();
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();
        });

        // 7. Club Settings Table
        Schema::create('club_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('club_settings');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('event_member_fees');
        Schema::dropIfExists('events');
        Schema::dropIfExists('members');
    }
};
