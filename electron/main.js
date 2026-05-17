const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const spawn = require('cross-spawn');
const portfinder = require('portfinder');

let mainWindow = null;
let splashWindow = null;
let phpServerProcess = null;

// Determine if we are in development mode
const isDev = !app.isPackaged;

// Laravel paths configuration
const laravelRoot = isDev 
  ? path.join(__dirname, '../') 
  : path.join(process.resourcesPath, 'app');

const artisanPath = path.join(laravelRoot, 'artisan');
const publicPath = path.join(laravelRoot, 'public');

// Setup persistent logging in AppData to help debug environment issues
const userDataPath = app.getPath('userData');
const logPath = path.join(userDataPath, 'desktop_app.log');

// Clear log file on startup
fs.writeFileSync(logPath, `[${new Date().toISOString()}] Desktop Shell Starting...\n`);

function logToFile(message) {
    const logMsg = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logPath, logMsg);
    console.log(message);
}

// Find a PHP binary
function getPhpBinaryPath() {
    if (isDev) {
        logToFile('Development mode: Using system PHP');
        return 'php';
    } else {
        const bundledPhp = path.join(process.resourcesPath, 'bin', 'php', 'php.exe');
        logToFile(`Production mode: Checking bundled PHP at: ${bundledPhp}`);
        if (fs.existsSync(bundledPhp)) {
            logToFile('Bundled PHP binary found successfully.');
            return bundledPhp;
        }
        logToFile('WARNING: Bundled PHP not found. Falling back to system PHP.');
        return 'php';
    }
}

// Get php.ini path if exists
function getPhpIniPath() {
    const bundledIni = isDev
        ? path.join(__dirname, '../bin/php/php.ini')
        : path.join(process.resourcesPath, 'bin', 'php', 'php.ini');
    
    if (fs.existsSync(bundledIni)) {
        logToFile(`Using custom php.ini configuration at: ${bundledIni}`);
        return bundledIni;
    }
    logToFile('No custom php.ini file found, using PHP defaults.');
    return null;
}

// Ensure the local SQLite database exists in AppData
function ensureDatabaseExists() {
    const dbPath = path.join(userDataPath, 'database.sqlite');
    let isFresh = false;
    
    if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
        logToFile(`Database not found or is empty. Creating/resetting a new SQLite database at: ${dbPath}`);
        fs.writeFileSync(dbPath, '');
        isFresh = true;
    } else {
        logToFile(`Database found at: ${dbPath}`);
    }
    
    return { dbPath, isFresh };
}

// Ensure a persistent cryptographic APP_KEY exists for production environment security
function ensureAppKeyExists() {
    const keyPath = path.join(userDataPath, '.app_key');
    let appKey = '';
    
    if (!fs.existsSync(keyPath)) {
        const crypto = require('crypto');
        const key = crypto.randomBytes(32).toString('base64');
        appKey = `base64:${key}`;
        fs.writeFileSync(keyPath, appKey, 'utf8');
        logToFile(`Generated secure, unique APP_KEY for this installation: ${appKey}`);
    } else {
        appKey = fs.readFileSync(keyPath, 'utf8').trim();
        logToFile('Successfully loaded existing persistent APP_KEY.');
    }
    
    return appKey;
}

// Run artisan command
function runArtisanCommand(phpBin, phpIni, dbPath, appKey, args) {
    return new Promise((resolve, reject) => {
        logToFile(`Running artisan command: php artisan ${args.join(' ')}`);
        
        const processEnv = {
            ...process.env,
            DB_CONNECTION: 'sqlite',
            DB_DATABASE: dbPath,
            APP_ENV: 'production',
            APP_DEBUG: 'false',
            APP_KEY: appKey,
            SESSION_DRIVER: 'file',
            CACHE_STORE: 'file'
        };

        // If custom php.ini is loaded, pass the -c flag to php
        const spawnArgs = [];
        if (phpIni) {
            spawnArgs.push('-c', phpIni);
        }
        spawnArgs.push(artisanPath, ...args);

        const proc = spawn(phpBin, spawnArgs, {
            env: processEnv,
            cwd: laravelRoot
        });

        let output = '';
        let errorOutput = '';

        proc.stdout.on('data', (data) => {
            output += data.toString();
        });

        proc.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        proc.on('close', (code) => {
            if (code === 0) {
                logToFile(`Artisan successfully finished.`);
                resolve(output);
            } else {
                logToFile(`Artisan command failed with code ${code}. Error: ${errorOutput}`);
                reject(new Error(errorOutput || `Exit code: ${code}`));
            }
        });
    });
}

// Initialize splash window
function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 450,
        height: 350,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: true,
        icon: path.join(__dirname, 'build', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
    splashWindow.center();
}

