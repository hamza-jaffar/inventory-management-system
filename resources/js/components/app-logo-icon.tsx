import { useSettings } from '@/hooks/use-settings';
import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const { app_name, app_logo_url } = useSettings();

    if (app_logo_url) {
        return (
            <img
                src={app_logo_url}
                alt={app_name}
                {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
            />
        );
    }

    return <img src="/favicon.ico" alt="Logo" />;
}
