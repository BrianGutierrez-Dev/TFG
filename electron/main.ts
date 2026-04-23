import { app, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import http from 'http';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

const isDev = !app.isPackaged;

function waitForBackend(url: string, retries = 20): Promise<void> {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get(url, () => resolve()).on('error', () => {
        if (retries-- > 0) setTimeout(attempt, 500);
        else reject(new Error('Backend no disponible'));
      });
    };
    attempt();
  });
}

function startBackend() {
  const backendEntry = isDev
    ? path.join(__dirname, '../backend/dist/index.js')
    : path.join(process.resourcesPath, 'backend/index.js');

  const envPath = isDev
    ? path.join(__dirname, '../backend/.env')
    : path.join(process.resourcesPath, '.env');

  backendProcess = spawn(process.execPath, [backendEntry], {
    env: { ...process.env, DOTENV_CONFIG_PATH: envPath },
    stdio: 'inherit',
  });

  backendProcess.on('error', (err) => console.error('Error en backend:', err));
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    await waitForBackend('http://localhost:3000/api/employees');
    mainWindow.loadURL('http://localhost:5173');
  } else {
    await waitForBackend('http://localhost:3000/api/employees');
    mainWindow.loadFile(path.join(process.resourcesPath, 'frontend/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  backendProcess?.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
