Screen = function (tgtCanvasId)
{
	this.Zoom = 1;
	
	this.Canvas = document.getElementById(tgtCanvasId);
	this.C2D = this.Canvas.getContext('2d');
	
	this.Clear = () => {
		this.C2D.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
	}
	
	this.Prepare =
	this.Resize = () =>
	{
		this.PhXs = this.Canvas.width = this.Canvas.scrollWidth;
		this.PhYs = this.Canvas.height = this.Canvas.scrollHeight;
		
		this.HalfPhXs = this.PhXs / 2, this.HalfPhYs = this.PhYs / 2;
		this.Multiplier = this.HalfPhXs < this.HalfPhYs ? this.HalfPhXs : this.HalfPhYs;
	}
	
	this.ToPhX = (x) => { return this.HalfPhXs + x * this.Multiplier * this.Zoom }
	this.ToPhY = (y) => { return this.HalfPhYs - y * this.Multiplier * this.Zoom }
	this.ToPhR = (r) => { return r * this.Multiplier * this.Zoom }
	
	this.DrawCircle = (x, y, r, style) =>
	{
		x = this.ToPhX(x);
		y = this.ToPhY(y);
		r = this.ToPhR(r);
		
		this.C2D.beginPath();
		this.C2D.strokeStyle = style || 'white';
		this.C2D.arc(x, y, r, 0, Math.PI * 2, false);
		this.C2D.stroke();
	}
	
	this.DrawLine = (v0, v1, style) =>
	{
		v0 = { X: this.ToPhX(v0.X), Y: this.ToPhY(v0.Y) };
		v1 = { X: this.ToPhX(v1.X), Y: this.ToPhY(v1.Y) };
		
		this.C2D.beginPath();
		this.C2D.strokeStyle = style || 'white';
		this.C2D.moveTo(v0.X, v0.Y);
		this.C2D.lineTo(v1.X, v1.Y);
		this.C2D.stroke();
	}
	
	window.addEventListener("load", () => this.Prepare());
	window.addEventListener("resize", () => this.Resize());
}
