<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use Illuminate\Http\JsonResponse;

class AdminMissionStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $today = now()->toDateString();

        return response()->json([
            'total_missions' => Mission::query()->count(),
            'ongoing_missions' => Mission::query()->where('status', Mission::STATUS_IN_PROGRESS)->count(),
            'completed_missions' => Mission::query()->where('status', Mission::STATUS_COMPLETED)->count(),
            'delayed_missions' => Mission::query()
                ->whereIn('status', [Mission::STATUS_PENDING, Mission::STATUS_IN_PROGRESS])
                ->whereDate('end_date', '<', $today)
                ->count(),
        ]);
    }
}
