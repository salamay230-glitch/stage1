<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chef;
use App\Models\Notification;
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

        $notifications = Notification::query()
            ->with(['employee:id,nom,prenom,email,chef_id'])
            ->whereHas('employee', static fn ($query) => $query->where('chef_id', $chef->id))
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
            ->whereHas('employee', static fn ($query) => $query->where('chef_id', $chef->id))
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
            ->whereHas('employee', static fn ($query) => $query->where('chef_id', $chef->id))
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications marked as read.']);
    }

    private function resolveChef(Request $request): ?Chef
    {
        $user = $request->user();

        return $user instanceof Chef ? $user : null;
    }
}
