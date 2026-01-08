const { contextBridge, ipcRenderer } = require("electron");

// Expose safe APIs to the renderer
contextBridge.exposeInMainWorld("electronAPI", {
  executePowerShell: (command) => ipcRenderer.invoke("execute-powershell", command),
  fetchAppointments: () => ipcRenderer.invoke("fetch-appointments"),
  fetchPatientFiles: (hcn) => ipcRenderer.invoke("fetch-patient-files", hcn),
  openPath: (filePath) => ipcRenderer.invoke("open-path", filePath),
});
