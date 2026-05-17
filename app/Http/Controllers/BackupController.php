<?php

namespace App\Http\Controllers;

use App\Models\Backup;
use App\Services\BackupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    public function __construct(protected BackupService $backupService) {}

    /**
     * Display all backups (admin only).
     */
    public function index(): InertiaResponse
    {
        $backups = Backup::latest()
            ->get()
            ->map(fn (Backup $b) => [
                'id' => $b->id,
                'filename' => $b->filename,
                'size' => $b->formatted_size,
                'type' => $b->type,
                'status' => $b->status,
                'created_at' => $b->created_at->format('d M Y, H:i'),
            ]);

        return inertia('backups/index', [
            'backups' => $backups,
        ]);
    }

    /**
     * Trigger a manual backup.
     */
    public function store(Request $request): RedirectResponse
    {
        $backup = $this->backupService->run('manual');

        if ($backup->status === 'failed') {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Database backup failed: '.$backup->notes)]);

            return back()->with('error', 'Backup failed: '.$backup->notes);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Database backup created successfully: '.$backup->filename)]);

        return back()->with('status', 'backup-created');
    }

    /**
     * Download a backup file.
     */
    public function download(Backup $backup): BinaryFileResponse
    {
        $path = $this->backupService->absolutePath($backup);

        abort_unless(file_exists($path), 404, 'Backup file not found.');

        return Response::download($path, $backup->filename);
    }

    /**
     * Delete a backup record and file.
     */
    public function destroy(Backup $backup): RedirectResponse
    {
        $this->backupService->delete($backup);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Database backup deleted successfully.')]);

        return back()->with('status', 'backup-deleted');
    }
}
