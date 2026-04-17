<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chef;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminEmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $employees = Employee::query()
            ->where('chef_id', $chef->id)
            ->orderBy('nom')
            ->orderBy('prenom')
            ->get(['id', 'nom', 'prenom', 'email', 'chef_id', 'created_at', 'updated_at']);

        return response()->json(['employees' => $employees]);
    }

    public function store(Request $request): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('employees', 'email')],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $employee = Employee::query()->create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'chef_id' => $chef->id,
        ]);

        return response()->json(['employee' => $employee], 201);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null || $employee->chef_id !== $chef->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->id)],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $employee->nom = $validated['nom'];
        $employee->prenom = $validated['prenom'];
        $employee->email = $validated['email'];
        if (! empty($validated['password'])) {
            $employee->password = $validated['password'];
        }
        $employee->save();

        return response()->json(['employee' => $employee->fresh()]);
    }

    public function destroy(Request $request, Employee $employee): JsonResponse
    {
        $chef = $this->resolveChef($request);
        if ($chef === null || $employee->chef_id !== $chef->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $employee->delete();

        return response()->json(['message' => 'Employee deleted.']);
    }

    private function resolveChef(Request $request): ?Chef
    {
        $user = $request->user();

        return $user instanceof Chef ? $user : null;
    }
}
