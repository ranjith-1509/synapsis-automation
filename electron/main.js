const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process"); // Use spawn instead of exec
const fs = require("fs");
const { google } = require("googleapis");

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

// 🔹 IPC handler for fetching patient files by HCN
ipcMain.handle("fetch-patient-files", async (event, hcn) => {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");

    if (!hcn || hcn === "HCN Missing") {
      resolve({ success: false, error: "Invalid HCN provided", files: [] });
      return;
    }

    // PowerShell command to find files containing the HCN
    // Search in D:\Sample_reports directory
    const psCommand = `
      $searchPath = 'D:\\Sample_reports'
      $hcn = '${hcn}'
      
      if (-not (Test-Path $searchPath)) {
        Write-Host "ERROR: Directory not found: $searchPath"
        exit 1
      }
      
      try {
        $files = Get-ChildItem -Path $searchPath -Recurse -File -ErrorAction SilentlyContinue | 
          Where-Object { $_.Name -like "*$hcn*" -or $_.FullName -like "*$hcn*" }
        
        $result = @()
        foreach ($file in $files) {
          $result += @{
            fileName = $file.Name
            fullPath = $file.FullName
          }
        }
        
        # Output as JSON array
        $result | ConvertTo-Json -Compress
      } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
        exit 1
      }
    `;

    exec(psCommand, { shell: "powershell.exe", encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) {
        console.error("Error fetching patient files:", error);
        resolve({
          success: false,
          error: error.message || "Failed to search for files",
          files: [],
        });
        return;
      }

      try {
        // Parse PowerShell output
        const output = stdout.trim();

        // Check if directory doesn't exist
        if (output.includes("ERROR: Directory not found")) {
          resolve({
            success: false,
            error: `Directory not found: D:\\Sample_reports`,
            files: [],
          });
          return;
        }

        // Check for other errors
        if (output.includes("ERROR:")) {
          const errorMsg = output.match(/ERROR: (.+)/)?.[1] || "Unknown error";
          resolve({
            success: false,
            error: errorMsg,
            files: [],
          });
          return;
        }

        // Parse JSON array from PowerShell output
        let files = [];
        if (output && output.trim() !== "") {
          try {
            // PowerShell ConvertTo-Json outputs array directly
            const parsed = JSON.parse(output);
            files = Array.isArray(parsed) ? parsed : [parsed];
          } catch (parseError) {
            // If parsing fails, try to extract individual JSON objects
            const jsonMatches = output.match(/\{[^}]+\}/g);
            if (jsonMatches) {
              files = jsonMatches
                .map((match) => {
                  try {
                    return JSON.parse(match);
                  } catch (e) {
                    return null;
                  }
                })
                .filter((f) => f !== null);
            } else {
              console.error("Failed to parse PowerShell output:", output);
            }
          }
        }

        resolve({
          success: true,
          files: files || [],
        });
      } catch (parseError) {
        console.error("Error parsing file list:", parseError);
        resolve({
          success: false,
          error: "Failed to parse file list",
          files: [],
        });
      }
    });
  });
});

// 🔹 IPC handler for opening file paths
ipcMain.handle("open-path", async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    console.error("Error opening file:", error);
    return { success: false, error: error.message };
  }
});

// 🔹 Google Calendar OAuth2 Setup
const TOKEN_PATH = path.join(app.getPath("userData"), "token.json");
const CREDENTIALS_PATH = path.join(app.getAppPath(), "credentials.json");

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

/**
 * Load or request authorization for Google Calendar
 */
