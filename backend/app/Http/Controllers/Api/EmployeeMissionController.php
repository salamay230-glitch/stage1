<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Mission;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeMissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if ($employee === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $missions = Mission::query()
            ->where('employee_id', $employee->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['missions' => $missions]);
    }

    public function updateStatus(Request $request, Mission $mission): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if ($employee === null || $mission->employee_id !== $employee->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in([Mission::STATUS_IN_PROGRESS, Mission::STATUS_COMPLETED])],
        ]);

        $mission->status = $validated['status'];
        $mission->save();

        Notification::query()->create([
            'employee_id' => $employee->id,
            'message' => 'Mission status updated: '.$mission->title.' ('.$mission->status.')',
            'is_read' => false,
        ]);

        return response()->json(['mission' => $mission->fresh()]);
    }

    private function resolveEmployee(Request $request): ?Employee
    {
        $user = $request->user();

        return $user instanceof Employee ? $user : null;
    }
}
