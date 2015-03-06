#include <stdbool.h>
#define WINVER 0x0501
#include <windows.h>

#ifdef DEBUG
	#include <stdio.h>
#endif



typedef struct {
	DWORD Color;
	DWORD Afterglow;
	DWORD ColorBalance;
	DWORD AfterglowBalance;
	DWORD BlurBalance;
	DWORD GlassReflectionIntensity;
	BOOL OpaqueBlend;
} DwmParams;

typedef void (*GetDwmParamsHandler) (DwmParams*);
typedef void (*SetDwmParamsHandler) (DwmParams*, bool);

GetDwmParamsHandler GetDwmParams;
SetDwmParamsHandler SetDwmParams;

FARPROC GetProcAddressByOrdinal (HINSTANCE dll, int o)
{
	return GetProcAddress(dll, MAKEINTRESOURCE(o));
}

void InitializeDwmStuff ()
{
	HINSTANCE dwmapi = LoadLibrary("dwmapi.dll");
	
	GetDwmParams = (GetDwmParamsHandler) GetProcAddressByOrdinal(dwmapi, 127);
	SetDwmParams = (SetDwmParamsHandler) GetProcAddressByOrdinal(dwmapi, 131);
}




bool IsMaximized (HWND w)
{
	WINDOWPLACEMENT wp; GetWindowPlacement(w, &wp);
	return wp.showCmd == SW_MAXIMIZE;
}




void Unglass (bool unglass)
{
	static bool unglassed = false;
	if (unglassed == (unglass = !!unglass)) return;
	unglassed = unglass;
	
	static DwmParams old, cur;
	GetDwmParams(&cur);
	
	if (unglassed)
	{
		old.Color = cur.Color;
		old.ColorBalance = cur.ColorBalance;
		old.OpaqueBlend = cur.OpaqueBlend;
		
		cur.ColorBalance = 85;
		cur.Color = RGB(GetRValue(cur.Color) / 4, GetGValue(cur.Color) / 4, GetBValue(cur.Color) / 4);
		cur.OpaqueBlend = true;
	}
	else
	{
		cur.Color = old.Color;
		cur.ColorBalance = old.ColorBalance;
		cur.OpaqueBlend = old.OpaqueBlend;
	}
	
	cur.GlassReflectionIntensity = 0;
	SetDwmParams(&cur, true);
}




HWND* Maximized;

void RememberMaximized (HWND w)
{
	HWND* m = Maximized;
	while (*m) { if (*m == w) return; else m++; }
	*m = w; *(++m) = 0;
}

void ForgetMaximized (HWND w)
{
	HWND* m = Maximized;
	while (*m != w) { if (!*m) return; else m++; }
	while (*m) { *m = *(m + 1); m++; }
}

void Prescan ()
{
	HWND w = GetTopWindow(0);
	
	while ((w = GetNextWindow(w, GW_HWNDNEXT)))
	{
		if (GetParent(w)) continue;
		if (IsMaximized(w)) RememberMaximized(w);
	}
	
	Unglass(*Maximized);
}




void CALLBACK HookProc (
	HWINEVENTHOOK hWinEventHook, DWORD event, HWND hwnd,
	LONG idObject, LONG idChild, DWORD dwEventThread, DWORD dwmsEventTime
) {
	if (idObject != OBJID_WINDOW) return;
	if (GetParent(hwnd)) return;
	
	static HWND prevHwnd = 0;
	static bool prevMaxd = 0;
	
	switch (event)
	{
		case EVENT_OBJECT_CREATE: {
			
			bool maxd = IsMaximized(hwnd);
			
			if (maxd) RememberMaximized(hwnd);
			
			prevHwnd = hwnd;
			prevMaxd = maxd;
			
		} break;
		
		case EVENT_OBJECT_LOCATIONCHANGE: {
			
			bool maxd = IsMaximized(hwnd);
			
			if (prevHwnd != hwnd || prevMaxd != maxd)
			{
				if (maxd) RememberMaximized(hwnd);
				else ForgetMaximized(hwnd);
				
				prevHwnd = hwnd;
				prevMaxd = maxd;
			}
			
		} break;
		
		case EVENT_OBJECT_DESTROY: {
			
			if (IsMaximized(hwnd)) ForgetMaximized(hwnd);
			
		} break;
		
		default: return;
	}
	
	Unglass(*Maximized);
}

int WINAPI WinMain (HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
	#ifdef DEBUG
		AttachConsole(ATTACH_PARENT_PROCESS);
		freopen("CONOUT$", "wb", stdout);
	#endif
	
	InitializeDwmStuff();
	
	#define HOOK(E) SetWinEventHook(E, E, 0, (WINEVENTPROC) HookProc, 0, 0, WINEVENT_OUTOFCONTEXT)
	
	HOOK(EVENT_OBJECT_CREATE);
	HOOK(EVENT_OBJECT_LOCATIONCHANGE);
	HOOK(EVENT_OBJECT_DESTROY);
	
	Maximized = malloc(sizeof(HWND) * 1024);
	Maximized[0] = 0;
	
	Prescan();
	
	MSG msg; while (GetMessage(&msg, 0, 0, 0))
	{
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}
	
	return 0;
}