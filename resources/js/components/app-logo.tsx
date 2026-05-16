import AppLogoIcon from '@/components/app-logo-icon';
import { useSettings } from '@/hooks/use-settings';

export default function AppLogo() {
    const { app_name, app_logo_url } = useSettings();

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                {app_logo_url ? (
                    <img
                        src={app_logo_url}
                        alt={app_name}
                        className="size-full object-cover"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {app_name}
                </span>
            </div>
        </>
    );
}
