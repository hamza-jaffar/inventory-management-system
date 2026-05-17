<?php

namespace App\Services;

use App\Models\Backup;
use Illuminate\Support\Facades\Storage;

class BackupService
{
    /**
     * Run a database backup and persist the record.
     *
     * @param  'manual'|'auto'  $type
     */
    public function run(string $type = 'manual'): Backup
    {
        $filename = 'backup_'.now()->format('Y_m_d_His').'.sql';
        $relativePath = 'backups/'.$filename;
        $absolutePath = storage_path('app/'.$relativePath);

        // Ensure directory exists
        if (! is_dir(storage_path('app/backups'))) {
            mkdir(storage_path('app/backups'), 0755, true);
        }

        $dbConfig = config('database.connections.'.config('database.default'));
        $driver = $dbConfig['driver'] ?? 'mysql';

        $status = 'completed';
        $notes = null;

        if ($driver === 'sqlite') {
            $sqlitePath = $dbConfig['database'];
            if ($sqlitePath === ':memory:') {
                try {
                    file_put_contents($absolutePath, '-- SQLite In-Memory Database Backup Placeholder');
                } catch (\Exception $e) {
                    $status = 'failed';
                    $notes = $e->getMessage();
                }
            } elseif (! file_exists($sqlitePath)) {
                $status = 'failed';
                $notes = "SQLite database file not found at: {$sqlitePath}";
            } else {
                try {
                    copy($sqlitePath, $absolutePath);
                } catch (\Exception $e) {
                    $status = 'failed';
                    $notes = $e->getMessage();
                }
            }
        } else {
            $host = $dbConfig['host'] ?? '127.0.0.1';
            $port = $dbConfig['port'] ?? '3306';
            $database = $dbConfig['database'] ?? '';
            $username = $dbConfig['username'] ?? '';
            $password = $dbConfig['password'] ?? '';

            $command = sprintf(
                'mysqldump --user=%s --password=%s --host=%s --port=%s %s > %s 2>&1',
                escapeshellarg($username),
                escapeshellarg((string) $password),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($database),
                escapeshellarg($absolutePath)
            );

            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                $status = 'failed';
                $notes = implode("\n", $output);
            }
        }

        $size = file_exists($absolutePath) ? filesize($absolutePath) : 0;

        return Backup::create([
            'filename' => $filename,
            'disk' => 'local',
            'path' => $relativePath,
            'size' => $size,
            'type' => $type,
            'status' => $status,
            'notes' => $notes,
        ]);
    }

    /**
     * Delete a backup record and its file from storage.
     */
    public function delete(Backup $backup): bool
    {
        if (Storage::exists($backup->path)) {
            Storage::delete($backup->path);
        }

        return $backup->delete();
    }

    /**
     * Get the absolute filesystem path for a backup (for download).
     */
    public function absolutePath(Backup $backup): string
    {
        return storage_path('app/'.$backup->path);
    }
}
