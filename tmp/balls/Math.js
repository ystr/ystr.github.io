PIE = 3.141592653589793238462643
TAU = 6.283185307179586476925287

function Qen (v) { return v.X * v.X + v.Y * v.Y; }
function Len (v) { return Math.sqrt(Qen(v)); }
function Qis (v0, v1) { let x = v0.X - v1.X, y = v0.Y - v1.Y; return x*x + y*y; }
function Dis (v0, v1) { return Math.sqrt(Qis(v0, v1)); }

function Add (v0, v1) { return { X: v0.X + v1.X, Y: v0.Y + v1.Y } }
function Sub (v0, v1) { return { X: v0.X - v1.X, Y: v0.Y - v1.Y } }
function Mul (v, s) { return { X: v.X * s, Y: v.Y * s } }

Renorm = function (v, from, to)
{
	to /= from;
	
	this.X = v.X * to;
	this.Y = v.Y * to;
}

Norm = function (v, to)
{
	Renorm.call(this, v, Len(v), to);
}

Rotate = function (v, angle)
{
	let cs = Math.cos(angle);
	let sn = Math.sin(angle);
	
	return {
		X: v.X * cs - v.Y * sn,
		Y: v.X * sn - v.Y * cs
	};
}
