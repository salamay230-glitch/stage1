<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if ($employee === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $notifications = Notification::query()
            ->where('employee_id', $employee->id)
            ->latest()
            ->limit(30)
            ->get();

        return response()->json(['notifications' => $notifications]);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if ($employee === null || $notification->employee_id !== $employee->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $notification->is_read = true;
        $notification->save();

        return response()->json(['notification' => $notification->fresh()]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if ($employee === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        Notification::query()
            ->where('employee_id', $employee->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications marked as read.']);
    }

    private function resolveEmployee(Request $request): ?Employee
    {
        $user = $request->user();

        return $user instanceof Employee ? $user : null;
    }
}
