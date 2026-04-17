<?php

use App\Http\Controllers\Api\AdminMissionStatsController;
use App\Http\Controllers\Api\AdminEmployeeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/home', HomeController::class);

    Route::middleware('role:admin')->group(function (): void {
        Route::get('/admin/mission-stats', AdminMissionStatsController::class);
        Route::get('/admin/employees', [AdminEmployeeController::class, 'index']);
        Route::post('/admin/employees', [AdminEmployeeController::class, 'store']);
        Route::put('/admin/employees/{employee}', [AdminEmployeeController::class, 'update']);
        Route::delete('/admin/employees/{employee}', [AdminEmployeeController::class, 'destroy']);
    });
});
