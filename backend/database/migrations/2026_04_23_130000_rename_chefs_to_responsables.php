<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('chefs') && ! Schema::hasTable('responsables')) {
            Schema::rename('chefs', 'responsables');
        }

        if (Schema::hasTable('employees') && Schema::hasColumn('employees', 'chef_id') && ! Schema::hasColumn('employees', 'responsable_id')) {
            try {
                DB::statement('ALTER TABLE employees DROP FOREIGN KEY employees_chef_id_foreign');
            } catch (\Throwable) {
                // Foreign key may have a different name depending on environment.
            }

            Schema::table('employees', function (Blueprint $table): void {
                $table->renameColumn('chef_id', 'responsable_id');
            });

            Schema::table('employees', function (Blueprint $table): void {
                $table->foreign('responsable_id')->references('id')->on('responsables')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('employees') && Schema::hasColumn('employees', 'responsable_id') && ! Schema::hasColumn('employees', 'chef_id')) {
            try {
                DB::statement('ALTER TABLE employees DROP FOREIGN KEY employees_responsable_id_foreign');
            } catch (\Throwable) {
                // Foreign key may have a different name depending on environment.
            }

            Schema::table('employees', function (Blueprint $table): void {
                $table->renameColumn('responsable_id', 'chef_id');
            });

            if (Schema::hasTable('chefs')) {
                Schema::table('employees', function (Blueprint $table): void {
                    $table->foreign('chef_id')->references('id')->on('chefs')->cascadeOnDelete();
                });
            }
        }

        if (Schema::hasTable('responsables') && ! Schema::hasTable('chefs')) {
            Schema::rename('responsables', 'chefs');
        }
    }
};
