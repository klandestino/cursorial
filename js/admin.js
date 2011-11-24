jQuery( function() {
	( function( $ ) {
		/**
		 * Executes a search
		 */
		function search() {
			var e = $( this ), val = e.val().replace( /\s+/g, ' ' ).replace( /^\s|\s$/, '' );
			if ( e.data( 'search-last' ) != val ) {
				e.data( 'search-last', val );
				e.parents( 'form' ).ajaxForm( {
					form: e.parents( 'form' ),
					element: e,
					type: 'POST',
					dataType: 'json',
					success: searchResult
				} ).submit();
				e.addClass( 'working' );
			}
		}

		/**
		 * Sets a timeout until next search
		 */
		function searchByTimeout() {
			var e = $( this );
			clearTimeout( e.data( 'search-timeout' ) );
			var timeout = setTimeout( function() {
				search.apply( e );
			}, 1000 );
			e.data( 'search-timeout', timeout );
		}

		/**
		 * Renders the search result data in specified target with specified
		 * template.
		 */
		function searchResult( data ) {
			var target = $( this.form.find( 'input[name=target]' ).val() );
			this.element.removeClass( 'working' );

			if ( target.length > 0 ) {
				target.find( '.template-clone' ).remove();
				var template = target.find( '.template' );

				for ( var i in data ) {
					var item = template.clone();
					item.removeClass( 'template' );
					item.addClass( 'template-clone' );

					for ( var ii in data[ i ] ) {
						var element = item.find( '.template-data-' + ii );
						if ( element.length > 0 ) {
							element.text( data[ i ][ ii ] );
						}
					}

					target.append( item );
				}
			}
		}

		// Set events
		$( 'input#cursorial-search-field' ).keydown( searchByTimeout );
	} )( jQuery );
} );
