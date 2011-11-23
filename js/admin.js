jQuery( function() {
	( function( $ ) {
		function search() {
			var e = $( this ), val = e.val().replace( /\s+/g, ' ' ).replace( /^\s|\s$/, '' );
			if ( e.data( 'search-last' ) != val ) {
				console.log( val );
				e.data( 'search-last', val );
			}
		}

		function searchByTimeout() {
			var e = $( this );
			clearTimeout( e.data( 'search-timeout' ) );
			var timeout = setTimeout( function() {
				search.apply( e );
			}, 1000 );
			e.data( 'search-timeout', timeout );
		}

		// Set events
		$( 'input#cursorial-search-field' ).keydown( searchByTimeout );
	} )( jQuery );
} );
