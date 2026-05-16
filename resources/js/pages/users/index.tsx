import AppLayout from '@/layouts/app-layout';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
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
};

export default function UserIndex({ users, roles }: Props) {
    const { can } = usePermissions();

    const handleRoleChange = (userId: number, roleName: string) => {
        router.put(
            `/users/${userId}`,
            { role: roleName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Could show toast here
                },
            },
        );
    };

    return (
        <>
            <Head title="User Management" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Users & Roles
                    </h1>
                    <p className="text-muted-foreground">
                        Manage system access and assign roles.
                    </p>
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
                                                <div className="flex justify-end">
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
                                                                (role) => (
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
