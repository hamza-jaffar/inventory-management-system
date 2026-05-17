<?php

use App\Enums\PermissionEnum;
use App\Models\Backup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed Spatie permissions first
    $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
});

test('guest cannot access backup pages', function () {
    $this->get('/backups')->assertRedirect('/login');
    $this->post('/backups')->assertRedirect('/login');
});

test('user without permission cannot manage backups', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/backups')->assertStatus(403);
    $this->actingAs($user)->post('/backups')->assertStatus(403);
});

test('authorized user can trigger backup and download/delete it', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(PermissionEnum::MANAGE_BACKUPS->value);

    // 1. Visit index page
    $response = $this->actingAs($user)->get('/backups');
    $response->assertOk();

    // 2. Trigger manual backup
    $response = $this->actingAs($user)->post('/backups');
    $response->assertRedirect();
    $response->assertSessionHas('status', 'backup-created');

    $this->assertDatabaseCount('backups', 1);
    $backup = Backup::first();
    expect($backup->status)->toBe('completed');
    expect($backup->type)->toBe('manual');

    // 3. Download the backup
    $response = $this->actingAs($user)->get("/backups/{$backup->id}/download");
    $response->assertOk();

    // Clean up filesystem file created by copy()
    $absolutePath = storage_path('app/'.$backup->path);
    if (file_exists($absolutePath)) {
        unlink($absolutePath);
    }

    // 4. Delete the backup
    $response = $this->actingAs($user)->delete("/backups/{$backup->id}");
    $response->assertRedirect();
    $response->assertSessionHas('status', 'backup-deleted');

    $this->assertDatabaseCount('backups', 0);
});
