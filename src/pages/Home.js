import React, { useMemo, useState } from "react";
import { Button, message, Modal, Card, Tag, Divider, Space } from "antd";
import {
  ThunderboltFilled,
  CodeOutlined,
  ClockCircleOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import MainLayout from "../components/Layout/MainLayout";

const Home = () => {
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

  const actionBadges = useMemo(
    () => [
      { label: "File Ops", color: "blue" },
      { label: "Scheduling", color: "purple" },
      { label: "Diagnostics", color: "green" },
      { label: "Safe Exit", color: "red" },
    ],
    []
  );

  const quickScripts = useMemo(
    () => [
      {
        key: "SystemInfo",
        title: "System Information",
        color: "cyan",
        desc: "OS, CPU, RAM, disk at a glance",
      },
      {
        key: "TopProcesses",
        title: "Top Processes",
        color: "green",
        desc: "CPU leaders with memory footprint",
      },
      {
        key: "NetworkInfo",
        title: "Network Info",
        color: "magenta",
        desc: "Adapters, IPs, and public IP probe",
      },
      {
        key: "FileOps",
        title: "File Operations",
        color: "gold",
        desc: "Create, read, append, and delete file",
      },
      {
        key: "ServiceStatus",
        title: "Service Status",
        color: "blue",
        desc: "Spooler, Themes, Audio, Search, WinRM",
      },
      { key: "EnvVars", title: "Env Vars", color: "purple", desc: "Key paths and PATH preview" },
      { key: "Uptime", title: "System Uptime", color: "geekblue", desc: "Boot time and duration" },
      {
        key: "DiskSpace",
        title: "Disk Space",
        color: "red",
        desc: "All drives with low-space warning",
      },
    ],
    []
  );

  const showNotElectron = () => {
    message.error("Electron API not available. Please run in Electron app.");
    console.error("Running in browser, not Electron!");
  };

  const runPowerShell = async (psCommand, onSuccessMessage) => {
    if (!window.electronAPI) {
      showNotElectron();
      return { error: "no-electron" };
    }
    const result = await window.electronAPI.executePowerShell(psCommand);
    if (!result?.error) {
      if (onSuccessMessage) message.success(onSuccessMessage);
    } else {
      message.error(result.error || result.stderr || "Unknown error");
    }
    return result;
  };

  const handleFileCopy = async () => {
    setLoading(true);
    try {
      const sourceFile = "D:\\Dummy2\\Screenshot (1).png";
      const destDir = "D:\\Dummy1";
      const sourceFile2 = "D:\\Dummy1\\Screenshot (1).png";
      const destDir2 = "D:\\Dummy2";

      const psCommand = `
        Copy-Item -Path "${sourceFile}" -Destination "${destDir}" -Force;
        Start-Sleep -Seconds 10;
        Copy-Item -Path "${sourceFile2}" -Destination "${destDir2}" -Force
      `;

      message.info("Copying file, waiting 10s, then copying back...");
      const result = await runPowerShell(psCommand, "File copy operation completed");
      if (result?.stdout) console.log(result.stdout);
    } catch (error) {
      message.error(`Failed to execute: ${error.message || error.error || JSON.stringify(error)}`);
      console.error("Exception:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppScheduler = async () => {
    setSchedulerLoading(true);
    try {
      const psCommand = `
        Write-Host "Starting Notepad automation..."

        Get-Process notepad -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Milliseconds 500

        for ($i = 1; $i -le 3; $i++) {
          Write-Host "Opening Notepad $i"
          $filePath = Join-Path $env:TEMP ("notepad_$i.txt")
          Set-Content -Path $filePath -Value ("notepad $i ") -Encoding UTF8
          $process = Start-Process notepad -ArgumentList $filePath -PassThru
          Start-Sleep -Seconds 5
          if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
          }
          Get-Process notepad -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
          Remove-Item $filePath -Force -ErrorAction SilentlyContinue
          Start-Sleep -Milliseconds 700
        }

        Write-Host "Automation completed"
      `;

      message.info("Running Notepad automation...");
      const result = await runPowerShell(psCommand, "Automation completed successfully");
      if (result?.stdout) console.log(result.stdout);
    } catch (error) {
      message.error(`Execution failed: ${error.message}`);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const handleStopScheduler = async () => {
    setStopLoading(true);
    try {
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

      message.info("Stopping all Notepad instances...");
      const result = await runPowerShell(psCommand, "All Notepad instances stopped");
      if (result?.stdout) console.log(result.stdout);
    } catch (error) {
      message.error(`Failed to stop: ${error.message || error.error || JSON.stringify(error)}`);
      console.error("Exception:", error);
    } finally {
      setStopLoading(false);
    }
  };

  const handleDemoScript = async (demoName, script) => {
    setDemoLoading((prev) => ({ ...prev, [demoName]: true }));
    try {
      message.info(`Running ${demoName}...`);
      const result = await runPowerShell(script);

      if (!result?.error) {
        setOutputModal({
          visible: true,
          title: `${demoName} - Output`,
          content: result.stdout || "Command executed successfully (no output)",
        });
      } else {
        setOutputModal({
          visible: true,
          title: `${demoName} - Error`,
          content: result.error || result.stderr || "Unknown error occurred",
        });
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
    setDeleteLoading(true);
    try {
      const psCommand = `
        $folderPath = "D:\\Dummy1";
        
        if (Test-Path $folderPath) {
          $files = Get-ChildItem -Path $folderPath -File -ErrorAction SilentlyContinue;
          
          if ($files) {
            $count = ($files | Measure-Object).Count;
            Write-Host "Found $count file(s) in $folderPath";
            
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

      message.info("Deleting all files from D:\\Dummy1...");
      const result = await runPowerShell(psCommand, "All files deleted from D:\\Dummy1");
      if (result?.stdout) console.log(result.stdout);
    } catch (error) {
      message.error(`Failed to delete: ${error.message || error.error || JSON.stringify(error)}`);
      console.error("Exception:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl w-full h-full mx-auto px-4 lg:px-0">
        <Card className="glass-card" bodyStyle={{ padding: 20 }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <div className="section-title">Automation Controls</div>
              <div className="muted text-sm">
                Kick off the main automation loop, manage Notepad runs, or wipe the staging folder.
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button type="primary" size="large" onClick={handleFileCopy} loading={loading}>
                Run File Copy Loop
              </Button>
              <Button
                type="default"
                size="large"
                onClick={handleAppScheduler}
                loading={schedulerLoading}
                style={{ background: "#52c41a", color: "white", borderColor: "#52c41a" }}
              >
                Run Notepad Automation
              </Button>
              <Button
                danger
                type="primary"
                size="large"
                onClick={handleStopScheduler}
                loading={stopLoading}
              >
                Stop All Notepads
              </Button>
              <Button
                danger
                size="large"
                onClick={handleDeleteFiles}
                loading={deleteLoading}
                style={{ background: "#ff4d4f", borderColor: "#ff4d4f", color: "white" }}
              >
                Delete Files in D:\Dummy1
              </Button>
            </div>
          </div>
        </Card>

        <Card className="glass-card mt-6" bodyStyle={{ padding: 20 }}>
          <div className="flex items-center gap-2 mb-2">
            <CodeOutlined style={{ color: "#1677ff" }} />
            <div className="section-title">PowerShell Demo Scripts</div>
          </div>
          <div className="muted text-sm mb-4">
            Quick diagnostics you can run directly. Outputs display in the modal viewer.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickScripts.map((s, idx) => (
              <Card
                key={s.key}
                className="glass-card"
                size="small"
                bodyStyle={{
                  padding: 14,
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{`${idx + 1}. ${s.title}`}</span>
                  <Tag color={s.color} style={{ borderRadius: 999 }}>
                    {s.key}
                  </Tag>
                </div>
                <div className="muted text-xs flex-1">{s.desc}</div>
                <Button
                  type="primary"
                  size="small"
                  loading={demoLoading[s.key]}
                  onClick={() =>
                    handleDemoScript(
                      s.key,
                      {
                        SystemInfo: `
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
                  `,
                        TopProcesses: `
                    Write-Host "=== TOP 5 PROCESSES BY CPU ===" -ForegroundColor Green
                    Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | 
                    Format-Table Name, @{Label="CPU %";Expression={$_.CPU}}, 
                    @{Label="Memory (MB)";Expression={[math]::Round($_.WorkingSet64/1MB,2)}} -AutoSize
                    Write-Host "=== END ===" -ForegroundColor Green
                  `,
                        NetworkInfo: `
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
                  `,
                        FileOps: `
                    Write-Host "=== FILE OPERATIONS DEMO ===" -ForegroundColor Yellow
                    $testFile = Join-Path $env:TEMP "powershell_demo.txt"
                    Write-Host "Creating file: $testFile"
                    "Hello from PowerShell!" | Out-File -FilePath $testFile -Encoding UTF8
                    Write-Host "File created successfully"
                    Write-Host "Reading file content:"
                    Get-Content $testFile
                    Write-Host "Appending more content..."
                    "This is line 2" | Add-Content $testFile
                    "This is line 3" | Add-Content $testFile
                    Write-Host "Updated content:"
                    Get-Content $testFile
                    Write-Host "Deleting file..."
                    Remove-Item $testFile -Force
                    Write-Host "File deleted successfully"
                    Write-Host "=== END ===" -ForegroundColor Yellow
                  `,
                        ServiceStatus: `
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
                  `,
                        EnvVars: `
                    Write-Host "=== ENVIRONMENT VARIABLES ===" -ForegroundColor Magenta
                    Write-Host "TEMP: $env:TEMP"
                    Write-Host "TMP: $env:TMP"
                    Write-Host "USERPROFILE: $env:USERPROFILE"
                    Write-Host "PROGRAMFILES: $env:PROGRAMFILES"
                    Write-Host "PATH (first 3 entries):"
                    ($env:PATH -split ';')[0..2] | ForEach-Object { Write-Host "  $_" }
                    Write-Host "=== END ===" -ForegroundColor Magenta
                  `,
                        Uptime: `
                    Write-Host "=== SYSTEM UPTIME ===" -ForegroundColor Cyan
                    $os = Get-WmiObject Win32_OperatingSystem
                    $uptime = (Get-Date) - $os.ConvertToDateTime($os.LastBootUpTime)
                    Write-Host "Last Boot: $($os.ConvertToDateTime($os.LastBootUpTime))"
                    Write-Host "Uptime: $($uptime.Days) days, $($uptime.Hours) hours, $($uptime.Minutes) minutes"
                    Write-Host "Total Hours: $([math]::Round($uptime.TotalHours, 2))"
                    Write-Host "=== END ===" -ForegroundColor Cyan
                  `,
                        DiskSpace: `
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
                      if ($percentFree -lt 10) { Write-Host "  WARNING: Low disk space!" -ForegroundColor Red }
                      Write-Host ""
                    }
                    Write-Host "=== END ===" -ForegroundColor Red
                  `,
                      }[s.key]
                    )
                  }
                >
                  Run Script
                </Button>
              </Card>
            ))}
          </div>
        </Card>
      </div>

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
        width={900}
        style={{ top: 30 }}
      >
        <div
          style={{
            maxHeight: "70vh",
            overflow: "auto",
            backgroundColor: "#0f172a",
            color: "#e2e8f0",
            padding: "16px",
            borderRadius: "8px",
            fontFamily: "Consolas, 'Courier New', monospace",
            fontSize: "13px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {outputModal.content || "No output available"}
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Home;
