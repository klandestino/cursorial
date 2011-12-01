/**
 * Wrapp all js-functionality in the jQuery-document-ready-event with $ as an alias for jQuery
 */
jQuery( function() {
	( function( $ ) {
		$.fn.cursorialArea = function( options ) {
			function getAreaPosts( callback ) {
				var area = $( this );
				$.ajax( {
					url: CURSORIAL_PLUGIN_URL + 'json.php',
					type: 'POST',
					data: 'action=area&area=' + area.data( 'cursorial_area' ),
					dataType: 'json',
					success: function( data ) {
						area.data( 'cursorial_area_posts', data );
						renderAreaPosts.apply( area );
						callback.apply( area );
					}
				} );
			}

			function renderAreaPosts() {
				var posts = $( this ).data( 'cursorial_area_posts' );
			}

			return this.each( function() {
				// Try to extract the area name from class attribute with pattern "cursorial-area-NAME"
				var extractedName = $( this ).attr( 'class' ).match( /["\s]cursorial-area-([^"\s]+)/ );
				if ( extractedName ) {
					extractedName = extractedName[ 1 ];
				}

				options = $.extend( {
					name: extractedName
				}, options );

				$( this ).data( 'cursorial-name', options.name );

				getAreaPosts.apply( this, [ function() {
					$( this ).sortable( {
						revert: true
					} );
				}	] );
			} );
		};

		/**
		 * Executes a search
		 */
		function search() {
			var e = $( this ), val = e.val().replace( /\s+/g, ' ' ).replace( /^\s|\s$/, '' );
			if ( e.data( 'search-last' ) != val ) {
				e.data( 'search-last', val );
				e.parents( 'form' ).ajaxForm( {
					url: CURSORIAL_PLUGIN_URL + 'json.php',
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
					item.data( 'cursorial_post', data[ i ] );
					item.removeClass( 'template' );
					item.addClass( 'template-clone' );

					for ( var ii in data[ i ] ) {
						var element = item.find( '.template-data-' + ii );
						if ( element.length > 0 ) {
							element.text( data[ i ][ ii ] );
						}
					}

					target.append( item );
					item.draggable( {
						connectToSortable: '.cursorial-area',
						helper: 'clone',
						revert: 'invalid'
					} );
				}
			}
		}

		// Set events
		$( 'input#cursorial-search-field' ).keydown( searchByTimeout );

		// Setup cursorial areas
		$( '.cursorial-area' ).cursorialArea();
	} )( jQuery );
} );
