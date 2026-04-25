<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chef;
use App\Models\Mission;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResponsableNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $this->createOverdueMissionAlerts($chef->id);

        $notifications = Notification::query()
            ->with(['employee:id,nom,prenom,email,responsable_id'])
            ->whereHas('employee', static fn ($query) => $query->where('responsable_id', $chef->id))
            ->latest()
            ->limit(12)
            ->get();

        return response()->json(['notifications' => $notifications]);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $belongsToChef = Notification::query()
            ->whereKey($notification->id)
            ->whereHas('employee', static fn ($query) => $query->where('responsable_id', $chef->id))
            ->exists();

        if (! $belongsToChef) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $notification->is_read = true;
        $notification->save();

        return response()->json(['notification' => $notification->fresh()]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        Notification::query()
            ->where('is_read', false)
            ->whereHas('employee', static fn ($query) => $query->where('responsable_id', $chef->id))
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications marked as read.']);
    }

    private function resolveChef(Request $request): ?Chef
    {
        $user = $request->user();

        return $user instanceof Chef ? $user : null;
    }

    private function createOverdueMissionAlerts(int $responsableId): void
    {
        $today = Carbon::today();

        $missions = Mission::query()
            ->where('status', '!=', Mission::STATUS_COMPLETED)
            ->whereDate('end_date', '<', $today)
            ->whereNull('overdue_notified_at')
            ->whereHas('employee', static fn ($query) => $query->where('responsable_id', $responsableId))
            ->with('employee:id')
            ->get();

        foreach ($missions as $mission) {
            Notification::query()->create([
                'employee_id' => $mission->employee_id,
                'message' => 'La mission '.$mission->title.' n\'est pas encore terminée et a dépassé l\'échéance.',
                'is_read' => false,
            ]);

            $mission->overdue_notified_at = now();
            $mission->save();
        }
    }
}
