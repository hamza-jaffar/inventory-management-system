import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { Plus, Trash2 } from 'lucide-react';
import usersRoute from '@/routes/users';
import users from '@/routes/users';

type Role = {
    id: number;
    name: string;
    label: string;
};

type UserData = {
    id: number;
    name: string;
    email: string;
    role: string | null;
};

type Props = {
    users: UserData[];
    roles: Role[];
    current_user_id: number;
};

export default function UserIndex({ users, roles, current_user_id }: Props) {
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            email: '',
            password: '',
            role: roles[0]?.name || '',
        });

    const handleRoleChange = (userId: number, roleName: string) => {
        router.put(
            `/users/${userId}`,
            { role: roleName },
            {
                preserveScroll: true,
            },
        );
    };

    const handleDeleteUser = (userId: number, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            router.delete(`/users/${userId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users', {
            onSuccess: () => {
                setOpen(false);
                reset();
                clearErrors();
            },
        });
    };

    return (
        <>
            <Head title="User Management" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Users & Roles
                        </h1>
                        <p className="text-muted-foreground">
                            Manage system access and assign roles.
                        </p>
                    </div>

                    {can('manage users') && (
                        <Dialog
                            open={open}
                            onOpenChange={(val) => {
                                setOpen(val);
                                if (!val) {
                                    reset();
                                    clearErrors();
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                    <DialogDescription>
                                        Create a new system user and assign
                                        their access permissions.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4 py-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="John Doe"
                                            required
                                        />
                                        {errors.name && (
                                            <span className="text-xs text-destructive">
                                                {errors.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="john@example.com"
                                            required
                                        />
                                        {errors.email && (
                                            <span className="text-xs text-destructive">
                                                {errors.email}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="••••••••"
                                            required
                                        />
                                        {errors.password && (
                                            <span className="text-xs text-destructive">
                                                {errors.password}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={data.role}
                                            onValueChange={(val) =>
                                                setData('role', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem
                                                        key={role.id}
                                                        value={role.name}
                                                    >
                                                        {role.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.role && (
                                            <span className="text-xs text-destructive">
                                                {errors.role}
                                            </span>
                                        )}
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Save User
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                            Assign permissions to users by granting them
                            specific roles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.role === 'admin'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {roles.find(
                                                    (r) => r.name === user.role,
                                                )?.label ||
                                                    user.role ||
                                                    'No Role'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {can('manage users') ? (
                                                <div className="flex items-center justify-end gap-3">
                                                    {user.id !==
                                                    current_user_id ? (
                                                        <>
                                                            <Select
                                                                defaultValue={
                                                                    user.role ||
                                                                    undefined
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    handleRoleChange(
                                                                        user.id,
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-[180px]">
                                                                    <SelectValue placeholder="Select a role" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {roles.map(
                                                                        (
                                                                            role,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    role.id
                                                                                }
                                                                                value={
                                                                                    role.name
                                                                                }
                                                                            >
                                                                                {
                                                                                    role.label
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleDeleteUser(
                                                                        user.id,
                                                                        user.name,
                                                                    )
                                                                }
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-dashed px-2 py-1 text-xs"
                                                        >
                                                            Current User
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    Restricted
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: users.index(),
        },
    ],
};
