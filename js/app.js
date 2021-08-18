const GRIDSIZE = 7;

const paintColors = [
	{name:'black', hex:'#000', class:'cblack'},
	{name:'red', hex:'#F00', class:'cred'},
	{name:'green', hex:'#0F0', class:'cgreen'},
	{name:'blue', hex:'#00F', class:'cblue'}
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
	const img = $(`<img src='tiles/${svgname}'/>`).addClass('grid-stack-item-content')
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

const colorPicker = () => { 

};

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
	//app.addSeparator();
	//app.addMenuItem('◐ Colours', colorPicker);
	
});
