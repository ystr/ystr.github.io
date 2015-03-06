Thing = function (ini)
{
	this.Radius = ini.Radius || 1;
	this.Location = ini.Location || { X: 0, Y: 0 };
	this.Velocity = ini.Velocity || { X: 0, Y: 0 };
	this.Acceleration = ini.Acceleration || { X: 0, Y: 0 };
	this.Color = ini.Color || null;
	
	this.Draw = (to) =>
	{
		to.DrawCircle(this.Location.X, this.Location.Y, this.Radius, this.Color);
	}
}
