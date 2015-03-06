Pixel = function (x, y)
{
	this.SX = x;
	this.SY = y;
}

Pixel.prototype.Clear = function ()
{
	this.R = 0;
	this.G = 0;
	this.B = 0;
	
	this.DiffuseValue = 0;
	
	this.SW = -Infinity;
}




Eye = function (canvas)
{
	this.Canvas = canvas;
	this.C2D = this.Canvas.getContext('2d');
	
	this.MinRes = null;
	this.MaxRes = 256;
	
	this.NearClip = -0.1;
	
	this.Zoom = 1;
	this.Expo = 1;
	
	this.Lights = [];
}

Eye.prototype.Resize = function ()
{
	this.PhW = this.Canvas.scrollWidth;
	this.PhH = this.Canvas.scrollHeight;
	
	var ratio = this.PhW / this.PhH;
	
	if (ratio > 1)
	{
		this.Long = this.PhH;
		
		if (this.MaxRes && this.MaxRes < this.PhH) this.Long = this.MaxRes;
		if (this.MinRes && this.MinRes > this.PhH) this.Long = this.MinRes;
		
		this.W = this.Canvas.width = this.Long;
		this.H = this.Canvas.height = this.Short = ~~(this.W / ratio);
	}
	else
	{
		this.Long = this.PhW;
		
		if (this.MaxRes && this.MaxRes < this.PhW) this.Long = this.MaxRes;
		if (this.MinRes && this.MinRes > this.PhW) this.Long = this.MinRes;
		
		this.H = this.Canvas.height = this.Long;
		this.W = this.Canvas.width = this.Short = ~~(this.H * ratio);
	}
	
	this.area = this.W * this.H;
	
	this.X1 = ~~(this.W / 2);
	this.Y1 = ~~(this.H / 2);
	this.X0 = this.X1 - this.W;
	this.Y0 = this.Y1 - this.H;
	
	this.Plain = [];
	this.YX0 = [];
	this.YX = [];
	
	this.RawData = this.C2D.getImageData(0, 0, this.W, this.H);
	this.RawPixels = this.RawData.data;
	
	for (var i = 0, d = 0, y = this.Y1 - 1, y0 = this.H - 1; y >= this.Y0; --y, --y0)
	{
		var row = this.YX[y] = [];
		var row0 = this.YX0[y0] = [];
		
		for (var x = this.X0, x0 = 0; x < this.X1; ++x, ++x0, ++i, d += 4)
		{
			row[x] = row0[x0] = this.Plain[i] = new Pixel(x, y);
			this.RawPixels[d + 3] = 0xFF;
		}
	}
	
	this.L0 = [];
	this.L1 = [];
	
	for (var y = this.Y0; y < this.Y1; y++)
	{
		this.L0[y] = {};
		this.L1[y] = {};
	}
	
	this.UpdateFov();
}

Eye.prototype.Expose = function ()
{
	var rexpo = this.Expo * 0xFF;
	
	for (var si = 0, di = 0; si < this.area; si++, di += 4)
	{
		var p = this.Plain[si];
		
		this.RawPixels[di + 0] = p.DiffuseValue * p.R * rexpo;
		this.RawPixels[di + 1] = p.DiffuseValue * p.G * rexpo;
		this.RawPixels[di + 2] = p.DiffuseValue * p.B * rexpo;
	}
	
	this.C2D.putImageData(this.RawData, 0, 0);
}








Eye.prototype.Clear = function ()
{
	this.Lights.length = 0;
	
	for (var pi = 0; pi < this.Plain.length; pi++)
	{
		this.Plain[pi].Clear();
	}
}

Eye.prototype.Illuminate = function (light)
{
	for (var pi = 0; pi < this.Plain.length; pi++)
	{
		var p = this.Plain[pi];
		if (p.SW <= -Infinity) continue;
		
		var zen = Zenith(p.V, p.N, light.$VPoint);
		if (zen < 0) continue;
		
		var irr = 1.0 / Qis(p.V, light.$VPoint) * zen;
		
		p.R += light.Color.R * irr;
		p.G += light.Color.G * irr;
		p.B += light.Color.B * irr;
	}
}

