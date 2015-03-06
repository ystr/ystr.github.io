#ifdef DEBUG
	#include <stdio.h>
	#define WINVER 0x0501
#endif

#include <windows.h>


typedef void (WINAPI FlipFun) ();
static FlipFun* Flip;


static int ScrW, ScrH;
typedef enum { NC = 0, TL, TR, BL, BR } Corner;
static Corner HotCorner = NC;

Corner CornerFromCoords (int x, int y)
{
	if (x < 0 && y < 0) return TL;
	if (x > ScrW && y < 0) return TR;
	if (x < 0 && y > ScrH) return BL;
	if (x > ScrW && y > ScrH) return BR;
	
	return NC;
}


void OnMouseMove (int x, int y, int time)
{
	Corner flick = CornerFromCoords(x, y);
	if (!flick) return;
	
	if (!HotCorner) HotCorner = flick;
	if (HotCorner != flick) return;
	
	static int oldtime = 0;
	const int wait = 1000;
	
	if (time - oldtime > wait)
	{
		Flip();
		oldtime = time;
	}
}


LRESULT CALLBACK LowLevelMouseProc (int nCode, WPARAM wParam, LPARAM lParam)
{
	if (wParam != WM_MOUSEMOVE) goto end;
	
	MSLLHOOKSTRUCT* hs = (MSLLHOOKSTRUCT*) lParam;
	OnMouseMove(hs->pt.x, hs->pt.y, hs->time);
	
	end: return CallNextHookEx(0, nCode, wParam, lParam);
}

int WINAPI WinMain (HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
	#ifdef DEBUG
		AttachConsole(ATTACH_PARENT_PROCESS);
		freopen("CONOUT$", "wb", stdout);
	#endif
	
	ScrW = GetSystemMetrics(SM_CXSCREEN);
	ScrH = GetSystemMetrics(SM_CYSCREEN);
	
	HINSTANCE dwmapi = LoadLibrary("dwmapi.dll");
	Flip = (FlipFun*) GetProcAddress(dwmapi, MAKEINTRESOURCE(105));
	SetWindowsHookEx(WH_MOUSE_LL, LowLevelMouseProc, hInstance, 0);
	
	MSG msg; while (GetMessage(&msg, 0, 0, 0))
	{
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}
	
	return 0;
}