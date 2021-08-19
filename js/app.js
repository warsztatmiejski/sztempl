const GRIDSIZE = 7;

const paintColors = [
/*
	{name:'biel', hex:'#e7eff1', code: '191'},
	{name:'maślany', hex:'#', code: '199'},
	{name:'jasny żółty', hex:'#', code: '200'},
	{name:'ciemny żółty', hex:'#', code: '201'},
	{name:'cielisty', hex:'#', code: '198'},
	{name:'łososiowy', hex:'#', code: '256'},
	{name:'pomarańczowy', hex:'#', code: '203'},
	{name:'czerwony jasny', hex:'#', code: '249'},
	{name:'czerwony', hex:'#', code: '250'},
	{name:'fuksja', hex:'#', code: '253'},
	{name:'karmin', hex:'#', code: '251'},
	{name:'bordowy', hex:'#', code: '254'},
	{name:'róż', hex:'#', code: '255'},
	{name:'lawenda', hex:'#', code: '301'},
	{name:'fiolet', hex:'#', code: '300'},
	{name:'granat', hex:'#', code: '350'},
	{name:'niebieski', hex:'#', code: '352'},
	{name:'błękit', hex:'#', code: '349'},
	{name:'błękit jasny', hex:'#', code: '348'},
	{name:'turkus', hex:'#', code: '351'},
	{name:'szary', hex:'#', code: '499'},
	{name:'zieleń ciemna', hex:'#', code: '400'},
	{name:'zieleń jasna', hex:'#', code: '401'},
	{name:'mięta', hex:'#', code: '399'},
	{name:'oliwka', hex:'#', code: '403'},
	{name:'sahara', hex:'#', code: '454'},
	{name:'brąz jasny', hex:'#', code: '451'},
	{name:'brąz', hex:'#', code: '450'},
	{name:'czarny', hex:'#', code: '500'},

	{name:'zielony fluo', hex:'#', code: '0400'},
	{name:'żółty fluo', hex:'#', code: '0200'},
	{name:'pomarańcz fluo', hex:'#', code: '0201'},
	{name:'czerwień fluo', hex:'#', code: '0250'},
	{name:'różowy fluo', hex:'#', code: '0252'}
*/

	{name:'white', hex:'#ffffff', code: '191'},
	{name:'butter', hex:'#fbf470', code: '199'},
	{name:'light yellow', hex:'#fed000', code: '200'},
	{name:'dark yellow', hex:'#ffa600', code: '201'},
	{name:'flesh yellow', hex:'#f4c09b', code: '198'},
	{name:'salmon', hex:'#ff9855', code: '256'},
	{name:'orange', hex:'#f81f00', code: '203'},
	{name:'bright red', hex:'#d10000', code: '249'},
	{name:'red', hex:'#ba0001', code: '250'},
	{name:'fuchsia', hex:'#900000', code: '253'},
	{name:'carmine', hex:'#690000', code: '251'},
	{name:'maroon', hex:'#4c0000', code: '254'},
	{name:'pink', hex:'#ff6ce1', code: '255'},
	{name:'lavender', hex:'#a168ad', code: '301'},
	{name:'violet', hex:'#481268', code: '300'},
	{name:'dark blue', hex:'#01004c', code: '350'},
	{name:'blue', hex:'#0152e1', code: '352'},
	{name:'azure', hex:'#0269df', code: '349'},
	{name:'light blue', hex:'#40d5eb', code: '348'},
	{name:'turquoise', hex:'#006488', code: '351'},
	{name:'grey', hex:'#1d262b', code: '499'},
	{name:'dark green', hex:'#033a3d', code: '400'},
	{name:'light green', hex:'#01a300', code: '401'},
	{name:'mint', hex:'#81e487', code: '399'},
	{name:'olive', hex:'#585b00', code: '403'},
	{name:'sahara', hex:'#af7801', code: '454'},
	{name:'light brown', hex:'#840000', code: '451'},
	{name:'brown', hex:'#330300', code: '450'},
	{name:'black', hex:'#000000', code: '500'},

	{name:'fluo green', hex:'#00e701', code: '0400'},
	{name:'fluo yellow', hex:'#ede101', code: '0200'},
	{name:'fluo orange', hex:'#ff6d00', code: '0201'},
	{name:'fluo red', hex:'#fe0906', code: '0250'},
	{name:'fluo pink', hex:'#ff0042', code: '0252'}

];

