import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendValue,
    className,
}: any) => (
    <Card className={cn('overflow-hidden border-none shadow-md', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                {title}
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{value}</div>
            {(description || trendValue) && (
                <p className="mt-1 flex items-center text-xs text-muted-foreground">
                    {trend && (
                        <span
                            className={cn(
                                'mr-1 flex items-center font-medium',
                                trend === 'up'
                                    ? 'text-emerald-600'
                                    : 'text-rose-600',
                            )}
                        >
                            {trend === 'up' ? (
                                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                            ) : (
                                <ArrowDownRight className="mr-0.5 h-3 w-3" />
                            )}
                            {trendValue}
                        </span>
                    )}
                    {description}
                </p>
            )}
        </CardContent>
    </Card>
);

export default StatCard;
