import React, { useState } from "react";
import { Button, message, Modal } from "antd";
import MainLayout from "../components/Layout/MainLayout";

const FileCopyTest = () => {
  const [loading, setLoading] = useState(false);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState({});
  const [outputModal, setOutputModal] = useState({
    visible: false,
    title: "",
    content: "",
  });

  const handleFileCopy = async () => {
    console.log("Button clicked!");
    console.log("electronAPI available:", !!window.electronAPI);

    if (!window.electronAPI) {
      message.error("Electron API not available. Please run in Electron app.");
      console.error("Running in browser, not Electron!");
      return;
    }

    setLoading(true);
    try {
      // PowerShell command to copy file, wait 10 seconds, then copy back
      const sourceFile = "D:\\Dummy2\\Screenshot (1).png";
      const destDir = "D:\\Dummy1";
      const sourceFile2 = "D:\\Dummy1\\Screenshot (1).png";
      const destDir2 = "D:\\Dummy2";

      // Escape paths with spaces for PowerShell
      const psCommand = `
        Copy-Item -Path "${sourceFile}" -Destination "${destDir}" -Force;
        Start-Sleep -Seconds 10;
        Copy-Item -Path "${sourceFile2}" -Destination "${destDir2}" -Force
      `;

      console.log("Executing PowerShell command:", psCommand);
      message.info("Executing PowerShell command... (this will take ~10 seconds)");

      const result = await window.electronAPI.executePowerShell(psCommand);

      console.log("PowerShell result:", result);

      if (result.stdout || !result.error) {
        message.success("File copy operation completed successfully!");
        console.log("Success! stdout:", result.stdout);
      } else {
        message.error(`Error: ${result.error || result.stderr}`);
        console.error("Error:", result);
      }
    } catch (error) {
      message.error(`Failed to execute: ${error.message || error.error || JSON.stringify(error)}`);
      console.error("Exception:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAppScheduler = async () => {
    if (!window.electronAPI) {
      message.error("Electron API not available. Please run in Electron app.");
      return;
    }

    setSchedulerLoading(true);

    try {
      const psCommand = `
        Write-Host "Starting Notepad automation..."

        # Close any existing Notepad
        Get-Process notepad -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Milliseconds 500

        for ($i = 1; $i -le 3; $i++) {
          Write-Host "Opening Notepad $i"

          # Create temp file
          $filePath = Join-Path $env:TEMP ("notepad_$i.txt")
          Set-Content -Path $filePath -Value ("notepad $i ") -Encoding UTF8

          # Open Notepad with file
          $process = Start-Process notepad -ArgumentList $filePath -PassThru

          # Keep open for 5 seconds
          Start-Sleep -Seconds 5

          # Close this specific Notepad (and double-close by name to be sure)
          if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
          }
          # Ensure all Notepad instances are closed before next loop
          Get-Process notepad -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

          # Cleanup file
          Remove-Item $filePath -Force -ErrorAction SilentlyContinue

          # Small pause before next iteration
          Start-Sleep -Milliseconds 700
        }

        Write-Host "Automation completed"
      `;

      message.info("Running Notepad automation...");

      const result = await window.electronAPI.executePowerShell(psCommand);

      if (!result?.error) {
        message.success("Automation completed successfully!");
        console.log(result.stdout);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      message.error(`Execution failed: ${error.message}`);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const handleStopScheduler = async () => {
    if (!window.electronAPI) {
      message.error("Electron API not available. Please run in Electron app.");
      return;
    }

    setStopLoading(true);
    try {
      // PowerShell command to stop all Notepad processes
      const psCommand = `
        $notepads = Get-Process notepad -ErrorAction SilentlyContinue;
        if ($notepads) {
          $count = ($notepads | Measure-Object).Count;
          Write-Host "Found $count Notepad instance(s)";
          $notepads | ForEach-Object {
            Write-Host "Closing Notepad (PID: $($_.Id))";
            Stop-Process -Id $_.Id -Force;
          }
          Write-Host "All Notepad instances closed";
        } else {
          Write-Host "No Notepad instances found";
        }
      `;

      console.log("Stopping all Notepads:", psCommand);
      message.info("Stopping all Notepad instances...");

      const result = await window.electronAPI.executePowerShell(psCommand);

      console.log("Stop result:", result);

      if (result.stdout || !result.error) {
        message.success("All Notepad instances stopped!");
        console.log("Success! stdout:", result.stdout);
      } else {
        message.warning("No Notepad instances were running");
      }
    } catch (error) {
      message.error(`Failed to stop: ${error.message || error.error || JSON.stringify(error)}`);
      console.error("Exception:", error);
    } finally {
      setStopLoading(false);
    }
  };

  const handleDemoScript = async (demoName, script) => {
    if (!window.electronAPI) {
      message.error("Electron API not available. Please run in Electron app.");
      return;
    }

    setDemoLoading((prev) => ({ ...prev, [demoName]: true }));
    try {
      message.info(`Running ${demoName}...`);
      const result = await window.electronAPI.executePowerShell(script);

      if (!result?.error) {
        // Show output in modal popup
        setOutputModal({
          visible: true,
          title: `${demoName} - Output`,
          content: result.stdout || "Command executed successfully (no output)",
        });
        console.log(`${demoName} output:`, result.stdout);
      } else {
        // Show error in modal
        setOutputModal({
          visible: true,
          title: `${demoName} - Error`,
          content: result.error || result.stderr || "Unknown error occurred",
        });
        console.error(`${demoName} error:`, result);
      }
    } catch (error) {
      setOutputModal({
        visible: true,
        title: `${demoName} - Execution Failed`,
        content: error.message || JSON.stringify(error),
      });
      console.error(error);
    } finally {
      setDemoLoading((prev) => ({ ...prev, [demoName]: false }));
    }
  };

  const handleDeleteFiles = async () => {
    if (!window.electronAPI) {
      message.error("Electron API not available. Please run in Electron app.");
      return;
    }

    setDeleteLoading(true);
    try {
      // PowerShell command to delete all files in D:\Dummy1
      const psCommand = `
        $folderPath = "D:\\Dummy1";
        
        # Check if folder exists
        if (Test-Path $folderPath) {
          # Get all files in the folder
          $files = Get-ChildItem -Path $folderPath -File -ErrorAction SilentlyContinue;
          
          if ($files) {
            $count = ($files | Measure-Object).Count;
            Write-Host "Found $count file(s) in $folderPath";
            
            # Delete all files
            $files | ForEach-Object {
              Write-Host "Deleting: $($_.Name)";
              Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue;
            }
            
            Write-Host "Successfully deleted $count file(s)";
          } else {
            Write-Host "No files found in $folderPath";
          }
        } else {
          Write-Host "Folder does not exist: $folderPath";
        }
      `;

      console.log("Deleting all files:", psCommand);
      message.info("Deleting all files from D:\\Dummy1...");

      const result = await window.electronAPI.executePowerShell(psCommand);

      console.log("Delete result:", result);

      if (result.stdout || !result.error) {
        message.success("All files deleted from D:\\Dummy1!");
        console.log("Success! stdout:", result.stdout);
      } else {
        message.error(`Error: ${result.error || result.stderr}`);
        console.error("Error:", result);
      }
    } catch (error) {
      message.error(`Failed to delete: ${error.message || error.error || JSON.stringify(error)}`);
      console.error("Exception:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl w-full h-full mx-auto sm:px-6 lg:px-8">
        <div
          style={{ borderRadius: "24px" }}
          className="bg-white border border-gray-200 overflow-hidden shadow-sm p-6"
        >
          <h1 className="text-lg font-semibold text-gray-900 mb-4">PowerShell Automation Test</h1>
          <p className="text-sm text-gray-500 mb-6">
            Test PowerShell commands for file operations and interval-based app scheduling.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Button type="primary" onClick={handleFileCopy} loading={loading} size="large">
              Execute File Copy Operation
            </Button>

            <Button
              type="default"
              onClick={handleAppScheduler}
              loading={schedulerLoading}
              size="large"
              style={{ background: "#52c41a", color: "white", borderColor: "#52c41a" }}
            >
              Run Notepad Automation (5 Tasks)
            </Button>

            <Button
              danger
              onClick={handleStopScheduler}
              loading={stopLoading}
              size="large"
              type="primary"
            >
              Stop All Notepads
            </Button>

            <Button
              danger
              onClick={handleDeleteFiles}
              loading={deleteLoading}
              size="large"
              style={{ background: "#ff4d4f", borderColor: "#ff4d4f", color: "white" }}
            >
              Delete All Files in D:\Dummy1
            </Button>
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <h3 className="font-semibold mb-2 text-orange-800">⚠️ Delete Files Command:</h3>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
              {`$folderPath = "D:\\Dummy1";

if (Test-Path $folderPath) {
  $files = Get-ChildItem -Path $folderPath -File;
  
  if ($files) {
    $count = ($files | Measure-Object).Count;
    Write-Host "Deleting $count file(s)...";
    
    $files | ForEach-Object {
      Remove-Item -Path $_.FullName -Force;
    }
    
    Write-Host "Successfully deleted $count file(s)";
  }
}`}
            </pre>
            <div className="mt-3 text-sm text-orange-700">
              <p>
                <strong>Warning:</strong> This permanently deletes all files in D:\Dummy1
              </p>
              <ul className="list-disc ml-5 mt-1">
                <li>Removes all files (not folders)</li>
                <li>Cannot be undone</li>
                <li>Shows count of deleted files</li>
              </ul>
            </div>
          </div>

          {/* PowerShell Demo Scripts Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">PowerShell Demo Scripts</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Demo 1: System Info */}
              <div className="p-4 bg-blue-50 rounded-lg border">
                <h3 className="font-semibold mb-2">1. System Information</h3>
                <p className="text-xs text-gray-600 mb-3">Get OS, CPU, RAM, and disk info</p>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleDemoScript(
                      "SystemInfo",
                      `
                    Write-Host "=== SYSTEM INFORMATION ===" -ForegroundColor Cyan
                    Write-Host "OS: $($env:OS)"
                    Write-Host "Computer Name: $($env:COMPUTERNAME)"
                    Write-Host "User: $($env:USERNAME)"
                    Write-Host "CPU Cores: $((Get-WmiObject Win32_Processor).NumberOfCores)"
                    Write-Host "Total RAM: $([math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)) GB"
                    Write-Host "Available RAM: $([math]::Round((Get-WmiObject Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)) GB"
                    $disk = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'"
                    Write-Host "C: Drive Free: $([math]::Round($disk.FreeSpace / 1GB, 2)) GB / $([math]::Round($disk.Size / 1GB, 2)) GB"
                    Write-Host "=== END ===" -ForegroundColor Cyan
                  `
                    )
                  }
                  loading={demoLoading["SystemInfo"]}
                >
                  Run System Info
                </Button>
              </div>

              {/* Demo 2: Process Monitor */}
              <div className="p-4 bg-green-50 rounded-lg border">
                <h3 className="font-semibold mb-2">2. Top Processes</h3>
                <p className="text-xs text-gray-600 mb-3">Show top 5 processes by CPU usage</p>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleDemoScript(
                      "TopProcesses",
                      `
                    Write-Host "=== TOP 5 PROCESSES BY CPU ===" -ForegroundColor Green
                    Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | 
                    Format-Table Name, @{Label="CPU %";Expression={$_.CPU}}, 
                    @{Label="Memory (MB)";Expression={[math]::Round($_.WorkingSet64/1MB,2)}} -AutoSize
                    Write-Host "=== END ===" -ForegroundColor Green
                  `
                    )
                  }
                  loading={demoLoading["TopProcesses"]}
                >
                  Run Process Monitor
                </Button>
              </div>

              {/* Demo 3: Network Info */}
              <div className="p-4 bg-purple-50 rounded-lg border">
                <h3 className="font-semibold mb-2">3. Network Information</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Display network adapters and IP addresses
                </p>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleDemoScript(
                      "NetworkInfo",
                      `
                    Write-Host "=== NETWORK INFORMATION ===" -ForegroundColor Magenta
                    Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | ForEach-Object {
                      Write-Host "Adapter: $($_.Name)"
                      $ip = Get-NetIPAddress -InterfaceIndex $_.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
                      if ($ip) {
                        Write-Host "  IP: $($ip.IPAddress)"
                        Write-Host "  Subnet: $($ip.PrefixLength)"
                      }
                    }
                    Write-Host "Public IP Info:" 
                    try {
                      $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
                      Write-Host "  Public IP: $publicIP"
                    } catch {
                      Write-Host "  Could not fetch public IP"
                    }
                    Write-Host "=== END ===" -ForegroundColor Magenta
                  `
                    )
                  }
                  loading={demoLoading["NetworkInfo"]}
                >
                  Run Network Info
                </Button>
              </div>

              {/* Demo 4: File Operations */}
              <div className="p-4 bg-yellow-50 rounded-lg border">
                <h3 className="font-semibold mb-2">4. File Operations Demo</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Create, write, read, and delete a test file
                </p>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleDemoScript(
                      "FileOps",
                      `
                    Write-Host "=== FILE OPERATIONS DEMO ===" -ForegroundColor Yellow
                    $testFile = Join-Path $env:TEMP "powershell_demo.txt"
                    
                    # Create and write
                    Write-Host "Creating file: $testFile"
                    "Hello from PowerShell!" | Out-File -FilePath $testFile -Encoding UTF8
                    Write-Host "File created successfully"
                    
                    # Read
                    Write-Host "Reading file content:"
                    Get-Content $testFile
                    
                    # Append
                    Write-Host "Appending more content..."
                    "This is line 2" | Add-Content $testFile
                    "This is line 3" | Add-Content $testFile
                    
                    # Read again
                    Write-Host "Updated content:"
                    Get-Content $testFile
                    
                    # Delete
                    Write-Host "Deleting file..."
                    Remove-Item $testFile -Force
                    Write-Host "File deleted successfully"
                    Write-Host "=== END ===" -ForegroundColor Yellow
                  `
                    )
                  }
                  loading={demoLoading["FileOps"]}
                >
                  Run File Ops Demo
                </Button>
              </div>

              {/* Demo 5: Service Status */}
              <div className="p-4 bg-indigo-50 rounded-lg border">
                <h3 className="font-semibold mb-2">5. Service Status</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Check status of common Windows services
                </p>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleDemoScript(
                      "ServiceStatus",
                      `
                    Write-Host "=== WINDOWS SERVICES STATUS ===" -ForegroundColor Blue
                    $services = @("Spooler", "Themes", "AudioSrv", "WSearch", "WinRM")
                    foreach ($svc in $services) {
                      $service = Get-Service -Name $svc -ErrorAction SilentlyContinue
                      if ($service) {
                        $status = $service.Status
                        $color = if ($status -eq "Running") { "Green" } else { "Red" }
                        Write-Host "$svc : $status" -ForegroundColor $color
                      } else {
                        Write-Host "$svc : Not Found" -ForegroundColor Gray
                      }
                    }
                    Write-Host "=== END ===" -ForegroundColor Blue
                  `
                    )
                  }
                  loading={demoLoading["ServiceStatus"]}
                >
                  Check Services
                </Button>
              </div>

              {/* Demo 6: Environment Variables */}
              <div className="p-4 bg-pink-50 rounded-lg border">
                <h3 className="font-semibold mb-2">6. Environment Variables</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Display important environment variables
                </p>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleDemoScript(
                      "EnvVars",
                      `
                    Write-Host "=== ENVIRONMENT VARIABLES ===" -ForegroundColor Magenta
                    Write-Host "TEMP: $env:TEMP"
                    Write-Host "TMP: $env:TMP"
                    Write-Host "USERPROFILE: $env:USERPROFILE"
                    Write-Host "PROGRAMFILES: $env:PROGRAMFILES"
                    Write-Host "PATH (first 3 entries):"
                    ($env:PATH -split ';')[0..2] | ForEach-Object { Write-Host "  $_" }
                    Write-Host "=== END ===" -ForegroundColor Magenta
                  `
                    )
                  }
                  loading={demoLoading["EnvVars"]}
                >
                  Show Env Vars
                </Button>
              </div>

              {/* Demo 7: System Uptime */}
              <div className="p-4 bg-teal-50 rounded-lg border">
                <h3 className="font-semibold mb-2">7. System Uptime</h3>
                <p className="text-xs text-gray-600 mb-3">Calculate and display system uptime</p>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleDemoScript(
                      "Uptime",
                      `
                    Write-Host "=== SYSTEM UPTIME ===" -ForegroundColor Cyan
                    $os = Get-WmiObject Win32_OperatingSystem
                    $uptime = (Get-Date) - $os.ConvertToDateTime($os.LastBootUpTime)
                    Write-Host "Last Boot: $($os.ConvertToDateTime($os.LastBootUpTime))"
                    Write-Host "Uptime: $($uptime.Days) days, $($uptime.Hours) hours, $($uptime.Minutes) minutes"
                    Write-Host "Total Hours: $([math]::Round($uptime.TotalHours, 2))"
                    Write-Host "=== END ===" -ForegroundColor Cyan
                  `
                    )
                  }
                  loading={demoLoading["Uptime"]}
                >
                  Check Uptime
                </Button>
              </div>

              {/* Demo 8: Disk Space Analysis */}
              <div className="p-4 bg-red-50 rounded-lg border">
                <h3 className="font-semibold mb-2">8. Disk Space Analysis</h3>
                <p className="text-xs text-gray-600 mb-3">Show disk usage for all drives</p>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleDemoScript(
                      "DiskSpace",
                      `
                    Write-Host "=== DISK SPACE ANALYSIS ===" -ForegroundColor Red
                    Get-WmiObject Win32_LogicalDisk | ForEach-Object {
                      $freeGB = [math]::Round($_.FreeSpace / 1GB, 2)
                      $totalGB = [math]::Round($_.Size / 1GB, 2)
                      $usedGB = $totalGB - $freeGB
                      $percentFree = [math]::Round(($_.FreeSpace / $_.Size) * 100, 2)
                      
                      Write-Host "Drive: $($_.DeviceID)"
                      Write-Host "  Total: $totalGB GB"
                      Write-Host "  Used: $usedGB GB"
                      Write-Host "  Free: $freeGB GB ($percentFree%)"
                      
                      if ($percentFree -lt 10) {
                        Write-Host "  WARNING: Low disk space!" -ForegroundColor Red
                      }
                      Write-Host ""
                    }
                    Write-Host "=== END ===" -ForegroundColor Red
                  `
                    )
                  }
                  loading={demoLoading["DiskSpace"]}
                >
                  Analyze Disks
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Modal */}
      <Modal
        title={outputModal.title}
        open={outputModal.visible}
        onCancel={() => setOutputModal({ ...outputModal, visible: false })}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setOutputModal({ ...outputModal, visible: false })}
          >
            Close
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <div
          style={{
            maxHeight: "70vh",
            overflow: "auto",
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            padding: "16px",
            borderRadius: "4px",
            fontFamily: "Consolas, 'Courier New', monospace",
            fontSize: "13px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {outputModal.content || "No output available"}
        </div>
      </Modal>
    </MainLayout>
  );
};

export default FileCopyTest;