const rotateTile = (tile, dir) => {
	const rot = (Number(tile.attr('rot')) + 4 + dir) % 4;
	tile.css({'transform' : `rotate(${rot * 90}deg)`}).attr('rot',rot);
}

const rotateTileClick = e => {
	e.preventDefault();
	e.stopPropagation();
	const tile = $(e.target);
	rotateTile(tile,1);
}

const dropTile = e => {
	e.preventDefault();
	e.stopPropagation();
	const tile = $(e.target).parent();
	if (tile.parent().attr('id') == "canvasbox") {
		canvasbox.removeWidget(tile[0]);
		blockbox.addWidget(tile[0],{"autoPosition": true});
	}
}

const createTile = (svgname, rotation) => {
	const tile = $('<div/>').addClass('grid-stack-item');
	//const img = $(`<object type='image/svg+xml' data='tiles/${svgname}'></object>`)
	const img = $(`<img src='tiles/${svgname}'>`)
	.addClass('grid-stack-item-content')
	.on('contextmenu', rotateTileClick).on( "dblclick", dropTile )
	.css({'transform' : `rotate(${rotation*90}deg)`})
	.attr('rot',rotation);
	tile.append(img)

	return tile[0];
}

const savePNG = () => {
	//$("#canvasbox").addClass("pngback");
	//$("img.grid-stack-item-content").addClass("fblue");
	domtoimage.toPng($("#canvasbox")[0])
		.then(dataUrl => {
			//$("#canvasbox").removeClass("pngback");
			//$("img.grid-stack-item-content").removeClass("fblue");
			const a = document.createElement('a')
			a.setAttribute('download', 'mystamp.png')
			a.setAttribute('href', dataUrl)
			a.click()
			a.remove()
		})		
}

const clearBoard = () => {
	blockbox.removeAll();
	canvasbox.removeAll();
}

const makeTilesClickable = () => $('.grid-stack-item img')

const repopulateTiles = (callback) => {
	$.getJSON('tiles/tiles.json' , tiles => {
		for (tile of tiles) {
			let count = 0;
			while (count < tile.count) {
				let rot = count % 4;
				blockbox.addWidget(createTile(`${tile.name}.svg`,rot));
				count++;
			}
		}
		if (callback) {
			callback();
		}
		
	});
}

const resetBoard = (callback = null) => {
	clearBoard();
	repopulateTiles(callback);
}

const getItemAttr = item => {
	const tile = $(item);
	const src = tile.children('img').attr('src');
	return {
		x: Number(tile.attr('gs-x')),
		y: Number(tile.attr('gs-y')),
		rot: Number(tile.children('img').attr('rot')),
		src,
		name: _.last(_.split(src,"/")).substr(0,3)
	}
};

const moveTiles = (axis, delta) => {
	const items = canvasbox.getGridItems();
	const newitems = [];
	for(item of items) {
		const opts = getItemAttr(item);
		opts[axis] = (opts[axis] + GRIDSIZE + delta ) % GRIDSIZE;
		canvasbox.removeWidget(item);
		newitems.push({item,opts});
	}
	for (item of newitems) {
		canvasbox.addWidget(item.item, item.opts);
	}
}

const rotate = (dir) => {
	const items = canvasbox.getGridItems();
	const newitems = [];
	for(item of items) {
		const oldpos = getItemAttr(item);
		const opts = {y: oldpos.x, x: oldpos.y};
		const maxcount = GRIDSIZE - 1;
	    if (dir == 1) {
			opts.x = maxcount - oldpos.y;
		}
		if (dir == -1) {
			opts.y = maxcount - oldpos.x;
		}
		rotateTile($(item).children(),dir);
		canvasbox.removeWidget(item);
		newitems.push({item,opts});
	}
	for (item of newitems) {
		canvasbox.addWidget(item.item, item.opts);
	}
}

const name2bytes = iname => {
	const fname = _.last(_.split(iname,'/'));
	const letter = fname.charCodeAt(0);
	const fnum = Number(fname.substr(1,2));
	return [letter, fnum];
}

const attr2byte = attr => {
	let byte = (attr.x & 7) << 5;
	byte |= (attr.y & 7) << 2;
	byte |= (attr.rot & 3);
	return byte;
}

const getCanvasHash = () => {
	const items = canvasbox.getGridItems();
	let hash = [];
	if (items.length == 0) {
		return null;
	}
	for(item of items) {
		const itemAttr = getItemAttr(item);
		hash.push(attr2byte(itemAttr));
		hash.push(...name2bytes(itemAttr.src));
	}
	return Base64.fromUint8Array(new Uint8Array(hash));
}

