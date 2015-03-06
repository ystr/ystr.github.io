#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/sysinfo.h>
#include <X11/Xlib.h>
#include <time.h>




void XSetRoot (const char* name)
{
	Display* display;
	if (!(display = XOpenDisplay(0))) { fprintf(stderr, "Can't XOpenDisplay"); exit(1); }
	XStoreName(display, DefaultRootWindow(display), name);
	XSync(display, 0);
	XCloseDisplay(display);
}




typedef struct {
	unsigned long MemTotal;
	unsigned long MemFree;
	unsigned long Cached;
	unsigned long Buffers;
} ProcMemInfo;

int ExtractProcMemValue (char* raw, char* opt)
{
	char* numst = strstr(raw, opt) + strlen(opt) + 1;
	int v; sscanf(numst, "%i", &v); return v;
}

void GetProcMemInfo (ProcMemInfo* pmi)
{
	FILE* f = fopen("/proc/meminfo", "r");
	char raw[4096]; char* ptr = raw; int size;
	
	for (;;) {
		size = fread(ptr, 1, 32, f);
		ptr += size; if (size != 32) break;
	}
	
	*ptr = 0;
	
	pmi->MemTotal = ExtractProcMemValue(raw, "MemTotal");
	pmi->MemFree = ExtractProcMemValue(raw, "MemFree");
	pmi->Cached = ExtractProcMemValue(raw, "Cached");
	pmi->Buffers = ExtractProcMemValue(raw, "Buffers");
	
	fclose(f);
}




typedef struct {
	unsigned long User;
	unsigned long Nice;
	unsigned long System;
	unsigned long Idle;
	unsigned long Iowait;
	unsigned long Irq;
	unsigned long Softirq;
} ProcStat;

char* NextProcStatColumn (char* start, unsigned long* out)
{
	for (char* next = start ;; next++)
	{
		if (*next == ' ' || *next == '\n') *next = '\0';
		if (*next == '\0') { next++; sscanf(start, "%u", out); return next; }
	}
}

void GetProcStat (ProcStat* ps)
{
	FILE* f = fopen("/proc/stat", "r");
	static char raw[1024]; fgets(raw, sizeof(raw), f);
	char* ptr = raw + 3; while (*ptr == ' ') ptr++;
	
	ptr = NextProcStatColumn(ptr, &ps->User);
	ptr = NextProcStatColumn(ptr, &ps->Nice);
	ptr = NextProcStatColumn(ptr, &ps->System);
	ptr = NextProcStatColumn(ptr, &ps->Idle);
	ptr = NextProcStatColumn(ptr, &ps->Iowait);
	ptr = NextProcStatColumn(ptr, &ps->Irq);
	ptr = NextProcStatColumn(ptr, &ps->Softirq);
	
	fclose(f);
}




char* GetDate ()
{
	static char date[32];
	time_t now = time(0);
	strftime(date, sizeof(date), "%d.%m %H:%M:%S", localtime(&now));
	return date;
}

char* GetRam ()
{
	static char ram[8];
	static ProcMemInfo pmi; GetProcMemInfo(&pmi);
	sprintf(ram, "%iM", (pmi.MemTotal - pmi.MemFree - pmi.Cached - pmi.Buffers) / 1024);
	return ram;
}

char* GetCpu ()
{
	static char cpu[8];
	static ProcStat ps; GetProcStat(&ps);
	
	static float previdle = 0;
	static float prevtotal = 0;
	
	float curidle = ps.Idle;
	float curtotal = ps.User + ps.Nice + ps.System + curidle + ps.Iowait + ps.Irq + ps.Softirq;
	
	float idle = curidle - previdle;
	float total = curtotal - prevtotal;
	
	previdle = curidle;
	prevtotal = curtotal;
	
	sprintf(cpu, "%i%%", (int) ((1.0 - idle / total) * 100));
	return cpu;
}




int main ()
{
	static char status[512];
	
	for (;;)
	{
		status[0] = 0;
		
		#define ADD(T) strcat(status, T)
		
		ADD(GetCpu());
		ADD(" ");
		ADD(GetRam());
		ADD(" ");
		ADD(GetDate());
		
		XSetRoot(status);
		sleep(1);
	}
	
	return 0;
}
