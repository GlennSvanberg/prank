Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Audio {
    [DllImport("winmm.dll")]
    public static extern long mciSendString(string command, string returnValue, int returnLength, IntPtr winHandle);
}
"@
[Audio]::mciSendString("play `"c:\git\glenn\prank\fart_sounds\apebble-fart-3-228243.mp3`"", $null, 0, [IntPtr]::Zero)
Start-Sleep -Seconds 3
