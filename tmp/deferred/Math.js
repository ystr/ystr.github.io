Ve3 = function (x, y, z) { this.X = x; this.Y = y; this.Z = z; }
Rot = function () { this.X = this.Y = this.Z = 0; this.W = 1; }


function Add (a, b) { return { X: a.X + b.X, Y: a.Y + b.Y, Z: a.Z + b.Z } }
function Sub (a, b) { return { X: a.X - b.X, Y: a.Y - b.Y, Z: a.Z - b.Z } }
function Mul (v, s) { return { X: v.X * s, Y: v.Y * s, Z: v.Z * s } }


function Dot (a, b)
{
	return a.X * b.X + a.Y * b.Y + a.Z * b.Z;
}

function Cross (a, b)
{
	return {
		X: a.Y * b.Z - a.Z * b.Y,
		Y: a.Z * b.X - a.X * b.Z,
		Z: a.X * b.Y - a.Y * b.X
	}
}


function Renorm (v, from, to) { return Mul(v, to / from); }
function Norm (v, to) { return Renorm(v, Len(v), to); }


function Qen (v) { return v.X * v.X + v.Y * v.Y + v.Z * v.Z; }
function Qis (a, b) { return Qen(Sub(a, b)); }

function Len (v) { return Math.sqrt(Qen(v)); }
function Dis (a, b) { return Math.sqrt(Qis(a, b)); }


function InvLoc (v) { return { X: -v.X, Y: -v.Y, Z: -v.Z } }
function InvRot (q) { return { X: -q.X, Y: -q.Y, Z: -q.Z, W: q.W } }


Turn = function (q, by)
{
	return {
		X: q.W * by.X + q.X * by.W + q.Y * by.Z - q.Z * by.Y,
		Y: q.W * by.Y + q.Y * by.W + q.Z * by.X - q.X * by.Z,
		Z: q.W * by.Z + q.Z * by.W + q.X * by.Y - q.Y * by.X,
		W: q.W * by.W - q.X * by.X - q.Y * by.Y - q.Z * by.Z
	};
}

Rotate = function (v, by)
{
	var x = v.X * by.W + v.Y * -by.Z - v.Z * -by.Y;
	var y = v.Y * by.W + v.Z * -by.X - v.X * -by.Z;
	var z = v.Z * by.W + v.X * -by.Y - v.Y * -by.X;
	var w = v.X * by.X - v.Y * -by.Y - v.Z * -by.Z;
	
	return {
		X: by.W * x + by.X * w + by.Y * z - by.Z * y,
		Y: by.W * y + by.Y * w + by.Z * x - by.X * z,
		Z: by.W * z + by.Z * w + by.X * y - by.Y * x
	};
}


Zenith = function (v, normal, pov)
{
	var dx = pov.X - v.X;
	var dy = pov.Y - v.Y;
	var dz = pov.Z - v.Z;
	
	var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
	
	return (
		dx / len * normal.X +
		dy / len * normal.Y +
		dz / len * normal.Z
	);
}


function RotFromAxisAngle (axis, angle)
{
	var sa = Math.sin(angle);
	
	this.X = axis.X * sa;
	this.Y = axis.Y * sa;
	this.Z = axis.Z * sa;
	
	this.W = Math.cos(angle);
}


RotP2C = function (rot, childRot)
{
	return Turn(InvRot(childRot), rot);
}

LocP2C = function (loc, childLoc, childRot)
{
	return Rotate(Sub(loc, childLoc), InvRot(childRot));
}

RotC2P = function (rot, childRot)
{
	return Turn(childRot, rot);
}

LocC2P = function (loc, childLoc, childRot)
{
	return Add(Rotate(loc, childRot), childLoc);
}

Protate = function (v, rov)
{
	return Rotate(v, InvRot(rov));
}
