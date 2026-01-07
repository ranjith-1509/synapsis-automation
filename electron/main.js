const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process"); // Use spawn instead of exec

let mainWindow;
let backendProcess = null;

// 🔹 Start Python backend properly
function startBackend() {
  return new Promise((resolve) => {
    const fs = require("fs");
    const backendPath = path.join(app.getAppPath(), "backend", "main.exe");

    console.log("Starting backend from:", backendPath);

    // Check if backend file exists
    if (!fs.existsSync(backendPath)) {
      console.warn("⚠️ Backend executable not found at:", backendPath);
      console.log("App will continue without backend");
      resolve();
      return;
    }

    try {
      // Use spawn to properly track the process
      backendProcess = spawn(backendPath, [], {
        cwd: path.join(app.getAppPath(), "backend"),
        detached: false, // Keep attached so we can track it
        stdio: ["ignore", "pipe", "pipe"], // Capture stdout/stderr
      });
    } catch (error) {
      console.error("Error spawning backend:", error);
      resolve(); // Always resolve so app opens
      return;
    }

    let backendOutput = "";
    let backendError = "";
    let resolved = false;

    // Capture backend output
    backendProcess.stdout.on("data", (data) => {
      const output = data.toString();
      backendOutput += output;
      console.log("Backend stdout:", output);

      // Check if backend started successfully (look for "Uvicorn running" or similar)
      if (
        !resolved &&
        (output.includes("Uvicorn running") || output.includes("Application startup complete"))
      ) {
        resolved = true;
        console.log("✅ Backend started successfully!");
        resolve();
      }
    });

    backendProcess.stderr.on("data", (data) => {
      const error = data.toString();
      backendError += error;
      console.error("Backend stderr:", error);
    });

    backendProcess.on("error", (error) => {
      console.error("Failed to start backend:", error);
      if (!resolved) {
        resolved = true;
        console.log("App will continue without backend");
        resolve();
      }
    });

    backendProcess.on("exit", (code, signal) => {
      console.log(`Backend exited with code ${code} and signal ${signal}`);
      if (code !== 0 && code !== null) {
        // Don't reject - app will continue
      }
    });

    // Timeout: if backend doesn't start in 10 seconds, reject
    setTimeout(() => {
      if (!backendProcess || backendProcess.killed) {
        // Timeout removed - app will continue
      } else {
        // Give it more time if process is still running
        console.log("Backend process is running, waiting for startup confirmation...");
      }
    }, 10000);

    // Fallback: Always resolve after 2 seconds so app opens
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (backendProcess && !backendProcess.killed) {
          console.log("Backend process appears to be running");
        } else {
          console.log("Backend process not running, app will continue");
        }
        resolve(); // Always resolve so app opens
      }
    }, 2000);
  });
}

// 🔹 Stop backend when app closes
function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    console.log("Stopping backend...");
    backendProcess.kill();
    backendProcess = null;
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: false, // required for exec
      nodeIntegration: false,
      backgroundThrottling: false,
      webSecurity: false,
    },
  });

  // Check if app is packaged (production) or dev
  const isDev = !app.isPackaged;

  // In dev, load localhost; in production, load build/index.html
  const startUrl = isDev
    ? process.env.ELECTRON_START_URL || "http://localhost:3000"
    : `file://${path.join(__dirname, "..", "build", "index.html")}`;

  mainWindow.loadURL(startUrl);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// 🔹 IPC for manual PowerShell execution (button click)
ipcMain.handle("execute-powershell", async (event, command) => {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    exec(command, { shell: "powershell.exe" }, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
});

// 🔹 App lifecycle
app.whenReady().then(async () => {
  try {
    // Try to start backend, but don't block app if it fails
    await startBackend();
    console.log("Backend started successfully");
  } catch (err) {
    console.error("Failed to start backend:", err);
    console.log("Continuing without backend...");
  }

  // Always create window, even if backend fails
  createMainWindow();
});

app.on("before-quit", () => {
  stopBackend();
});

app.on("window-all-closed", () => {
  stopBackend();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createMainWindow();
});
