Clock =
{
	FPS: 30,
	Speed: 1,
	OnTick: null,
	Factor: 0,
	Time: 0,
	
	Tick: function ()
	{
		if (!Clock.Running) return;
		
		Clock.Factor = Clock.SPF * Clock.Speed;
		Clock.Time += Clock.Factor;
		
		if (Clock.OnTick) Clock.OnTick();
	},
	
	Start: function ()
	{
		if (Clock.Running) return;
		Clock.Running = true;
		
		Clock.SPF = 1.0 / Clock.FPS;
		Clock.MSPF = Clock.SPF * 1000;
		
		Clock.interval = setInterval(Clock.Tick, Clock.MSPF);
	},
	
	Pause: function ()
	{
		if (!Clock.Running) return;
		Clock.Running = false;
		
		clearInterval(Clock.interval);
		Clock.interval = null;
	}
}
