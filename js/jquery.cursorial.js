/**
 * Wrapp all js-functionality in the jQuery-document-ready-event with $ as an alias for jQuery
 * @name anonymous
 * @function
 * @param {object} $ jQuery alias
 */
( function( $ ) {
	/**
	 * jQuery object's methods
	 * @name fn
	 * @memberOf $
	 * @see anonymous
	 * @namespace jQuery user methods container (plugins)
	 */
	/**
	 * Defines a node-element as a cursorial post and adds content to it.
	 * @function
	 * @name cursorialPost
	 * @memberOf $.fn
	 * @param {object|string} options Obtions can be an object or a string-specified action:
	 * options = {
	 *	data: { an object with data to render },
	 *	connectToBlocks: 'jQuery-selector to blocks',
	 *	buttons: { post_edit, post_save, post_remove },
	 *	create: callbackWhenPostIsCreated(),
	 *	applyBlockSettings: { an object with settings }
	 * }
	 * options = 'data', 'connectToBlocks', 'create', 'applyBlockSettings'
	 * @param {object|string} [args] Arguments used when options is a string.
	 */
	$.fn.cursorialPost = function( options, args ) {
		if ( typeof( args ) == 'undefined' ) {
			args = '';
		}

		// Redefine options to a object if it's a string
		if ( typeof( options ) != 'object' ) {
			var no = {};
			no[ options ] = args;
			options = no;
		}

		/**
		 * Adds content to node element. If a child has a defined class with pattern "template-data-DATA_NAME",
		 * child element's text will be filled with matched data property.
		 * @function
		 * @name render
		 * @param {object} data Data to render
		 * @return void
		 */
		function render( data ) {
			$( this ).data( 'cursorial-post-data', data );
			$( this ).attr( 'id', 'cursorial-post-' + data.ID );
			$( this ).addClass( 'cursorial-post cursorial-post-' + data.ID );

			for ( var i in data ) {
				var element = $( this ).find( '.template-data-' + i );
				if ( element.length > 0 ) {
					element.html( data[ i ] );
				}
			}
		}

		/**
		 * Makes post draggable
		 * @function
		 * @name setDraggable
		 * @param {string} blocks jQuery selector for blocks to connect to
		 * @return void
		 */
		function setDraggable( blocks ) {
			$( this ).data( 'cursorial-post-blocks', blocks );
			$( this ).draggable( {
				connectToSortable: blocks,
				revert: 'invalid',
				helper: 'clone',
				opacity: 0.75,
				drag: $.proxy( whileDragging, this ),
				stop: $.proxy( stopDragging, this )
			} );
		}

		/**
		 * Called when dragging is going on
		 * @function
		 * @name whileDragging
		 * @param {object} event The event
		 * @param {object} ui Some ui data from jquery-ui
		 * @return void
		 */
		function whileDragging( event, ui ) {
			if ( $( this ).parents( '.cursorial-block-active' ).length > 0 ) {
				$( this ).hide();
			} else {
				$( this ).fadeTo( 0, 0.5 );
			}
		}

		/**
		 * Called when dragging stopped
		 * @function
		 * @name stopDragging
		 * @param {object} event The event
		 * @param {object} ui Some ui data from jquery-ui
		 * @return void
		 */
		function stopDragging( event, ui ) {
			var orig = this;

			// This timeout is not necessary, it just makes it a bit nicer
			setTimeout( function() {
				// Fade out the original, delete it and replace with the one left over.
				$( orig ).fadeOut( 'fast', function() {
					var data = $( this ).data( 'cursorial-post-data' );
					var blocks = $( this ).data( 'cursorial-post-blocks' );
					var buttons = $( this ).data( 'cursorial-post-buttons' );
					$( this ).remove();
					$( '.cursorial-post-' + data.ID ).fadeTo( 'fast', 1, function() {
						$( this ).cursorialPost( {
							data: data,
							buttons: buttons,
							connectToBlocks: blocks
						} );
					} );
				} );
			}, 500 );
		}

		/**
		 * Find buttons and apply functionality to them
		 * @function
		 * @name setButtons
		 * @param {object} buttons The buttons selectors
		 * @return void
		 */
		function setButtons( buttons ) {
			$( this ).data( 'cursorial-post-buttons', buttons );

			for( var i in buttons ) {
				switch( i ) {
					case 'post_edit' :
						$( this ).find( buttons[ i ] ).click( $.proxy( edit, this ) );
						break;
					case 'post_save' :
						$( this ).find( buttons[ i ] ).click( $.proxy( save, this ) ).hide();
						break;
					case 'post_remove' :
						$( this ).find( buttons[ i ] ).click( $.proxy( remove, this ) );
						break;
				}
			}
		}

		/**
		 * Apply swetttings
		 * @function
		 * @name applyBlockSettings
		 * @param {object} settings
		 * @return void
		 */
		function applyBlockSettings( settings ) {
			$( this ).data( 'cursorial-post-settings', settings );
			var fields = [];

			for( var i in settings ) {
				fields.push( '.template-data-' + i + ', .template-data:has(.template-data-' + i + ')' );
			}

			$( this ).find( '.template-data:not(' + fields.join( ', ' ) + ')' ).fadeTo( 'fast', 0, function() {
				$( this ).hide();
			}	);
			$( this ).find( fields.join( ', ' ) ).fadeTo( 'fast', 1 );
		}

		/**
		 * Switch to edit-mode
		 * @function
		 * @name edit
		 * @return void
		 */
		function edit() {
			if ( ! $( this ).hasClass( 'cursorial-post-edit' ) ) {
				$( this ).addClass( 'cursorial-post-edit' );

				var buttons = $( this ).data( 'cursorial-post-buttons' );

				if ( typeof( buttons[ 'post_edit' ] ) != 'undefined' ) {
					$( this ).find( buttons.post_edit ).hide();
				}

				if ( typeof( buttons[ 'post_save' ] ) != 'undefined' ) {
					$( this ).find( buttons.post_save ).show();
				}

				var settings = $( this ).data( 'cursorial-post-settings' );

				for( var i in settings ) {
					if ( typeof( settings[ i ][ 'overridable' ] ) != 'undefined' ) {
						if ( settings[ i ].overridable && $( this ).find( '.template-data-' + i ).length > 0 ) {
							var element = $( this ).find( '.template-data-' + i );
							var field = null;

							switch( i ) {
								case 'post_excerpt' :
								case 'post_content' :
									field = $( '<textarea class="cursorial-field cursorial-field-' + i + ' widefat"></textarea>' );
									break;
								case 'image' :
									field = $( '<input class="cursorial-field cursorial-field-' + i + '" type="hidden"/>' );
									break;
								default :
									field = $( '<input class="cursorial-field cursorial-field-' + i + ' widefat" type="text"/>' );
							}

							field.val( element.html() );
							element.after( field ).hide();
						}
					}
				}

				$( this ).draggable( { disabled: true } );
			}
		}

		/**
		 * Switch back view-mode and store data
		 * @function
		 * @name save
		 * @return void
		 */
		function save() {
			$( this ).removeClass( 'cursorial-post-edit' );

			var buttons = $( this ).data( 'cursorial-post-buttons' );

			if ( typeof( buttons[ 'post_edit' ] ) != 'undefined' ) {
				$( this ).find( buttons.post_edit ).show();
			}

			if ( typeof( buttons[ 'post_save' ] ) != 'undefined' ) {
				$( this ).find( buttons.post_save ).hide();
			}

			var settings = $( this ).data( 'cursorial-post-settings' );
			var data = $( this ).data( 'cursorial-post-data' );

			for( var i in settings ) {
				var field = $( this ).find( '.cursorial-field-' + i );
				if ( field.length > 0 ) {
					data[ i ] = field.val();
					var element = $( this ).find( '.template-data-' + i );
					element.html( field.val() ).show();
					field.remove();
				}
			}

			$( this ).draggable( { disabled: false } );
		}

		/**
		 * Simply removes element from dom
		 * @function
		 * @name remove
		 * @return void
		 */
		function remove() {
			$( this ).fadeTo( 'fast', 0, function() {
				$( this ).remove();
			} );
		}

		/**
		 * Loops through each matched elements
		 */
		return this.each( function() {
			// If this post doesn't already exists
			// Remove it otherwise.
			if ( typeof( options[ 'data' ] ) != 'undefined' ) {
				if (
					$( '#cursorial-post-' + options.data.ID ).length > 0
					&& $( '#cursorial-post-' + options.data.ID ).get( 0 ) !== $( this ).get( 0 )
				) {
					return $( this ).remove();
				}
			}

			// These function needs to be run first
			for( var i in options ) {
				switch( i ) {
					case 'data' :
						render.apply( this, [ options[ i ] ] );
						break;
				}
			}

			// Then these functions
			for( var i in options ) {
				switch( i ) {
					case 'buttons' :
						setButtons.apply( this, [ options[ i ] ] );
						break;
					case 'connectToBlocks' :
						setDraggable.apply( this, [ options[ i ] ] );
						break;
					case 'applyBlockSettings' :
						applyBlockSettings.apply( this, [ options[ i ] ] );
						break;
					case 'save' :
						save.apply( this );
						break;
				}
			}

			// And then call the create callback
			if ( typeof( options[ 'data' ] ) != 'undefined' && typeof( options[ 'create' ] ) == 'function' ) {
				options.create.apply( this );
			}
		} );
	};

	/**
	 * JQuery-plugin that takes care of blocks
	 * @param object options Plugin options
	 */
	$.fn.cursorialBlock = function( options ) {
		// Set default properties in options object
		options = $.extend( {
			target: '',
			templates: {
				post: ''
			},
			buttons: {
				save: '',
				post_edit: '',
				post_save: '',
				post_remove: ''
			},
			show: {}
		}, options );

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
					setBlockSettings.apply( block, [ data.blocks ] );
					renderBlockPosts.apply( block, [ data.results ] );
					callback.apply( block );
				}
			} );
		}

		/**
		 * Renders post items from data-property with specified template in options
		 * @param array posts The posts to render
		 * @return void
		 */
		function renderBlockPosts( posts ) {
			var block = this;
			var template = $( options.templates.post );
			$( this ).find( '.cursorial-post' ).remove();

			for ( var i in posts ) {
				template.first().clone().cursorialPost( {
					data: posts[ i ],
					buttons: options.buttons,
					connectToBlocks: options.blocks,
					applyBlockSettings: getBlockSettings.apply( this, [ 'fields' ] ),
					create: function() {
						$( block ).find( options.target ).append( $( this ) );
						receivePost.apply( block, [ this ] );
					}
				}	);
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
				posts: {},
				block: $( this ).data( 'cursorial-name' )
			};

			// Extract post ids
			var posts = $( this ).find( '.cursorial-post' );
			posts.cursorialPost( 'save' );
			for ( var i = 0; i < posts.length; i++ ) {
				// data-property does not follow draggable items,
				// therefore we've stored the post id in a class name :(
				var id = $( posts[ i ] ).attr( 'id' ).match( /cursorial-post-([0-9]+)/ );
				if ( id ) {
					data.posts[ id[ 1 ] ] = {
						id: id[ 1 ]
					};

					var fields = $( posts[ i ] ).data( 'cursorial-post-data' );
					var settings = getBlockSettings.apply( this, [ 'fields' ] );
					for( var ii in settings ) {
						if ( typeof( fields[ ii ] ) != 'undefined' && settings[ ii ].overridable ) {
							data.posts[ id[ 1 ] ][ ii ] = fields[ ii ];
						}
					}
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
					setBlockSettings.apply( block, [ data.blocks ] );
					renderBlockPosts.apply( block, [ data.results ] );
				}
			} );
		}

		/**
		 * Setting this blocks settings from a settings-array fetched from server
		 * @param object settings Settings from server
		 * @return void
		 */
		function setBlockSettings( settings ) {
			if ( settings[ $( this ).data( 'cursorial-name' ) ] ) {
				settings = settings[ $( this ).data( 'cursorial-name' ) ];
			}

			if ( settings ) {
				$( this ).data( 'cursorial-settings', settings );
			}
		}

		/**
		 * Getting a setting
		 * @param string setting The setting to get
		 * @return mixed
		 */
		function getBlockSettings( setting ) {
			var settings = $( this ).data( 'cursorial-settings' );
			if ( settings ) {
				if ( settings[ setting ] ) {
					return settings[ setting ];
				}
				return null;
			}
		}

		/**
		 * Sets the block to active by giving it a css-class
		 * @return void
		 */
		function setActive() {
			$( this ).addClass( 'cursorial-block-active' );
		}

		/**
		 * Sets the block to inactive by removing a css-class
		 * @return void
		 */
		function setInActive() {
			$( this ).removeClass( 'cursorial-block-active' );
		}

		function receivePost( post ) {
			// Don't trust the post
			$( this ).find( '.cursorial-post' ).cursorialPost( {
				applyBlockSettings: getBlockSettings.apply( this, [ 'fields' ] ),
				buttons: options.buttons
			} );
		}

		/**
		 * Loops through each matched element
		 */
		return this.each( function() {
			// If cursorial block aldready been initiated.
			// It can be repoulated with options
			if ( $( this ).data( 'cursorial-name' ) && $( this ).data( 'cursorial-options' ) ) {
				$( this ).data( 'cursorial-options', $.extend( $( this ).data( 'cursorial-options' ), options ) );
			} else {
				// Try to extract the block name from class attribute with pattern "cursorial-block-NAME"
				var extractedName = $( this ).attr( 'id' ).match( /cursorial-block-([^$]+)/ );
				if ( extractedName ) {
					extractedName = extractedName[ 1 ];
				}

				// Save block name
				$( this ).data( 'cursorial-name', extractedName );

				// Save cursorial options
				$( this ).data( 'cursorial-options', options );

				// Populate the block with posts from Wordpress and make it avaliable for new posts
				// with jQuery-ui and sortable.
				getBlockPosts.apply( $( this ), [ function() {
					$( this ).find( options.target ).sortable( {
						over: $.proxy( setActive, this ),
						out: $.proxy( setInActive, this ),
						receive: $.proxy( function( event, ui ) {
							receivePost.apply( this, [ ui.item ] );
						}, this ),
						revert: true
					} );
				}	] );

				// Save block by click with the right scope
				$( this ).find( options.buttons.save ).unbind( 'click', $.proxy( saveBlock, this ) );
				$( this ).find( options.buttons.save ).bind( 'click', $.proxy( saveBlock, this ) );
			}
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

				for ( var i in data.results ) {
					template.first().clone().cursorialPost( {
						data: data.results[ i ],
						buttons: options.buttons,
						connectToBlocks: options.blocks,
						create: function() {
							target.append( $( this ) );
							$( this ).show();
						}
					}	);
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

		/**
		 * Loop and execute
		 */
		return this.each( function() {
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
