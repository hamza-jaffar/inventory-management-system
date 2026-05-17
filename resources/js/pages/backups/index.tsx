import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, router } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import React, { useState } from 'react';
import {
    Database,
    Download,
    Trash2,
    PlayCircle,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Server,
} from 'lucide-react';

type BackupData = {
    id: number;
    filename: string;
    size: string;
    type: 'manual' | 'auto';
    status: 'completed' | 'failed';
    created_at: string;
};

type Props = {
    backups: BackupData[];
};

export default function BackupIndex({ backups }: Props) {
    const { can } = usePermissions();
    const [backingUp, setBackingUp] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleCreateBackup = () => {
        setBackingUp(true);
        router.post(
            '/backups',
            {},
            {
                onFinish: () => setBackingUp(false),
            },
        );
    };

    const handleDeleteBackup = (id: number) => {
        if (confirm('Are you sure you want to permanently delete this database backup?')) {
            setDeletingId(id);
            router.delete(`/backups/${id}`, {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    return (
        <>
            <Head title="Database Backups" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            Database Backups
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            View and manage system backups to secure your data.
                        </p>
                    </div>

                    {can('manage backups') && (
                        <Button
                            onClick={handleCreateBackup}
                            disabled={backingUp}
                            size="sm"
                            className="bg-primary hover:bg-primary/95 transition-all hover:scale-102"
                        >
                            {backingUp ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Backup...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Run Backup Now
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <Card className="border-muted bg-card shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="text-md flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            Stored Backups ({backups.length})
                        </CardTitle>
                        <CardDescription>
                            All available database SQL snapshots stored on the server.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {backups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <Database className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <h3 className="font-semibold text-base text-foreground">No Backups Found</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                    Trigger a manual backup above or wait for the automatic scheduler to run.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[30%]">File Name</TableHead>
                                            <TableHead className="w-[15%]">Size</TableHead>
                                            <TableHead className="w-[15%]">Type</TableHead>
                                            <TableHead className="w-[15%]">Status</TableHead>
                                            <TableHead className="w-[15%]">Created At</TableHead>
                                            <TableHead className="w-[10%] text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {backups.map((backup) => (
                                            <TableRow key={backup.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-xs font-semibold text-foreground/80">
                                                    {backup.filename}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">
                                                    {backup.size}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={backup.type === 'manual' ? 'secondary' : 'outline'}
                                                        className="font-medium capitalize py-0.5 px-2"
                                                    >
                                                        {backup.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {backup.status === 'completed' ? (
                                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-600 gap-1 py-0.5 px-2 font-medium">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Completed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="gap-1 py-0.5 px-2 font-medium">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            Failed
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1.5 font-medium">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                        {backup.created_at}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-2">
                                                        {backup.status === 'completed' && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                asChild
                                                                className="h-8 w-8 transition-colors hover:bg-accent"
                                                            >
                                                                <a
                                                                    href={`/backups/${backup.id}/download`}
                                                                    download
                                                                    title="Download Backup SQL"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                        {can('manage backups') && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleDeleteBackup(backup.id)}
                                                                disabled={deletingId === backup.id}
                                                                className="h-8 w-8 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                                                title="Delete Backup"
                                                            >
                                                                {deletingId === backup.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BackupIndex.layout = (page: React.ReactNode) => (
    <AppLayout>
        <SettingsLayout>{page}</SettingsLayout>
    </AppLayout>
);
