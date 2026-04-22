<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeMissionController;
use App\Http\Controllers\Api\EmployeeNotificationController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\ResponsableEmployeeController;
use App\Http\Controllers\Api\ResponsableMissionController;
use App\Http\Controllers\Api\ResponsableMissionStatsController;
use App\Http\Controllers\Api\ResponsableNotificationController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/home', HomeController::class);

    Route::middleware('role:responsable')->group(function (): void {
        Route::get('/responsable/mission-stats', ResponsableMissionStatsController::class);
        Route::get('/responsable/missions', [ResponsableMissionController::class, 'index']);
        Route::post('/responsable/missions', [ResponsableMissionController::class, 'store']);
        Route::put('/responsable/missions/{mission}', [ResponsableMissionController::class, 'update']);
        Route::delete('/responsable/missions/{mission}', [ResponsableMissionController::class, 'destroy']);
        Route::get('/responsable/notifications', [ResponsableNotificationController::class, 'index']);
        Route::put('/responsable/notifications/{notification}/read', [ResponsableNotificationController::class, 'markAsRead']);
        Route::put('/responsable/notifications/read-all', [ResponsableNotificationController::class, 'markAllAsRead']);
        Route::get('/responsable/employees', [ResponsableEmployeeController::class, 'index']);
        Route::post('/responsable/employees', [ResponsableEmployeeController::class, 'store']);
        Route::put('/responsable/employees/{employee}', [ResponsableEmployeeController::class, 'update']);
        Route::delete('/responsable/employees/{employee}', [ResponsableEmployeeController::class, 'destroy']);

        // Legacy /api/admin/* — même contrôleurs (cache navigateur, anciens builds)
        Route::get('/admin/mission-stats', ResponsableMissionStatsController::class);
        Route::get('/admin/missions', [ResponsableMissionController::class, 'index']);
        Route::post('/admin/missions', [ResponsableMissionController::class, 'store']);
        Route::put('/admin/missions/{mission}', [ResponsableMissionController::class, 'update']);
        Route::delete('/admin/missions/{mission}', [ResponsableMissionController::class, 'destroy']);
        Route::get('/admin/notifications', [ResponsableNotificationController::class, 'index']);
        Route::put('/admin/notifications/{notification}/read', [ResponsableNotificationController::class, 'markAsRead']);
        Route::put('/admin/notifications/read-all', [ResponsableNotificationController::class, 'markAllAsRead']);
        Route::get('/admin/employees', [ResponsableEmployeeController::class, 'index']);
        Route::post('/admin/employees', [ResponsableEmployeeController::class, 'store']);
        Route::put('/admin/employees/{employee}', [ResponsableEmployeeController::class, 'update']);
        Route::delete('/admin/employees/{employee}', [ResponsableEmployeeController::class, 'destroy']);
    });

    Route::middleware('role:collaborateur')->group(function (): void {
        Route::get('/employee/missions', [EmployeeMissionController::class, 'index']);
        Route::put('/employee/missions/{mission}/status', [EmployeeMissionController::class, 'updateStatus']);
        Route::get('/employee/notifications', [EmployeeNotificationController::class, 'index']);
        Route::put('/employee/notifications/{notification}/read', [EmployeeNotificationController::class, 'markAsRead']);
        Route::put('/employee/notifications/read-all', [EmployeeNotificationController::class, 'markAllAsRead']);
    });
});
