const gui = () => {

	$('<ul/>').attr('id','menulist').addClass('menulist').appendTo('#menu');

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

	let paintColor = 'black';

	return {
		paintColor,
		addMenuItem,
		addSeparator,
		addBR
	}
};
