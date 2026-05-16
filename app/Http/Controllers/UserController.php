<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name, // Assume single role for simplicity
            ];
        });

        $roles = \Spatie\Permission\Models\Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'label' => \App\Enums\RoleEnum::tryFrom($role->name)?->label() ?? $role->name,
            ];
        });

        return inertia('users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|exists:roles,name',
        ]);

        if ($user->hasRole('admin') && auth()->id() !== $user->id) {
            abort(403, 'Cannot change another admin role.');
        }

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'User role updated.');
    }
}