Eye.prototype.Reveal = function ()
{
	for (var pi = 0; pi < this.Plain.length; pi++)
	{
		var p = this.Plain[pi];
		
		p.V = { X: p.SX / p.SW, Y: p.SY / p.SW, Z: p.SZ / p.SW };
		p.N = { X: p.NX / p.SW, Y: p.NY / p.SW, Z: p.NZ / p.SW };
	}
	
	for (var li in this.Lights)
	{
		this.Illuminate(this.Lights[li]);
	}
}








Eye.prototype.DrawRow = function (v0, v1, y)
{
	if (v0.SX > v1.SX) { var swap = v0; v0 = v1; v1 = swap; }
	
	var x0 = Math.ceil(v0.SX); if (x0 < this.X0) x0 = this.X0;
	var x1 = Math.ceil(v1.SX); if (x1 > this.X1) x1 = this.X1;
	
	var xx = 1.0 / (v1.SX - v0.SX);
	var skip = x0 - v0.SX;
	
	var szsz = (v1.SZ - v0.SZ) * xx;
	var swsw = (v1.SW - v0.SW) * xx;
	var nxnx = (v1.NX - v0.NX) * xx;
	var nyny = (v1.NY - v0.NY) * xx;
	var nznz = (v1.NZ - v0.NZ) * xx;
	var txtx = (v1.TX - v0.TX) * xx;
	var tyty = (v1.TY - v0.TY) * xx;
	
	var sz = v0.SZ + skip * szsz;
	var sw = v0.SW + skip * swsw;
	var nx = v0.NX + skip * nxnx;
	var ny = v0.NY + skip * nyny;
	var nz = v0.NZ + skip * nznz;
	var tx = v0.TX + skip * txtx;
	var ty = v0.TY + skip * tyty;
	
	for (var row = this.YX[y], x = x0; x < x1; x++)
	{
		var p = row[x];
		
		if (sw > p.SW)
		{
			p.SZ = sz;
			p.SW = sw;
			p.NX = nx;
			p.NY = ny;
			p.NZ = nz;
			
			if (this.Texture)
			{
				var u = (tx / sw * this.Texture.Xs) % this.Texture.Xs;
				var v = (ty / sw * this.Texture.Ys) % this.Texture.Ys;
				
				p.DiffuseValue = this.Texture.YX[~~v][~~u];
			}
		}
		
		sz += szsz;
		sw += swsw;
		nx += nxnx;
		ny += nyny;
		nz += nznz;
		tx += txtx;
		ty += tyty;
	}
}

Eye.prototype.PlotLine = function (a0, a1, l)
{
	var y0 = Math.ceil(a0.SY); if (y0 < this.Y0) y0 = this.Y0;
	var y1 = Math.ceil(a1.SY); if (y1 > this.Y1) y1 = this.Y1;
	
	var yy = 1.0 / (a1.SY - a0.SY);
	var skip = y0 - a0.SY;
	
	var sxsx = (a1.SX - a0.SX) * yy;
	var szsz = (a1.SZ - a0.SZ) * yy;
	var swsw = (a1.SW - a0.SW) * yy;
	var nxnx = (a1.NX - a0.NX) * yy;
	var nyny = (a1.NY - a0.NY) * yy;
	var nznz = (a1.NZ - a0.NZ) * yy;
	var txtx = (a1.TX - a0.TX) * yy;
	var tyty = (a1.TY - a0.TY) * yy;
	
	var sx = a0.SX + skip * sxsx;
	var sz = a0.SZ + skip * szsz;
	var sw = a0.SW + skip * swsw;
	var nx = a0.NX + skip * nxnx;
	var ny = a0.NY + skip * nyny;
	var nz = a0.NZ + skip * nznz;
	var tx = a0.TX + skip * txtx;
	var ty = a0.TY + skip * tyty;
	
	for (var y = y0; y < y1; ++y)
	{
		var p = l[y];
		
		p.SX = sx; sx += sxsx;
		p.SZ = sz; sz += szsz;
		p.SW = sw; sw += swsw;
		p.NX = nx; nx += nxnx;
		p.NY = ny; ny += nyny;
		p.NZ = nz; nz += nznz;
		p.TX = tx; tx += txtx;
		p.TY = ty; ty += tyty;
	}
}

