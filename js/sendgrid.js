var moves = [];
var moves_valid = ['Up', 'Right', 'Down', 'Left'];
var moving = false;
var rate_move = 500;
var rate_refresh = 1000;

function clear()
{
	//moves = [];
	//$.post('php/sendgrid.php', { 'clear': true });
	$('#log').html('Move log:<br /><br />Game started.<br />');
	$('#log').css('overflow-y', 'hidden');
}

function grid_text(grid)
{
	text = '';

	for (var y = 0; y < 4; y++)
	{
		text += '|';

		for (var x = 0; x < 4; x++)
		{
			if (grid[x][y] >= 2)
			{
				text += grid[x][y];
			}
			else
			{
				text += ' ';
			}

			text += '|';
		}

		text += '\n';
	}

	return text;
}

function move_feed(feed, rate)
{
	var move;
	var tile;

	if (feed.length < 1)
	{
		moving = false;
		return;
	}

	move = feed.shift();
	moves.push(move);

	if (move.move >= 0 && move.move <= 3)
	{
		gm.move(move.move);
		$('#log').append(
			move.from + ' sent move ' + moves_valid[move.move] + '.<br />'
		);
	}

	tile = new Tile(
		{'x': parseInt(move.x), 'y': parseInt(move.y)}, parseInt(move.tile)
	);
	gm.grid.insertTile(tile);
	gm.actuate();
	$('#log').append(
		move.tile + ' tile generated at (' + move.x + ', ' + move.y +
			').<br />'
	);

	if (moves.length >= 13)
	{
		$('#log').css('overflow-y', 'scroll');
	}

	setTimeout(
		function ()
		{
			move_feed(feed, rate);
		},
		rate
	);
}

function read(rate)
{
	if (moving)
	{
		return;
	}

	var result = $.post('php/sendgrid.php', { 'read': true });

	result.done
	(
		function (data)
		{
			// Feed the new moves.
			var feed = jQuery.parseJSON(data);
			var moves_feed = feed.moves.slice(moves.length);
			moving = true;
			move_feed(moves_feed, rate);
			$('#grid').text(grid_text(feed.grid));
		}
	);
}

clear();
read(0);
setInterval(
	function ()
	{
		read(rate_move);
	},
	rate_refresh
);