// Initialize main browser window
function createMainWindow(url) {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        title: 'Inventory Manager',
        icon: path.join(__dirname, 'build', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: true
        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL(url);

    mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
        }
        mainWindow.maximize();
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Initialize application backend and start desktop shell
async function startApp() {
    createSplashWindow();

    try {
        const phpBin = getPhpBinaryPath();
        const phpIni = getPhpIniPath();
        const { dbPath, isFresh } = ensureDatabaseExists();
        const appKey = ensureAppKeyExists();

        // Check if application version has changed to minimize redundant migration boots
        const versionFilePath = path.join(userDataPath, '.version');
        const currentVersion = app.getVersion();
        let versionChanged = false;

        if (!fs.existsSync(versionFilePath) || fs.readFileSync(versionFilePath, 'utf8') !== currentVersion) {
            versionChanged = true;
        }

        const shouldMigrate = isFresh || versionChanged || isDev;

        // 1. Run migrations/seeders to prepare database schema (only when structural changes occur!)
        if (shouldMigrate) {
            try {
                logToFile('Running database migrations...');
                await runArtisanCommand(phpBin, phpIni, dbPath, appKey, ['migrate', '--force']);
                if (isFresh) {
                    logToFile('Seeding fresh Spatie roles, permissions and Admin accounts...');
                    await runArtisanCommand(phpBin, phpIni, dbPath, appKey, ['db:seed', '--force']);
                }
                
                // Write version file ONLY after successful migrations and seeding!
                fs.writeFileSync(versionFilePath, currentVersion, 'utf8');
                logToFile('Database initialized and version file updated successfully.');
            } catch (dbInitError) {
                logToFile(`Database Initialization Error: ${dbInitError.message}`);
                dialog.showErrorBox(
                    'Database Error',
                    `Failed to initialize local offline database:\n${dbInitError.message}\n\nPlease check the logs at:\n${logPath}`
                );
                app.quit();
                return;
            }
        } else {
            logToFile('Database is up-to-date. Skipping migration startup delay for sub-second launch speed.');
        }

        // 2. Discover available local port dynamically
        portfinder.basePort = 8000;
        const port = await portfinder.getPortPromise();
        const serverUrl = `http://127.0.0.1:${port}`;
        
        logToFile(`Starting PHP server on: ${serverUrl}`);

        // 3. Start local PHP server process silently
        const serverEnv = {
            ...process.env,
            DB_CONNECTION: 'sqlite',
            DB_DATABASE: dbPath,
            APP_ENV: 'production',
            APP_DEBUG: 'false',
            APP_KEY: appKey,
            APP_URL: serverUrl,
            PORT: port.toString(),
            SESSION_DRIVER: 'file',
            CACHE_STORE: 'file'
        };

        const serverArgs = [];
        if (phpIni) {
            serverArgs.push('-c', phpIni);
        }
        serverArgs.push('-S', `127.0.0.1:${port}`, '-t', publicPath);

        phpServerProcess = spawn(phpBin, serverArgs, {
            env: serverEnv,
            cwd: laravelRoot
        });

        phpServerProcess.stdout.on('data', (data) => {
            logToFile(`[PHP Server Output]: ${data}`);
        });

        phpServerProcess.stderr.on('data', (data) => {
            logToFile(`[PHP Server Log]: ${data}`);
        });

        phpServerProcess.on('close', (code) => {
            logToFile(`PHP Server background thread exited with code ${code}`);
        });

        // 4. Poll server sequentially (one request at a time) to confirm it is active before showing main window
        let attempts = 0;
        const maxAttempts = 60; // Up to 12 seconds total timeout at 200ms increments
        
        function pollServer() {
            attempts++;
            const http = require('http');
            
            // We poll the static robots.txt to perform an ultra-lightweight check that never blocks the single-threaded PHP server
            const req = http.get(`${serverUrl}/robots.txt`, (res) => {
                logToFile(`PHP server responds successfully with status ${res.statusCode}. Loading window...`);
                createMainWindow(serverUrl);
            });
            
            req.on('error', (err) => {
                if (attempts >= maxAttempts) {
                    logToFile('Error: PHP server failed to start within the timeout limit.');
                    dialog.showErrorBox(
                        'Backend Timeout',
                        `The local application services could not be reached. The PHP server did not start in time.\n\nPlease check logs at:\n${logPath}`
                    );
                    app.quit();
                    return;
                }
                
                // Wait 200ms before the next sequential poll to allow the single-threaded PHP server to breathe
                setTimeout(pollServer, 200);
            });
            
            // Set socket timeout to prevent hanging connections from choking the server thread
            req.setTimeout(1000, () => {
                req.destroy();
            });
        }
        
        // Initiate the first sequential poll attempt
        setTimeout(pollServer, 200);

    } catch (e) {
        logToFile(`Initialization Critical Error: ${e.message}`);
        dialog.showErrorBox(
            'Application Error',
            `Critical startup crash encountered:\n${e.message}\n\nPlease check logs at:\n${logPath}`
        );
        app.quit();
    }
}

// App event listeners
app.whenReady().then(startApp);

app.on('window-all-closed', () => {
    if (phpServerProcess) {
        logToFile('Killing PHP Server process...');
        phpServerProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (phpServerProcess) {
        logToFile('Killing PHP Server process on exit...');
        phpServerProcess.kill();
    }
});

// Secure IPC triggers
ipcMain.on('close-app', () => {
    app.quit();
});
