<?php

namespace Database\Seeders;

use App\Models\User;
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

        User::query()->updateOrCreate(
            ['email' => 'admin@ocp.ma'],
            [
                'name' => 'Administrateur OCP',
                'password' => $password,
                'role' => User::ROLE_ADMIN,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'collaborateur@ocp.ma'],
            [
                'name' => 'Collaborateur OCP',
                'password' => $password,
                'role' => User::ROLE_COLLABORATEUR,
            ],
        );
    }
}
