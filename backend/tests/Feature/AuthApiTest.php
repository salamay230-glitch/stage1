<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_token_and_user_resource(): void
    {
        $user = User::factory()->create([
            'email' => 'tester@example.com',
            'password' => 'secret-pass-99',
            'role' => User::ROLE_COLLABORATEUR,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'tester@example.com',
            'password' => 'secret-pass-99',
            'remember' => false,
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.email', 'tester@example.com')
            ->assertJsonPath('user.role', User::ROLE_COLLABORATEUR);

        $this->assertNotEmpty($response->json('token'));
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }

    public function test_invalid_credentials_returns_validation_error(): void
    {
        User::factory()->create([
            'email' => 'tester@example.com',
            'password' => 'right-password',
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
        $user = User::factory()->create(['role' => User::ROLE_ADMIN]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/home');

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_admin_route_forbidden_for_collaborateur(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_COLLABORATEUR]);
        $token = $user->createToken('api')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/ping')
            ->assertForbidden();
    }

    public function test_admin_route_allowed_for_admin(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $token = $user->createToken('api')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/ping')
            ->assertOk()
            ->assertJsonPath('message', 'Admin only.');
    }
}