Eye.prototype.DrawTri = function (a0, a1, a2)
{
	if (a1.SX > a2.SX) { var swap = a1; a1 = a2; a2 = swap }
	if (a0.SX > a1.SX) { var swap = a0; a0 = a1; a1 = swap }; if (a0.SX > this.X1) return;
	if (a1.SX > a2.SX) { var swap = a1; a1 = a2; a2 = swap }; if (a2.SX < this.X0) return;
	if (a1.SY > a2.SY) { var swap = a1; a1 = a2; a2 = swap }
	if (a0.SY > a1.SY) { var swap = a0; a0 = a1; a1 = swap }; if (a0.SY > this.Y1) return;
	if (a1.SY > a2.SY) { var swap = a1; a1 = a2; a2 = swap }; if (a2.SY < this.Y0) return;
	
	var y0 = Math.ceil(a0.SY);
	var y1 = Math.ceil(a1.SY);
	var y2 = Math.ceil(a2.SY);
	
	if (y0 != y2) this.PlotLine(a0, a2, this.L0); else return;
	if (y0 != y1) this.PlotLine(a0, a1, this.L1);
	if (y1 != y2) this.PlotLine(a1, a2, this.L1);
	
	if (y0 < this.Y0) y0 = this.Y0;
	if (y2 > this.Y1) y2 = this.Y1;
	
	for (var y = y0; y < y2; y++)
	{
		this.DrawRow(this.L0[y], this.L1[y], y);
	}
}







Eye.prototype.UpdateFov = function ()
{
	this.Pixoom = -(this.Zoom * this.Long / 2);
}

Eye.prototype.SetZoom = function (Zoom)
{
	this.Zoom = Zoom;
	this.UpdateFov();
}



Tricenter = function (v0, v1, v2)
{
	this.X = (v0.X + v1.X + v2.X) / 3;
	this.Y = (v0.Y + v1.Y + v2.Y) / 3;
	this.Z = (v0.Z + v1.Z + v2.Z) / 3;
}

IsBackFacing = function (v0, v1, v2, pov)
{
	var fp = new Tricenter(v0.Point, v1.Point, v2.Point);
	var fn = new Tricenter(v0.Normal, v1.Normal, v2.Normal);
	
	return Zenith(pov, fn, fp) > 0;
}




Eye.prototype.CullVert = function (v, pov, rov)
{
	v.$VPoint = LocP2C(v.Point, pov, rov);
	v.$Behind = v.$VPoint.Z > this.NearClip;
	
	v.$Needed = false;
}

Eye.prototype.CullFace = function (v0, v1, v2, pov, rov)
{
	if (
		(!v0.$Behind || !v1.$Behind || !v2.$Behind)
		&& !IsBackFacing(v0, v1, v2, pov)
	) {
		v0.$Needed = true;
		v1.$Needed = true;
		v2.$Needed = true;
	}
}




Eye.prototype.ProjectVert = function (v, pov, rov)
{
	if (!v.$Needed) return;
	v.$VNormal = Protate(v.Normal, rov);
}




NearClip = function (f, clip, b)
{
	var zz = (clip - f.$VPoint.Z) / (b.$VPoint.Z - f.$VPoint.Z);
	
	this.$VPoint = {
		
		Z: clip,
		
		X: f.$VPoint.X + (b.$VPoint.X - f.$VPoint.X) * zz,
		Y: f.$VPoint.Y + (b.$VPoint.Y - f.$VPoint.Y) * zz
		
	};
		
	this.$VNormal = {
		X: f.$VNormal.X + (b.$VNormal.X - f.$VNormal.X) * zz,
		Y: f.$VNormal.Y + (b.$VNormal.Y - f.$VNormal.Y) * zz,
		Z: f.$VNormal.Z + (b.$VNormal.Z - f.$VNormal.Z) * zz
	};
	
	this.Texco = {
		X: f.Texco.X + (b.Texco.X - f.Texco.X) * zz,
		Y: f.Texco.Y + (b.Texco.Y - f.Texco.Y) * zz,
	};
}

Apex = function (v, xoom)
{
	this.SW = xoom / v.$VPoint.Z;
	this.SX = v.$VPoint.X * this.SW;
	this.SY = v.$VPoint.Y * this.SW;
	this.SZ = v.$VPoint.Z * this.SW;
	this.NX = v.$VNormal.X * this.SW;
	this.NY = v.$VNormal.Y * this.SW;
	this.NZ = v.$VNormal.Z * this.SW;
	this.TX = v.Texco.X * this.SW;
	this.TY = v.Texco.Y * this.SW;
}

