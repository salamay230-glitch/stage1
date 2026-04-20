<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chef;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
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

    private function resolveChef(Request $request): ?Chef
    {
        $user = $request->user();

        return $user instanceof Chef ? $user : null;
    }
}
