<?php

namespace Database\Seeders;

use App\Models\Chef;
use App\Models\Employee;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password123');

        $chef = Chef::query()->updateOrCreate(
            ['email' => 'admin@ocp.ma'],
            [
                'nom' => 'Responsable mission',
                'prenom' => 'OCP',
                'password' => $password,
            ],
        );

        Employee::query()->updateOrCreate(
            ['email' => 'collaborateur@ocp.ma'],
            [
                'nom' => 'Collaborateur',
                'prenom' => 'OCP',
                'password' => $password,
                'responsable_id' => $chef->id,
            ],
        );
    }
}
