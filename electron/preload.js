const { contextBridge, ipcRenderer } = require("electron");

// Expose safe APIs to the renderer
contextBridge.exposeInMainWorld("electronAPI", {
  executePowerShell: (command) => ipcRenderer.invoke("execute-powershell", command),
});
