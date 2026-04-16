<?php

use App\Http\Controllers\Api\AdminMissionStatsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/home', HomeController::class);

    Route::middleware('role:admin')->group(function (): void {
        Route::get('/admin/dashboard', fn () => response()->json([
            'message' => 'Admin dashboard access granted.',
        ]));
        Route::get('/admin/mission-stats', AdminMissionStatsController::class);
        Route::get('/admin/ping', fn () => response()->json([
            'message' => 'Admin only.',
        ]));
    });

    Route::middleware('role:collaborateur')->group(function (): void {
        Route::get('/collaborateur/dashboard', fn () => response()->json([
            'message' => 'Collaborateur dashboard access granted.',
        ]));
    });
});
