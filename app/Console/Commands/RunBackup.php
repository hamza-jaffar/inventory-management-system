<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class RunBackup extends Command
{
    protected $signature = 'backup:run {--type=auto : Type of backup (manual|auto)}';

    protected $description = 'Run a database backup';

    public function handle(BackupService $backupService): int
    {
        $type = $this->option('type');

        $this->info("Starting {$type} backup...");

        $backup = $backupService->run($type);

        if ($backup->status === 'failed') {
            $this->error("Backup failed: {$backup->notes}");

            return self::FAILURE;
        }

        $this->info("Backup completed: {$backup->filename} ({$backup->formatted_size})");

        return self::SUCCESS;
    }
}
