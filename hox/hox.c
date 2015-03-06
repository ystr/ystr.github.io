#define _DEFAULT_SOURCE
#include <X11/Xlib.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>


#define SLEEP 1 / 10


void Run (const char* com)
{
	static const char* last = 0;
	if (com && last == com) return;
	if ((last = com)) system(com);
}


int main (int argc, char** argv)
{
	Display* xd = XOpenDisplay(0);
	Window xroot = XRootWindow(xd, 0);
	int xscr = DefaultScreen(xd);
	
	int sw = DisplayWidth(xd, xscr);
	int sh = DisplayHeight(xd, xscr);
	
	char* tl = 0, *tr = 0;
	char* bl = 0, *br = 0;
	
	for (char** arg = argv + 1; arg < argv + argc; arg++)
	{
		if (!strcmp("-tl", *arg)) { tl = *++arg; continue; }
		if (!strcmp("-tr", *arg)) { tr = *++arg; continue; }
		if (!strcmp("-bl", *arg)) { bl = *++arg; continue; }
		if (!strcmp("-br", *arg)) { br = *++arg; continue; }
	}
	
	for ( ;; usleep(1000000 * SLEEP) )
	{
		static Window qroot, qchild;
		static int qrx, qry, qwx, qwy;
		static unsigned qmask;
		
		XQueryPointer (
			xd, xroot, &qroot, &qchild,
			&qrx, &qry, &qwx, &qwy, &qmask
		);
		
		if (qrx <= 0) {
			if (qry <= 0) Run(tl);
			else if (qry >= sh - 1) Run(bl);
			else Run(0);
		} else if (qrx >= sw - 1) {
			if (qry <= 0) Run(tr);
			else if (qry >= sh - 1) Run(br);
			else Run(0);
		} else Run(0);
	}
	
	return 0;
}
