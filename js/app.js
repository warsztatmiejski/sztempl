const GRID_SIZE = 7;
const PNG_SCALE = 2;
const VERSION = '0.9.1'
const STORAGE_ID = `sztempl_${VERSION}`;

let storage = null;
let canvasbox = null;
let blockbox = null;
let tilesDefinition = null;

const defaultStore = {
	settings: {
		paintColor: 28,
		canvasColor: 0
	},
	canvasHash: null
}

const paintColors = [
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

const boxOptions = {
	dragOut: true,
	acceptWidgets: true,
	disableResize: true,
	disableOneColumnMode: true,
	margin: 2,
	minRow: 1,
	float: true,
	removable: true
}

const canvasOptions = _.assign({}, boxOptions, {
	minRow: GRID_SIZE, 
	row:GRID_SIZE, 
	column: GRID_SIZE, 
	margin:0
});


// *********************************************************************************************


const saveStorage = (params) => {
	if (params) { storage = _.merge(storage, params) };
	const localStr = JSON.stringify(storage);
	localStorage.setItem(STORAGE_ID, localStr);
}

const loadStorage = () => {
	const localStr = localStorage.getItem(STORAGE_ID);
	if (!localStr) {
		storage = _.cloneDeep(defaultStore);
		saveStorage();
	} else {
		storage = JSON.parse(localStr);
	}
}

const saveBoard = () => {
	const hash = getCanvasHash();
	saveStorage({canvasHash: hash});
}

const rotateTile = (tile, dir) => {
	const rot = (Number(tile.attr('rot')) + 4 + dir) % 4;
	tile.css({'transform' : `rotate(${rot * 90}deg)`}).attr('rot',rot);
}

const setTileRotation = (tile, rot) => {
	tile.css({'transform' : `rotate(${rot * 90}deg)`}).attr('rot',rot);
}

const rotateTileClick = e => {
	e.preventDefault();
	e.stopPropagation();
	const tile = $(e.target);
	rotateTile(tile,1);
	saveBoard();
}

const dropTile = e => {
	e.preventDefault();
	e.stopPropagation();
	const tile = $(e.target).parent();
	if (tile.parent().attr('id') == "canvasbox") {
		canvasbox.removeWidget(tile[0]);
		blockbox.addWidget(tile[0],{"autoPosition": true});
	}
	saveBoard();
}

const createTile = (svg, rotation) => {
	const tile = $('<div/>').addClass('grid-stack-item');
	const img = svg.clone(true);
	img.attr('class','tilesvg');
	const svgbox = $('<div/>').addClass('grid-stack-item-content')
		.on('contextmenu', rotateTileClick).on( "dblclick", dropTile)
		.css({'transform' : `rotate(${rotation*90}deg)`})
		.attr('rot',rotation).append(img);
	tile.append(svgbox)

	return tile[0];
}

const savePNG = () => {
	const domNode = $("#canvasbox")[0];
	domtoimage.toPng(domNode,{
		width: domNode.clientWidth * PNG_SCALE,
		height: domNode.clientHeight * PNG_SCALE,
		style: {
		 	transform: 'scale('+PNG_SCALE+')',
		 	transformOrigin: 'top left'
		}
	})
		.then(dataUrl => {
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

async function loadTiles () {
	return await new Promise((resolve, reject) => {
		return $.getJSON('tiles/tiles.json').done(resolve).fail(reject);
	});
}

async function loadSVG (name) {
	return await new Promise((resolve, reject) => {
		const fname = `tiles/${name}.svg`;
		return $.get(fname, null, 'xml').done(data => {
			let $svg = jQuery(data).find('svg');
			$svg = $svg.removeAttr('xmlns').attr({name});
			resolve($svg);
		}).fail(reject);
	});
}

async function LoadAssets () {
	tilesDefinition = await loadTiles();	
	for(i in tilesDefinition) {
		const tile = tilesDefinition[i];
		tile.svg = await loadSVG(tile.name, i);
	}
	initBoard();
}

const repopulateTiles = () => {
	for (tile of tilesDefinition) {
		let count = 0;
		while (count < tile.count) {
			let rot = count % 4;
			blockbox.addWidget(createTile(tile.svg, rot));
			count++;
		}
	}
	setCanvasColor(storage.settings.canvasColor);
	setPaintColor(storage.settings.paintColor);	
}

const resetBoard = () => {
	clearBoard();
	repopulateTiles();
	saveBoard();
}

const initBoard = () => {
	clearBoard();
	repopulateTiles();
	if (storage.canvasHash) {
		importHash(storage.canvasHash);
	}
}

const getItemAttr = item => {
	const tile = $(item);
	const svg = tile.find('svg');
	const name = svg[0].getAttribute('name');
	return {
		x: Number(tile.attr('gs-x')),
		y: Number(tile.attr('gs-y')),
		rot: Number(tile.children().attr('rot')),
		name
	}
};

const moveTiles = (axis, delta) => {
	const items = canvasbox.getGridItems();
	const newitems = [];
	for(item of items) {
		const opts = getItemAttr(item);
		opts[axis] = (opts[axis] + GRID_SIZE + delta ) % GRID_SIZE;
		canvasbox.removeWidget(item);
		newitems.push({item,opts});
	}
	for (item of newitems) {
		canvasbox.addWidget(item.item, item.opts);
	}
	saveBoard();
}

const rotate = (dir) => {
	const items = canvasbox.getGridItems();
	const newitems = [];
	for(item of items) {
		const oldpos = getItemAttr(item);
		const opts = {y: oldpos.x, x: oldpos.y};
		const maxcount = GRID_SIZE - 1;
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
	saveBoard();
}

const name2bytes = iname => {
	const letter = iname.charCodeAt(0);
	const fnum = Number(iname.substr(1,2));
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
		hash.push(...name2bytes(itemAttr.name));
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
	let tilesarray = [];
	try { tilesarray = Base64.toUint8Array(hash) } 
	catch (error) {	tilesarray = [] }
	
	if ((tilesarray.length == 0) || ((tilesarray.length % 3) != 0)) {
		alert('Parsing Error: invalid hash');
		return undefined;
	}
	const tilesblocks = _.chunk(tilesarray,3);
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
			setTileRotation($(boxtile).children(),tile.rot);
			canvasbox.addWidget(boxtile,{x:tile.x,y:tile.y});
			return true;
		}
	}
	console.log(`tile not found: ${tile.name}`,tile)
	return false;
}

const importHash = (hash) => {
	let saveAfter = false;
	if (!_.isString(hash)) {
		hash = prompt('Paste your hash here, and press OK to load picture.');
		saveAfter = true;
	}
	if (hash) {
		clearBoard();
		repopulateTiles();
		const tiles = parseHashToTiles(hash);
		for (tile of tiles) {
			move2canvas(tile);
		}
	}
	if (saveAfter) saveBoard();
}

const pickPaintColor = e => {
	const cnum = $(e.target).attr('cnum');
	storage.settings.paintColor = cnum;	
	saveStorage({settings:{paintColor: cnum}});	
	setPaintColor(cnum);
	toggleColorPicker();
}

const pickCanvasColor = e => {
	e.preventDefault();
	e.stopPropagation();
	const cnum = $(e.target).attr('cnum');
	saveStorage({settings:{canvasColor: cnum}});	
	setCanvasColor(cnum);
	toggleColorPicker();
}

const moveLeft = () => moveTiles('x', -1);
const moveRight = () => moveTiles('x', 1);
const moveUp = () => moveTiles('y',- 1);
const moveDown = () => moveTiles('y', 1);
const rotateCW = () => rotate(1);
const rotateCCW = () => rotate(-1);

const toggleColorPicker = () => $('#colorpicker').slideToggle(100);
const setCanvasColor = cnum => $('#canvasbox').css({"background":paintColors[cnum].hex});
const setPaintColor = cnum => $('svg').css({"fill":paintColors[cnum].hex});

// *********************************************************************************************
// *********************************************************************************************
// *********************************************************************************************

$(document).ready(function() {
	loadStorage();
	const app = gui();
	
	// draw menu
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
	
	// setup grids
	$("#canvasbox").addClass(`grid-stack-${GRID_SIZE}`);
	canvasbox = GridStack.init(canvasOptions, $('#canvasbox')[0])
		.on('dropped',saveBoard)
		.on('change',saveBoard);
	blockbox = GridStack.init(boxOptions, $('#blockbox')[0])
		.on('dropped',saveBoard);
	
	// load assets
	(async () => { try {await LoadAssets()} catch(e) {console.log(e)} })();
});
