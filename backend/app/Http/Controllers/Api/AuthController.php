<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Chef;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\User as AuthenticatableUser;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const LOGIN_MAX_ATTEMPTS = 5;

    private const LOGIN_DECAY_SECONDS = 60;

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $throttleKey = $this->loginThrottleKey($request, $validated['email']);
        if (RateLimiter::tooManyAttempts($throttleKey, self::LOGIN_MAX_ATTEMPTS)) {
            return response()->json([
                'message' => 'Too many login attempts. Please try again in a minute.',
            ], 429);
        }

        /** @var AuthenticatableUser|null $user */
        $user = Chef::query()->where('email', $validated['email'])->first();
        if ($user === null) {
            $user = Employee::query()->where('email', $validated['email'])->first();
        }

        if ($user === null || ! Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($throttleKey, self::LOGIN_DECAY_SECONDS);

            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        $remember = (bool) ($validated['remember'] ?? false);
        $expiresAt = $remember
            ? now()->addDays(30)
            : now()->addHours(12);

        $user->tokens()->where('name', 'api')->delete();

        $plainTextToken = $user->createToken('api', ['*'], $expiresAt)->plainTextToken;

        return response()->json([
            'token' => $plainTextToken,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();
        if ($token !== null) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    private function loginThrottleKey(Request $request, string $email): string
    {
        return Str::lower($email).'|'.$request->ip();
    }
}