async function authorize() {
  let client = null;

  // Check if credentials.json exists
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Credentials file not found at ${CREDENTIALS_PATH}. Please create credentials.json with your OAuth2 client secrets.`
    );
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  // Use the first redirect URI from credentials, or default to http://localhost
  // For Electron apps, http://localhost is the standard redirect URI
  const redirectUri =
    redirect_uris && redirect_uris.length > 0 ? redirect_uris[0] : "http://localhost";

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  // Check if we have previously stored a token
  let token = null;
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      token = JSON.parse(fs.readFileSync(TOKEN_PATH));
      oAuth2Client.setCredentials(token);
    } catch (err) {
      console.error("Error reading token file:", err);
    }
  }

  // If no token or token is invalid, get a new one
  if (!token || !token.access_token) {
    return getNewToken(oAuth2Client);
  }

  // Check if token is expired and refresh if needed
  if (token.expiry_date && token.expiry_date < Date.now()) {
    try {
      const { credentials: newCredentials } = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(newCredentials);
      await saveToken(newCredentials);
      return oAuth2Client;
    } catch (err) {
      console.error("Error refreshing token:", err);
      return getNewToken(oAuth2Client);
    }
  }

  return oAuth2Client;
}

/**
 * Get and store new token after prompting for user authorization
 */
function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent", // Force consent to get refresh token
    });

    // Create a window to handle OAuth flow
    const authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      show: true,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    authWindow.loadURL(authUrl);

    authWindow.on("closed", () => {
      reject(new Error("Authentication window was closed"));
    });

    // Handle the OAuth callback
    const handleNavigation = (url) => {
      try {
        // Check for OAuth callback with code parameter
        if (
          url &&
          (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("code="))
        ) {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get("code");
          const error = urlObj.searchParams.get("error");

          if (error) {
            authWindow.close();
            reject(new Error(`OAuth error: ${error}`));
            return true;
          }

          if (code) {
            // Remove all listeners to prevent multiple calls
            authWindow.webContents.removeAllListeners("will-redirect");
            authWindow.webContents.removeAllListeners("did-get-redirect-request");
            authWindow.webContents.removeAllListeners("did-navigate");
            authWindow.close();

            oAuth2Client.getToken(code, (err, token) => {
              if (err) {
                console.error("Error retrieving access token", err);
                reject(err);
                return;
              }
              oAuth2Client.setCredentials(token);
              saveToken(token)
                .then(() => resolve(oAuth2Client))
                .catch(reject);
            });
            return true;
          }
        }
      } catch (err) {
        // URL parsing error, continue
        console.log("Navigation URL parsing:", err.message);
      }
      return false;
    };

    authWindow.webContents.on("will-redirect", (event, navigationUrl) => {
      if (handleNavigation(navigationUrl)) {
        event.preventDefault();
      }
    });

    authWindow.webContents.on("did-get-redirect-request", (event, oldUrl, newUrl) => {
      if (handleNavigation(newUrl)) {
        event.preventDefault();
      }
    });

    authWindow.webContents.on("did-navigate", (event, url) => {
      handleNavigation(url);
    });
  });
}

/**
 * Store token to disk
 */
function saveToken(token) {
  return new Promise((resolve, reject) => {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Token stored to", TOKEN_PATH);
        resolve();
      }
    });
  });
}

/**
 * Parse event title to extract HCN and Patient Name
 * Format: [HCN1001] Ravi Kumar or [1234567890] Patient Name
 * Supports alphanumeric HCNs like HCN1001, HCN1234, etc.
 */
function parseEventTitle(title) {
  // Match alphanumeric characters (letters and numbers) inside brackets
  // Examples: [HCN1001], [HCN1234], [1234567890], [ABC123]
  const hcnRegex = /\[([A-Z0-9]+)\]/i;
  const match = title.match(hcnRegex);

  let hcn = "HCN Missing";
  let name = title.trim();

  if (match) {
    hcn = match[1].toUpperCase(); // Normalize to uppercase for consistency
    // Extract name after the HCN bracket
    const namePart = title.substring(match.index + match[0].length).trim();
    // Remove any leading/trailing dashes, colons, or spaces
    name = namePart.replace(/^[-:\s]+/, "").trim() || "Unknown Patient";
  }

  return { hcn, name };
}

/**
 * Get today's date range in ISO format (00:00:00 to 23:59:59)
 */
function getTodayDateRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const startOfDay = `${year}-${month}-${day}T00:00:00`;
  const endOfDay = `${year}-${month}-${day}T23:59:59`;

  // Get timezone offset
  const tzOffset = -now.getTimezoneOffset();
  const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0");
  const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, "0");
  const tzSign = tzOffset >= 0 ? "+" : "-";
  const timezone = `${tzSign}${tzHours}:${tzMinutes}`;

  return {
    timeMin: `${startOfDay}${timezone}`,
    timeMax: `${endOfDay}${timezone}`,
  };
}

// 🔹 IPC handler for fetching Google Calendar appointments
ipcMain.handle("fetch-appointments", async (event) => {
  try {
    // Authorize and get OAuth2 client
    const auth = await authorize();
    const calendar = google.calendar({ version: "v3", auth });

    // Get today's date range
    const { timeMin, timeMax } = getTodayDateRange();

    // Fetch events from primary calendar
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // Parse events and extract HCN and patient names
    const appointments = events.map((event) => {
      const { hcn, name } = parseEventTitle(event.summary || "Untitled Event");
      const start = event.start?.dateTime || event.start?.date || "No time";
      const description = event.description || "";

      // Format time for display
      let time = start;
      if (start !== "No time" && start.includes("T")) {
        try {
          const date = new Date(start);
          time = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } catch (e) {
          // Keep original if parsing fails
        }
      }

      return {
        time,
        name,
        hcn,
        description,
      };
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch appointments",
      appointments: [],
    };
  }
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
