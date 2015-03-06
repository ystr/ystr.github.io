Texture = function (xs, ys)
{
	this.Xs = xs;
	this.Ys = ys;
	
	this.Plain = [];
	this.YX = [];
	
	for (var i = 0; i < xs * ys; i++)
	{
		this.Plain[i] = 0;
	}
	
	for (var y = 0, i = 0; y < this.Ys; y++)
	{
		var row = this.YX[y] = [];
		
		for (var x = 0; x < this.Xs; x++, i++)
		{
			row[x] = this.Plain[i];
		}
	}
}


TestTexture = function (xs, ys)
{
	Texture.call(this, xs, ys);
	
	for (var y = 0; y < this.Ys; y++)
	{
		for (var x = 0; x < this.Xs; x++)
		{
			var edge = (
				x == 0 || y == 0 ||
				x == this.Xs - 1 || y == this.Ys - 1
			);
			
			var center = (
				(x == this.Xs / 2 - 1 || x == this.Xs / 2) &&
				(y == this.Ys / 2 - 1 || y == this.Ys / 2)
			);
			
			var check = (x % 2) ^ (y % 2);
			this.YX[y][x] = center || edge ? 1 : 0.25 + check * 0.5;
		}
	}
	
	this.YX[this.Ys - 3][this.Xs - 3] = 1;
}
