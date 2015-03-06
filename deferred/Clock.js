Clock =
{
	Prev: 0,
	Factor: 0,
	
	Started: false,
	
	Tick: function (time)
	{
		if (!Clock.Started) return;
		
		Clock.Factor = Clock.Prev ? (time - Clock.Prev) / 1000 : 0;
		if (Clock.Factor && Clock.OnTick) Clock.OnTick();
		Clock.Prev = time;
		
		window.requestAnimationFrame(Clock.Tick);
	},
	
	Start: function ()
	{
		if (Clock.Started) return;
		Clock.Started = true;
		Clock.Tick();
	},
	
	Pause: function ()
	{
		Clock.Started = false;
	},
}