const exportHash = () => {
	hash = getCanvasHash();
	if (hash) {
		prompt('Here is your picture hash. Copy it and keep in the safe place:', hash);
	}
}

const parseHashToTiles = hash => {
	let tilesarray = []
	try {
		tilesarray = Base64.toUint8Array(hash);	
	} catch (error) {
		tilesarray = [];
	}
	
	if ((tilesarray.length == 0) || ((tilesarray.length % 3) != 0)) {
		alert('Parsing Error: invalid hash');
		return undefined;
	}
	const tilesblocks = _.chunk(tilesarray,3);
	//console.log(tilesblocks);
	const tiles = [];
	for (tilebytes of tilesblocks) {
		const letter = String.fromCharCode(tilebytes[1]);
		const name = `${letter}${tilebytes[2].toString().padStart(2, '0')}`;
		const rot = tilebytes[0] & 3;
		const x = (0b11100000 & tilebytes[0]) >> 5;
		const y = (0b00011100 & tilebytes[0]) >> 2;
		tiles.push({x,y,rot,name})
	}
	return tiles;
}

const move2canvas = tile => {
	const boxTiles = blockbox.getGridItems();
	for (boxtile of boxTiles) {
		const tileAttr = getItemAttr(boxtile);
		if (tileAttr.name == tile.name) {
			blockbox.removeWidget(boxtile);
			canvasbox.addWidget(createTile(`${tile.name}.svg`,tile.rot),{x:tile.x,y:tile.y});
			return true;
		}
	}
	console.log(`tile not found: ${tile.name}`,tile)
	return false;
}

const importHash = () => {
	hash = prompt('Paste your hash here, and press OK to load picture.');
	if (hash) {
		resetBoard(()=>{
			const tiles = parseHashToTiles(hash);
			for (tile of tiles) {
				move2canvas(tile);
			}
		});
	}
}

const toggleColorPicker = () => { 
	$('#colorpicker').slideToggle(100);
};

const setCanvasColor = (color) => {
	//console.log(color.hex)
	$('#canvasbox').css({"background":color.hex});
}

const pickPaintColor = e => {
	const block = e.target;
	setPaintColor({name:block.title, hex:block.hex});
	toggleColorPicker();
}

const pickCanvasColor = e => {
	e.preventDefault();
	e.stopPropagation();
	const block = $(e.target);
	setCanvasColor({name:block.attr('title'), hex:block.attr('hex')});
	toggleColorPicker();
}

const moveLeft = () => moveTiles('x', -1);
const moveRight = () => moveTiles('x', 1);
const moveUp = () => moveTiles('y',- 1);
const moveDown = () => moveTiles('y', 1);
const rotateCW = () => rotate(1);
const rotateCCW = () => rotate(-1);

let canvasbox = null;
let blockbox = null;

$(document).ready(function() {

	let opts = {
		dragOut: true,
		acceptWidgets: true,
		disableResize: true,
		disableOneColumnMode: true,
		margin: 2,
		minRow: 1,
		float: true,
		removable: true
	}
	$("#canvasbox").addClass(`grid-stack-${GRIDSIZE}`);
	canvasbox = GridStack.init(_.assign({}, opts, {minRow: GRIDSIZE, row:GRIDSIZE, column: GRIDSIZE, margin:0}), document.getElementById('canvasbox'))
	blockbox = GridStack.init(opts, document.getElementById('blockbox'))
	resetBoard();
	const app = gui();
	app.addMenuItem('🖪 Save PNG', savePNG);
	app.addMenuItem('Export', exportHash);
	app.addMenuItem('Import', importHash);
	app.addSeparator();
	app.addMenuItem('✖ Clear', () => {if (confirm("Are you sure?")) resetBoard()});
	app.addSeparator();
	app.addMenuItem('⭠', moveLeft, 'smallbutton');
	app.addMenuItem('⭢', moveRight, 'smallbutton');
	app.addMenuItem('⭡', moveUp, 'smallbutton');
	app.addMenuItem('⭣', moveDown, 'smallbutton');
	app.addMenuItem('⭮', rotateCW, 'smallbutton');
	app.addMenuItem('⭯', rotateCCW, 'smallbutton');
	app.addSeparator();
	app.addMenuItem('◐ Colours', toggleColorPicker);
	app.populateColors(paintColors, pickPaintColor, pickCanvasColor);
	setCanvasColor(paintColors[0]);
});
