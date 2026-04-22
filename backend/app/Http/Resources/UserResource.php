<?php

namespace App\Http\Resources;

use App\Models\Chef;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $nomComplet = trim(($this->prenom ?? '').' '.($this->nom ?? ''));
        $role = $this->resource instanceof Chef ? 'responsable' : 'collaborateur';

        return [
            'id' => $this->id,
            'name' => $nomComplet,
            'email' => $this->email,
            'role' => $role,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