Eye.prototype.ProjectFace = function (v0, v1, v2, pov, rov)
{
	if (!v0.$Needed && !v1.$Needed && !v2.$Needed) return;
	
	switch (v0.$Behind + v1.$Behind + v2.$Behind)
	{
		case 0: {
			
			var a0 = new Apex(v0, this.Pixoom);
			var a1 = new Apex(v1, this.Pixoom);
			var a2 = new Apex(v2, this.Pixoom);
			
			this.DrawTri(a0, a1, a2);
			
		} break;
		
		case 1: {
			
			var f0, f1, bk;
			
			if (v0.$Behind) bk = v0, f0 = v1, f1 = v2;
			else if (v1.$Behind) bk = v1, f0 = v0, f1 = v2;
			else bk = v2, f0 = v0, f1 = v1;
			
			var m0 = new NearClip(f0, this.NearClip, bk);
			var m1 = new NearClip(f1, this.NearClip, bk);
			
			var af0 = new Apex(f0, this.Pixoom);
			var af1 = new Apex(f1, this.Pixoom);
			var am0 = new Apex(m0, this.Pixoom);
			var am1 = new Apex(m1, this.Pixoom);
			
			this.DrawTri(af0, af1, am0);
			this.DrawTri(af1, am1, am0);
			
		} break;
		
		case 2: {
			
			var fr, b0, b1;
			
			if (v0.$Behind && v1.$Behind) fr = v2, b0 = v0, b1 = v1;
			else if (v1.$Behind && v2.$Behind) fr = v0, b0 = v1, b1 = v2;
			else fr = v1, b0 = v0, b1 = v2;
			
			var m0 = new NearClip(fr, this.NearClip, b0);
			var m1 = new NearClip(fr, this.NearClip, b1);
			
			var afr = new Apex(fr, this.Pixoom);
			var am0 = new Apex(m0, this.Pixoom);
			var am1 = new Apex(m1, this.Pixoom);
			
			this.DrawTri(afr, am0, am1);
			
		} break;
	}
}








Eye.prototype.ForThingVerts = function (thing, pov, rov, fun)
{
	for (var vi = 0; vi < thing.Verts.length; vi++)
	{
		fun.call(this, thing.Verts[vi], pov, rov);
	}
}

Eye.prototype.ForThingFaces = function (thing, pov, rov, fun)
{
	for (var fi = 0; fi < thing.Faces.length; fi++)
	{
		var f = thing.Faces[fi];
		
		var v0 = thing.Verts[f[0]];
		var v1 = thing.Verts[f[1]];
		var v2 = thing.Verts[f[2]];
		
		fun.call(this, v0, v1, v2, pov, rov);
	}
}

Eye.prototype.RenderThing = function (thing, source, pov, rov)
{
	this.Texture = thing.Texture;
	
	this.ForThingVerts(thing, pov, rov, this.CullVert);
	this.ForThingFaces(thing, pov, rov, this.CullFace);
	this.ForThingVerts(thing, pov, rov, this.ProjectVert);
	this.ForThingFaces(thing, pov, rov, this.ProjectFace);
	
	for (var li in thing.Lights)
	{
		var l = thing.Lights[li];
		
		l.$VPoint = LocP2C(l.Point, pov, rov);
		
		this.Lights.push(l);
	}
	
	for (var ci in thing.Children)
	{
		var child = thing.Children[ci];
		if (child == source) continue;
		
		var cpov = LocP2C(pov, child.Location, child.Rotation);
		var crov = RotP2C(rov, child.Rotation);
		
		this.RenderThing(child, thing, cpov, crov);
	}
	
	if (thing.Parent && source != thing.Parent)
	{
		var ppov = LocC2P(pov, thing.Location, thing.Rotation);
		var prov = RotC2P(rov, thing.Rotation);
		
		this.RenderThing(thing.Parent, thing, ppov, prov);
	}
}

Eye.prototype.Render = function (thing, pov, rov)
{
	if (
		this.Canvas.scrollWidth != this.PhW ||
		this.Canvas.scrollHeight != this.PhH
	) {
		this.Resize();
	}
	
	this.Clear();
	this.RenderThing(thing, null, pov, rov);
	this.Reveal();
}
