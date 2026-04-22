<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use Illuminate\Http\JsonResponse;

class ResponsableMissionStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'total_missions' => Mission::query()->count(),
            'ongoing_missions' => Mission::query()->where('status', Mission::STATUS_IN_PROGRESS)->count(),
            'completed_missions' => Mission::query()->where('status', Mission::STATUS_COMPLETED)->count(),
            'not_started_missions' => Mission::query()
                ->where('status', Mission::STATUS_PENDING)
                ->count(),
        ]);
    }
}
