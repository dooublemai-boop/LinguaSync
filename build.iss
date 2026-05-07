#define MyAppName "LinguaSync Pro IDE"
#define MyAppVersion "2.2.1"
#define MyAppPublisher "LinguaSync Team"
#define MyAppURL "https://github.com/yourname/linguasync"
#define MyAppExeName "LinguaSyncPro.exe" 
#define MyBuildFolder "dist\LinguaSyncPro"

[Setup]
AppId={{8A8F1A2B-3C4D-5E6F-7A8B-9C0D1E2F3A4B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\LinguaSync Pro
DefaultGroupName=LinguaSync Pro
AllowNoIcons=yes
SetupIconFile=app.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
OutputDir=.\Output
OutputBaseFilename=LinguaSyncPro_Setup_v{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{#MyBuildFolder}\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#MyBuildFolder}\*"; DestDir: "{app}"; Excludes: "{#MyAppExeName}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; 【关键修复】：加入了 WorkingDir 确保工作目录正确，加入了 runasoriginaluser 降权到普通用户运行，防止 WebView2 罢工。
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; WorkingDir: "{app}"; Flags: nowait postinstall skipifsilent runasoriginaluser

[Code]
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  DataDir1, ModelDir1: String;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    DataDir1 := ExpandConstant('{localappdata}\LinguaSyncPro\data');
    ModelDir1 := ExpandConstant('{localappdata}\LinguaSyncPro\models');

    if DirExists(DataDir1) or DirExists(ModelDir1) then
    begin
      if MsgBox('Do you want to permanently delete the downloaded AI models and local history data?', mbConfirmation, MB_YESNO or MB_DEFBUTTON2) = IDYES then
      begin
        DelTree(DataDir1, True, True, True);
        DelTree(ModelDir1, True, True, True);
      end;
    end;
  end;
end;
