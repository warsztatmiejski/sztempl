const gui = () => {

	$('<ul/>').attr('id','menulist').addClass('menulist').appendTo('#menu');
	$('<div/>').attr('id','colorpicker').appendTo('#app');

	const populateColors = (paintColors, lefthandler = null, righthandler = null) => {
		$('#colorpicker').empty();
		//console.log(paintColors);
		let cnum = 0;
		for (color of paintColors) {
			//console.log(color);
			const paintblock = $('<div/>').attr({
				id: `p_${color.code}`,
				hex: color.hex,
				title: color.name
			}).css({"background-color":color.hex})
			.addClass('paintblock');
			if (lefthandler) {
				paintblock.on( "click", lefthandler )
			};
			if (righthandler) {
				paintblock.on( "contextmenu", righthandler )
			};
			$('#colorpicker').append(paintblock);
			if (cnum==28) {
				$('<hr/>').appendTo('#colorpicker');
			}
			cnum++;
		}
	}

	const addMenuItem = (name, handler, extraclass = '', parent = 'menulist') => {
		$('<li/>').html(name).addClass(`menuitem ${extraclass}`).appendTo(`#${parent}`)
    .bind('click', handler);
	}

	const addSeparator = (parent = 'menulist') => {
        $('<div/>').addClass('menuseparator').appendTo(`#${parent}`)
    }

    const addBR = (parent = 'menulist') => {
        $('<div/>').addClass('menubr').appendTo(`#${parent}`)
    }
	
	return {
		populateColors,
		addMenuItem,
		addSeparator,
		addBR
	}
};
