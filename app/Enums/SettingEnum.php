<?php

namespace App\Enums;

enum SettingEnum: string
{
    case APP_NAME = 'app_name';
    case APP_CURRENCY = 'app_currency';
    case APP_CURRENCY_SYMBOL = 'app_currency_symbol';
    case APP_TIMEZONE = 'app_timezone';
    case APP_DATE_FORMAT = 'app_date_format';
    case APP_TIME_FORMAT = 'app_time_format';
    case APP_LANGUAGE = 'app_language';
    case APP_COUNTRY = 'app_country';
    case APP_STATE = 'app_state';
    case APP_CITY = 'app_city';
    case APP_ADDRESS = 'app_address';
    case APP_PHONE = 'app_phone';
    case APP_EMAIL = 'app_email';
    case APP_LOGO_URL = 'app_logo_url';
    case APP_FAVICON_URL = 'app_favicon_url';
}
