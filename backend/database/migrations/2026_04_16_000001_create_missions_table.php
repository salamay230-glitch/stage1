<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->timestamps();

            $table->index('status');
            $table->index(['employee_id', 'status']);
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};
