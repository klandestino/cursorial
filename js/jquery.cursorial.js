/**
 * Wrapp all js-functionality in the jQuery-document-ready-event with $ as an alias for jQuery
 */
( function( $ ) {
	/**
	 * Defines a node-element as a cursorial post and adds content to it.
	 * @param object options Options containing data and where to connect posts to
	 */
	$.fn.cursorialPost = function( options ) {
		options = $.extend( {
			data: {},
			blocks: ''
		}, options );

		/**
		 * Adds content to node element. If a child has a defined class with pattern "template-data-DATA_NAME",
		 * child element's text will be filled with matched data property.
		 * @return void
		 */
		function render() {
			$( this ).addClass( 'cursorial-post cursorial-post-' + options.data.ID );

			for ( var i in options.data ) {
				var element = $( this ).find( '.template-data-' + i );
				if ( element.length > 0 ) {
					element.text( options.data[ i ] );
				}
			}
		}

		function draggable() {
			$( this ).draggable( {
				connectToSortable: options.blocks,
				revert: 'invalid',
				helper: 'clone'
			} );
		}

		/**
		 * Loops through each matched elements
		 */
		return this.each( function() {
			render.apply( this );
			draggable.apply( this );
		} );
	};

	/**
	 * JQuery-plugin that takes care of blocks
	 * @param object options Plugin options
	 */
	$.fn.cursorialBlock = function( options ) {
		/**
		 * Fetches all posts connected to this block with a json-request
		 * and then stores then in the data-property.
		 * When post data is here, it will call the rendering-method.
		 * @param function callback Function that will be called when everything is done.
		 * @return void
		 */
		function getBlockPosts( callback ) {
			var block = this;
			$( this ).cursorialLoader( 'start' );
			$.ajax( {
				url: CURSORIAL_PLUGIN_URL + 'json.php',
				type: 'POST',
				data: {
					action: 'block',
					block: $( this ).data( 'cursorial-name' )
				},
				dataType: 'json',
				error: function( data ) {
					$( block ).cursorialLoader( 'stop' );
					callback.apply( block );
				},
				success: function( data ) {
					$( block ).cursorialLoader( 'stop' );
					$( block ).data( 'cursorial-posts', data );
					renderBlockPosts.apply( block );
					callback.apply( block );
				}
			} );
		}

		/**
		 * Renders post items from data-property with specified template in options
		 * @return void
		 */
		function renderBlockPosts() {
			var posts = $( this ).data( 'cursorial-posts' );
			var template = $( options.templates.post );
			$( this ).find( '.cursorial-post' ).remove();

			for ( var i in posts ) {
				var post = template.clone();
				post.cursorialPost( { data: posts[ i ], blocks: options.blocks } );
				$( this ).find( options.target ).append( post );
			}
		}

		/**
		 * Finds all post-elements with specified post ids in block element
		 * and creates a ajax-post to save the data.
		 * @return void
		 */
		function saveBlock() {
			var data = {
				action: 'save-block',
				posts: [],
				block: $( this ).data( 'cursorial-name' )
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

			var block = this;

			// Send data and start loader
			$( this ).cursorialLoader( 'start' );
			$.ajax( {
				url: CURSORIAL_PLUGIN_URL + 'json.php',
				type: 'POST',
				data: data,
				dataType: 'json',
				error: function( data ) {
					$( block ).cursorialLoader( 'stop' );
				},
				success: function( data ) {
					$( block ).cursorialLoader( 'stop' );
					$( block ).data( 'cursorial-posts', data );
					renderBlockPosts.apply( block );
				}
			} );
		}

		

		/**
		 * Loops through each matched element
		 */
		return this.each( function() {
			// Try to extract the block name from class attribute with pattern "cursorial-block-NAME"
			var extractedName = $( this ).attr( 'class' ).match( /["\s]cursorial-block-([^"\s]+)/ );
			if ( extractedName ) {
				extractedName = extractedName[ 1 ];
			}

			// Set default properties in options object
			options = $.extend( {
				name: extractedName,
				target: '',
				templates: {
					post: ''
				},
				buttons: {
					save: ''
				}
			}, options );

			// Save block name
			$( this ).data( 'cursorial-name', options.name );

			// Populate the block with posts from Wordpress and make it avaliable for new posts
			// with jQuery-ui and sortable.
			getBlockPosts.apply( $( this ).find( options.target ), [ function() {
				$( this ).sortable( {
					revert: true
				} );
			}	] );

			// Save block by click with the right scope
			$( this ).find( options.buttons.save ).unbind( 'click', $.proxy( saveBlock, this ) );
			$( this ).find( options.buttons.save ).bind( 'click', $.proxy( saveBlock, this ) );
		} );
	};

	/**
	 * Handles content searching
	 * @param object options Search options
	 */
	$.fn.cursorialSearch = function( options ) {

		// Set options default values
		options = $.extend( {
			timeout: 1000,
			templates: {
				post: ''
			},
			target: '',
			block: ''
		}, options );

		/**
		 * Executes a search
		 */
		function search() {
			var e = $( this ), val = e.val().replace( /\s+/g, ' ' ).replace( /^\s|\s$/, '' );
			if ( e.data( 'cursorial-search-last' ) != val ) {
				e.data( 'cursorial-search-last', val );
				$.ajax( {
					url: CURSORIAL_PLUGIN_URL + 'json.php',
					type: 'POST',
					data: {
						action: 'search',
						query: val
					},
					dataType: 'json',
					success: $.proxy( results, this )
				} );
				e.addClass( 'working' );
			}
		}

		/**
		 * Sets a timeout until next search
		 */
		function searchByTimeout() {
			var e = $( this );
			clearTimeout( e.data( 'cursorial-search-timeout' ) );
			var timeout = setTimeout( function() {
				search.apply( e );
			}, options.timeout );
			e.data( 'cursorial-search-timeout', timeout );
		}

		/**
		 * Renders the search result data in specified target with specified
		 * template.
		 */
		function results( data ) {
			var target = $( options.target );
			$( this ).removeClass( 'working' );

			if ( target.length > 0 ) {
				var template = $( options.templates.post );
				target.find( '.cursorial-post' ).remove();

				for ( var i in data ) {
					var post = template.clone();
					post.cursorialPost( { data: data[ i ], blocks: options.blocks } );
					target.append( post );
					post.show();
				}
			}
		}

		/**
		 * Loops through matched elements
		 */
		return $( this ).each( function() {
			// Set events
			$( 'input#cursorial-search-field' ).keydown( searchByTimeout );
		} );
	};

	/**
	 * Creates a ui-loader
	 * @param string action Either start or stop
	 */
	$.fn.cursorialLoader = function( action ) {
		/**
		 * Starts the ui-loader
		 * @return void
		 */
		function start() {
			var loader = $( '<div class="cursorial-block-loader"></div>' );
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
		 * Ends the ui-loader
		 * @return void
		 */
		function stop() {
			$( $( this ).data( 'cursorial-loader' ) ).fadeOut( 'fast', function() {
				$( this ).remove();
			} );
		}

		return $( this ).each( function() {
			switch( action ) {
				case 'start' :
					start.apply( this );
					break;
				case 'stop' :
					stop.apply( this );
					break;
			}
		} );
	};
} )( jQuery );
