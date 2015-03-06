Cube = function (r, n)
{
	var fld = { X: -r, Y: -r, Z: +r };
	var flu = { X: -r, Y: +r, Z: +r };
	var fru = { X: +r, Y: +r, Z: +r };
	var frd = { X: +r, Y: -r, Z: +r };
	var bld = { X: -r, Y: -r, Z: -r };
	var blu = { X: -r, Y: +r, Z: -r };
	var bru = { X: +r, Y: +r, Z: -r };
	var brd = { X: +r, Y: -r, Z: -r };
	
	var ps = [
		brd, bru, blu, bld,  bld, fld, frd, brd,
		bld, blu, flu, fld,  brd, bru, fru, frd,
		blu, flu, fru, bru,  fld, flu, fru, frd
	];
	
	var ns = [
		{ X: 0, Y: 0, Z: -n }, { X: 0, Y: -n, Z: 0 },
		{ X: -n, Y: 0, Z: 0 }, { X: +n, Y: 0, Z: 0 },
		{ X: 0, Y: +n, Z: 0 }, { X: 0, Y: 0, Z: +n },
	];
	
	this.Verts = [];
	this.Faces = [];
	
	for (var vi = 0, ni = 0; vi < ps.length; vi += 4, ni++)
	{
		this.Verts.push({ Point: ps[vi + 0], Normal: ns[ni], Texco: { X: 0, Y: 0 } });
		this.Verts.push({ Point: ps[vi + 1], Normal: ns[ni], Texco: { X: 0, Y: 1 } });
		this.Verts.push({ Point: ps[vi + 2], Normal: ns[ni], Texco: { X: 1, Y: 1 } });
		this.Verts.push({ Point: ps[vi + 3], Normal: ns[ni], Texco: { X: 1, Y: 0 } });
		
		this.Faces.push([vi + 0, vi + 1, vi + 2]);
		this.Faces.push([vi + 2, vi + 3, vi + 0]);
	}
	
	this.Location = new Ve3(0, 0, 0);
	this.Rotation = new Rot;
	
	this.Texture = new TestTexture(16, 16);
}
