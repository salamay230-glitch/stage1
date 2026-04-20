<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chef;
use App\Models\Employee;
use App\Models\Mission;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminMissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $missions = Mission::query()
            ->with(['employee:id,nom,prenom,email,chef_id'])
            ->whereHas('employee', static fn ($query) => $query->where('chef_id', $chef->id))
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['missions' => $missions]);
    }

    public function store(Request $request): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $this->validateMission($request, $chef);

        $mission = Mission::query()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'employee_id' => $validated['employee_id'],
            'status' => $validated['status'] ?? Mission::STATUS_PENDING,
            'start_date' => $validated['start_date'] ?? now()->toDateString(),
            'end_date' => $validated['end_date'] ?? now()->toDateString(),
        ]);

        Notification::query()->create([
            'employee_id' => $mission->employee_id,
            'message' => 'New mission assigned: '.$mission->title,
            'is_read' => false,
        ]);

        return response()->json([
            'mission' => $mission->load('employee:id,nom,prenom,email,chef_id'),
        ], 201);
    }

    public function update(Request $request, Mission $mission): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null || ! $this->belongsToChef($mission, $chef)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $this->validateMission($request, $chef);
        $originalEmployeeId = $mission->employee_id;

        $mission->fill([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'employee_id' => $validated['employee_id'],
            'status' => $validated['status'] ?? $mission->status,
            'start_date' => $validated['start_date'] ?? $mission->start_date?->toDateString() ?? now()->toDateString(),
            'end_date' => $validated['end_date'] ?? $mission->end_date?->toDateString() ?? now()->toDateString(),
        ]);
        $mission->save();

        if ($originalEmployeeId !== $mission->employee_id) {
            Notification::query()->create([
                'employee_id' => $mission->employee_id,
                'message' => 'Mission reassigned to you: '.$mission->title,
                'is_read' => false,
            ]);
        } else {
            Notification::query()->create([
                'employee_id' => $mission->employee_id,
                'message' => 'Mission updated: '.$mission->title,
                'is_read' => false,
            ]);
        }

        return response()->json([
            'mission' => $mission->load('employee:id,nom,prenom,email,chef_id'),
        ]);
    }

    public function destroy(Request $request, Mission $mission): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null || ! $this->belongsToChef($mission, $chef)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        Notification::query()->create([
            'employee_id' => $mission->employee_id,
            'message' => 'Mission removed: '.$mission->title,
            'is_read' => false,
        ]);

        $mission->delete();

        return response()->json(['message' => 'Mission deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateMission(Request $request, Chef $chef): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'employee_id' => [
                'required',
                'integer',
                Rule::exists('employees', 'id')->where(static fn ($query) => $query->where('chef_id', $chef->id)),
            ],
            'status' => ['nullable', Rule::in([Mission::STATUS_PENDING, Mission::STATUS_IN_PROGRESS, Mission::STATUS_COMPLETED])],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ]);
    }

    private function belongsToChef(Mission $mission, Chef $chef): bool
    {
        return Employee::query()
            ->where('id', $mission->employee_id)
            ->where('chef_id', $chef->id)
            ->exists();
    }

    private function resolveChef(Request $request): ?Chef
    {
        $user = $request->user();

        return $user instanceof Chef ? $user : null;
    }
}
