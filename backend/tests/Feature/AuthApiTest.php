<?php

namespace Tests\Feature;

use App\Models\Chef;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_token_and_user_resource(): void
    {
        $chef = Chef::query()->create([
            'nom' => 'Chef',
            'prenom' => 'OCP',
            'email' => 'admin@ocp.ma',
            'password' => 'password123',
        ]);

        $employee = Employee::query()->create([
            'nom' => 'Collaborateur',
            'prenom' => 'OCP',
            'email' => 'tester@example.com',
            'password' => 'secret-pass-99',
            'chef_id' => $chef->id,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'tester@example.com',
            'password' => 'secret-pass-99',
            'remember' => false,
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.email', 'tester@example.com')
            ->assertJsonPath('user.role', 'collaborateur');

        $this->assertNotEmpty($response->json('token'));
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $employee->id,
            'tokenable_type' => Employee::class,
        ]);
    }

    public function test_invalid_credentials_returns_validation_error(): void
    {
        $chef = Chef::query()->create([
            'nom' => 'Chef',
            'prenom' => 'OCP',
            'email' => 'admin@ocp.ma',
            'password' => 'password123',
        ]);

        Employee::query()->create([
            'nom' => 'Collaborateur',
            'prenom' => 'OCP',
            'email' => 'tester@example.com',
            'password' => 'right-password',
            'chef_id' => $chef->id,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'tester@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_home_requires_authentication(): void
    {
        $this->getJson('/api/home')->assertUnauthorized();
    }

    public function test_home_returns_authenticated_user(): void
    {
        $user = Chef::query()->create([
            'nom' => 'Chef',
            'prenom' => 'OCP',
            'email' => 'admin@ocp.ma',
            'password' => 'password123',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/home');

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_logout_revokes_token(): void
    {
        $chef = Chef::query()->create([
            'nom' => 'Chef',
            'prenom' => 'OCP',
            'email' => 'admin@ocp.ma',
            'password' => 'password123',
        ]);

        $user = Employee::query()->create([
            'nom' => 'Collaborateur',
            'prenom' => 'OCP',
            'email' => 'collaborateur@ocp.ma',
            'password' => 'password123',
            'chef_id' => $chef->id,
        ]);
        $token = $user->createToken('api')->plainTextToken;

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_admin_route_forbidden_for_collaborateur(): void
    {
        $chef = Chef::query()->create([
            'nom' => 'Chef',
            'prenom' => 'OCP',
            'email' => 'admin@ocp.ma',
            'password' => 'password123',
        ]);

        $user = Employee::query()->create([
            'nom' => 'Collaborateur',
            'prenom' => 'OCP',
            'email' => 'collaborateur@ocp.ma',
            'password' => 'password123',
            'chef_id' => $chef->id,
        ]);
        $token = $user->createToken('api')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/mission-stats')
            ->assertForbidden();
    }

    public function test_admin_route_allowed_for_admin(): void
    {
        $user = Chef::query()->create([
            'nom' => 'Chef',
            'prenom' => 'OCP',
            'email' => 'admin@ocp.ma',
            'password' => 'password123',
        ]);
        $token = $user->createToken('api')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/mission-stats')
            ->assertOk()
            ->assertJsonStructure([
                'total_missions',
                'ongoing_missions',
                'completed_missions',
                'delayed_missions',
            ]);
    }
}
