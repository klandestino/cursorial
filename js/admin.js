/**
 * Wrapp all js-functionality in the jQuery-document-ready-event with $ as an alias for jQuery
 */
jQuery( function() {
	( function( $ ) {
		$.fn.cursorialPost = function( data ) {

			function render() {
				$( this ).addClass( 'cursorial-post cursorial-post-' + data.ID );

				for ( var i in data ) {
					var element = $( this ).find( '.template-data-' + i );
					if ( element.length > 0 ) {
						element.text( data[ i ] );
					}
				}
			}

			return this.each( function() {
				render.apply( this );
			} );
		};

		/**
		 * JQuery-plugin that takes care of areas
		 * @param object options Plugin options
		 */
		$.fn.cursorialArea = function( options ) {
			/**
			 * Fetches all posts connected to this area with a json-request
			 * and then stores then in the data-property.
			 * When post data is here, it will call the rendering-method.
			 * @param function callback Function that will be called when everything is done.
			 * @return void
			 */
			function getAreaPosts( callback ) {
				var area = this;
				startLoader.apply( this );
				$.ajax( {
					url: CURSORIAL_PLUGIN_URL + 'json.php',
					type: 'POST',
					data: {
						action: 'posts',
						area: $( this ).data( 'cursorial-name' )
					},
					dataType: 'json',
					error: function( data ) {
						stopLoader.apply( area, [ data ] );
						callback.apply( area );
					},
					success: function( data ) {
						stopLoader.apply( area, [ data ] );
						$( area ).data( 'cursorial-posts', data );
						renderAreaPosts.apply( area );
						callback.apply( area );
					}
				} );
			}

			/**
			 * Renders post items from data-property with specified template in options
			 * @return void
			 */
			function renderAreaPosts() {
				var posts = $( this ).data( 'cursorial-posts' );
				var template = $( options.templates.post );
				$( this ).find( 'cursorial-post' ).remove();

				for ( var i in posts ) {
					var post = template.clone();
					post.cursorialPost( posts[ i ] );
					$( this ).append( post );
				}
			}

			/**
			 * Finds all post-elements with specified post ids in area element
			 * and creates a ajax-post to save the data.
			 * @return void
			 */
			function saveArea() {
				var data = {
					action: 'save-area',
					posts: [],
					area: $( this ).data( 'cursorial-name' )
				};

				// Extract post ids
				var posts = $( this ).find( '.cursorial-post' );
				for ( var i = 0; i < posts.length; i++ ) {
					// data-property does not follow draggable items,
					// therefore we've stored the post id in a class name :(
					var id = $( posts[ i ] ).attr( 'class' ).match( /(?:^|\s)cursorial-post-([0-9]+)/ );
					if ( id ) {
						data.posts.push( id[ 1 ] );
					}
				}

				// Send data and start loader
				startLoader.apply( this );
				$.ajax( {
					url: CURSORIAL_PLUGIN_URL + 'json.php',
					type: 'POST',
					data: data,
					dataType: 'json',
					error: $.proxy( stopLoader, this ),
					success: $.proxy( stopLoader, this )
				} );
			}

			/**
			 * Starts the ui-loader
			 * @return void
			 */
			function startLoader() {
				var loader = $( '<div class="cursorial-area-loader"></div>' );
				$( this ).data( 'cursorial-loader', loader );
				loader.css( {
					left: $( this ).offset().left,
					top: $( this ).offset().top,
					width: $( this ).width(),
					height: $( this ).height()
				} );
				loader.appendTo( 'body' ).fadeOut().fadeTo( 'fast', 0.75 );
			}

			/**
			 * Ends the ui-loader and displays an error message if there is one
			 * @param object data Returned data from request
			 * @return void
			 */
			function stopLoader( data ) {
				if ( data.statusText == 'error' ) {
					alert( 'Error: ' + data.responseText );
				}

				$( $( this ).data( 'cursorial-loader' ) ).fadeOut( 'fast', function() {
					$( this ).remove();
				} );
			}

			/**
			 * Loops through each matched element
			 */
			return this.each( function() {
				// Try to extract the area name from class attribute with pattern "cursorial-area-NAME"
				var extractedName = $( this ).attr( 'class' ).match( /["\s]cursorial-area-([^"\s]+)/ );
				if ( extractedName ) {
					extractedName = extractedName[ 1 ];
				}

				// Set default properties in options object
				options = $.extend( {
					name: extractedName,
					templates: {
						posts: ''
					},
					buttons: {
						save: ''
					}
				}, options );

				// Save area name
				$( this ).data( 'cursorial-name', options.name );

				// Populate the area with posts from Wordpress and make it avaliable for new posts
				// with jQuery-ui and sortable.
				getAreaPosts.apply( this, [ function() {
					$( this ).sortable( {
						revert: true
					} );
				}	] );

				// Save area by click with the right scope
				$( options.buttons.save ).unbind( 'click', $.proxy( saveArea, this ) );
				$( options.buttons.save ).bind( 'click', $.proxy( saveArea, this ) );
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
				target.find( '.cursorial-post' ).remove();
				var template = target.find( '.template' );

				for ( var i in data ) {
					var item = template.clone();
					item.removeClass( 'template' );
					item.addClass( 'cursorial-post cursorial-post-' + data[ i ].ID );

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
		$( '.cursorial-area' ).cursorialArea( {
			templates: {
				post: '#cursorial-search-result .template'
			},
			buttons: {
				save: 'input.cursorial-area-save'
			}
		} );
	} )( jQuery );
} );
