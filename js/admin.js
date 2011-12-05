jQuery( function( $ ) {
	// Setup cursorial search field
	$( 'input#cursorial-search-field' ).cursorialSearch( {
		templates: {
			post: '#cursorial-search-result .template'
		},
		timeout: 1000,
		target: '#cursorial-search-result',
		area: '.cursorial-area'
	} );

	// Setup cursorial areas
	$( '.cursorial-area' ).cursorialArea( {
		templates: {
			post: '#cursorial-search-result .template'
		},
		buttons: {
			save: 'input.cursorial-area-save'
		}
	} );
} );
