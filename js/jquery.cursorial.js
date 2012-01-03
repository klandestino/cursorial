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
					// Images comes with an id in data[ 'image' ] and an url in data[ 'cursorial_image' ]
					// data[ 'cursorial_image' ] == wp_get_attachment_image_src
					// data[ 'cursorial_image' ][ 0 ] == url
					// data[ 'cursorial_image' ][ 1 ] == width
					// data[ 'cursorial_image' ][ 2 ] == height
					if ( i == 'image' && typeof( data[ 'cursorial_image' ] ) != 'undefined' ) {
						if ( typeof( data.cursorial_image[ 0 ] ) != 'undefined' ) {
							element.html( '<img src="' + data.cursorial_image[ 0 ] + '" class="cursorial-thumbnail"/>' );
						}
					} else if ( typeof( data[ i ] ) == 'string' ) {
						element.html( data[ i ] ).cursorialHideLongContent();
					}
				}
			}

			if ( typeof( data[ 'cursorial_depth' ] ) != 'undefined' ) {
				if ( data.cursorial_depth > 0 ) {
					setChildStatus.apply( this, [ true ] );
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
				distance: 30,
				delay: 200,
				start: $.proxy( startDragging, this ),
				drag: $.proxy( whileDragging, this ),
				stop: $.proxy( stopDragging, this )
			} );
		}

		/**
		 * Called when dragging started
		 * @function
		 * @name startDragging
		 * @param {object} event The event
		 * @param {object} ui Some ui data from jquery-ui
		 * @returns {void}
		 */
		function startDragging( event, ui ) {
			$( ui.helper ).addClass( 'cursorial-post-dragging-helper' );
			$( ui.helper ).width( $( this ).width() );
			$( this ).fadeTo( 'fast', 0.5 );

			if ( getChildStatus.apply( this ) ) {
				// This is how we know that it is a child been dragged.
				// When dragging stops, we'll not move any child siblings.
				$( this ).data( 'cursorial-post-dragging-child', true );
			} else {
				getChilds.apply( this ).hide( 'fast' );
			}
		}

		/**
		 * Called when dragging is going on
		 * It sets the placeholder visible and tells if this post will be a child or not
		 * @function
		 * @name whileDragging
		 * @param {object} event The event
		 * @param {object} ui Some ui data from jquery-ui
		 * @return void
		 */
		function whileDragging( event, ui ) {
			var placeholder = $( '.cursorial-post.ui-sortable-placeholder' );
			if ( placeholder.length > 0 ) {
				placeholder.css( { visibility: 'visible' } );

				placeholder.removeClass( 'cursorial-child-depth-1' );
				setChildStatus.apply( this, [ false ] );

				var prev = getParent.apply( placeholder );
				if ( prev.length > 0 && childsAllowed.apply( prev ) ) {
					if ( $( ui.helper ).offset().left - prev.offset().left > prev.width() / 3 ) {
						placeholder.addClass( 'cursorial-child-depth-1' );
						setChildStatus.apply( this, [ true ] );
					}
				}
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
			var childs = $( this ).data( 'cursorial-post-dragging-child' ) ? [] : getChilds.apply( this );
			$( this ).data( 'cursorial-post-dragging-child', false );
			$( ui.helper ).removeClass( 'cursorial-post-dragging-helper' );

			// This timeout is not necessary, it just makes it a bit nicer
			setTimeout( function() {
				var data = $( orig ).data( 'cursorial-post-data' );
				// If there's two posts with the same id, then one is a helper, and the
				// other one the original. Remove original and make the helper to a post.
				if ( $( '.cursorial-post-' + data.ID ).length > 1 ) {
					// Fade out the original, delete it and replace with the one left over.
					$( orig ).fadeOut( 'fast', function() {
						var blocks = $( this ).data( 'cursorial-post-blocks' );
						var buttons = $( this ).data( 'cursorial-post-buttons' );
						var childStatus = getChildStatus.apply( this );
						$( this ).remove();
						$( '.cursorial-post-' + data.ID ).fadeTo( 'fast', 1, function() {
							var settings = $( this ).data( 'cursorial-post-settings' );
							$( this ).cursorialPost( {
								data: data,
								buttons: buttons,
								connectToBlocks: blocks,
								childStatus: childStatus,
								applyBlockSettings: settings
							} );

							if ( childs.length > 0 && ! getChildStatus.apply( this ) && childsAllowed.apply( this ) ) {
								childs.insertAfter( $( this ) ).show( 'fast' );
							} else if ( childs.length > 0 ) {
								childs.remove();
							}
						} );
					} );
				} else {
					$( orig ).fadeTo( 'fast', 1 );
				}
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
			var fieldSettings = getFieldSettings.apply( this );

			for( var i in fieldSettings ) {
				fields.push( '.template-data-' + i + ', .template-data:has(.template-data-' + i + ')' );
			}

			$( this ).find( '.template-data:not(' + fields.join( ', ' ) + ')' ).fadeTo( 'fast', 0, function() {
				$( this ).hide();
				$( this ).cursorialHideLongContent( 'show', { link: false } );
			} );

			$( this ).find( fields.join( ', ' ) ).fadeTo( 'fast', 1 );
		}

		/**
		 * Switch to edit-mode
		 * @function
		 * @name edit
		 * @returns {void}
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
				var fieldSettings = getFieldSettings.apply( this );	

				for( var i in fieldSettings ) {
					if ( typeof( fieldSettings[ i ][ 'overridable' ] ) != 'undefined' ) {
						if ( fieldSettings[ i ].overridable && $( this ).find( '.template-data-' + i ).length > 0 ) {
							var element = $( this ).find( '.template-data-' + i );
							var field = null;

							switch( i ) {
								case 'post_excerpt' :
								case 'post_content' :
									field = $( '<textarea class="cursorial-field cursorial-field-' + i + ' widefat"></textarea>' );
									field.height( element.height() > 100 ? element.height() : 100 );
									break;
								case 'image' :
									var postId = $( this ).data( 'cursorial-post-data' ).cursorial_ID;
									var imageId = $( this ).data( 'cursorial-post-data' ).image;
									field = $(
										'<input class="cursorial-field cursorial-field-' + i + '" type="hidden" value="' + imageId + '"/>' +
										'<a class="cursorial-field thickbox" href="media-upload.php?post_id=' + postId + '&amp;type=image&amp;TB_iframe=1" title="' + cursorial_i18n( 'Set featured image' ) + '">' + cursorial_i18n( 'Set featured image' ) + '</a>'
									);
									break;
								default :
									field = $( '<input class="cursorial-field cursorial-field-' + i + ' widefat" type="text"/>' );
							}

							if ( i != 'image' ) {
								field.val( element.html() );
							}

							element.cursorialHideLongContent( 'show', {
								delay: 0,
								link: false
							}, function() {
									element.after( field ).hide();
							} );
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

			if ( buttons ) {
				if ( typeof( buttons[ 'post_edit' ] ) != 'undefined' ) {
					$( this ).find( buttons.post_edit ).show();
				}

				if ( typeof( buttons[ 'post_save' ] ) != 'undefined' ) {
					$( this ).find( buttons.post_save ).hide();
				}
			}

			var settings = $( this ).data( 'cursorial-post-settings' );
			var data = $( this ).data( 'cursorial-post-data' );

			var fieldSettings = getFieldSettings.apply( this );

			for( var i in fieldSettings ) {
				var field = $( this ).find( '.cursorial-field-' + i );
				if ( field.length > 0 ) {
					data[ i ] = field.val();
					$( this ).find( '.template-data-' + i ).show();
					field.remove();
				}
			}

			$( this ).find( '.cursorial-field' ).remove();
			render.apply( this, [ data ] );
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
		 * Returns the current fields settings based childs status
		 * @function
		 * @name getFieldSettings
		 * @returns {array}
		 */
		function getFieldSettings() {
			var settings = $( this ).data( 'cursorial-post-settings' );
			var fieldSettings = [];

			if ( typeof( settings ) != 'undefined' ) {
				fieldSettings = settings.fields;
			}

			if ( getChildStatus.apply( this ) && typeof( settings[ 'childs' ] ) != 'undefined' ) {
				if ( typeof( settings.childs[ 'fields' ] != 'undefined' ) ) {
					fieldSettings = settings.childs.fields;
				}
			}

			return fieldSettings;
		}

		/**
		 * Tells if cursorial posts can have childs
		 * @function
		 * @name childsAllowed
		 * @returns {boolean}
		 */
		function childsAllowed() {
			var settings = $( this ).data( 'cursorial-post-settings' );

			if ( settings ) {
				if ( typeof( settings[ 'childs' ] ) != 'undefined' ) {
					if ( typeof( settings.childs[ 'max' ] ) != 'undefined' ) {
						if ( settings.childs.max <= getChilds.apply( this ).length ) {
							return false;
						}
					}

					return true;
				}
			}

			return false;
		}

		/**
		 * Gets the child status of the cursorial post
		 * @function
		 * @name getChildStatus
		 * @returns {boolean}
		 */
		function getChildStatus() {
			return ( $( this ).data( 'cursorial-child-status' ) === true );
		}

		/**
		 * Sets the child status of the cursorial post
		 * @function
		 * @name setChildStatus
		 * @param {boolean} status
		 * @returns {void}
		 */
		function setChildStatus( status ) {
			$( this ).data( 'cursorial-child-status', status );
			var data = $( this ).data( 'cursorial-post-data' );

			if ( typeof( data[ 'cursorial_depth' ] ) != 'undefined' ) {
				data.cursorial_depth = status === true ? 1 : 0;
			}

			if ( status ) {
				if ( ! $( this ).hasClass( 'cursorial-child-depth-1' ) ) {
					$( this ).addClass( 'cursorial-child-depth-1' );
				}
			} else {
				$( this ).removeClass( 'cursorial-child-depth-1' );
			}
		}

		/**
		 * Returns a cursorial post parent if there is one
		 * @function
		 * @name getParent
		 * @returns {object}
		 */
		function getParent() {
			return $( this ).prevAll( '.cursorial-post:not(.cursorial-child-depth-1):first' );
		}

		/**
		 * Returns cursorial post childs if there are any
		 * @function
		 * @name getChilds
		 * @returns {object}
		 */
		function getChilds() {
			return $( this ).nextUntil( '.cursorial-post:not(.cursorial-child-depth-1, .ui-sortable-placeholder)', '.cursorial-post.cursorial-child-depth-1' );
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
					case 'childStatus' :
						setChildStatus.apply( this, [ options[ i ] ] );
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
			show: {},
			blocks: ''
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
					applyBlockSettings: getBlockSettings.apply( this ),
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
						id: id[ 1 ],
						depth: $( posts[ i ] ).data( 'cursorial-child-status' ) === true ? 1 : 0
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
				if ( setting == null ) {
					return settings;
				} else if ( settings[ setting ] ) {
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
				applyBlockSettings: getBlockSettings.apply( this ),
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
			blocks: ''
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

	/**
	 * If content is too long, this plugin will wrap content in a element with overflow hidden
	 * and then create a show-link.
	 * @function
	 * @name cursorialHideLongContent
	 * @param {string} action Can be 'show' or the default 'hide'
	 * @param {object|string|number} options Can be all arguments as an object or the delay argument
	 * @param {function} callback Called then show/hide been done
	 * @returns {object} Affected jQuery-elements
	 */
	$.fn.cursorialHideLongContent = function( action, options, callback ) {
			if ( typeof( options ) != 'object' ) {
				options = {
					delay: options
				};
			}

			options = $.extend( {
				delay: 'fast',
				link: true,
				height: 150,
				width: 200
			}, options );

		/**
		 * Gets the height of the element. If height is 0, it will create a clone, append it to body
		 * and then do another try of getting the height out of it.
		 * @function
		 * @name height
		 * @returns {int} The height of the element
		 */
		function height() {
			var height = $( this ).height();

			if ( height <= 0 ) {
				var clone = $( this ).clone().css( {
					position: 'absolute',
					left: -1000,
					top: -1000,
					width: options.width
				} );
				clone.appendTo( 'body' );
				height = clone.height();
				clone.remove();
			}

			return height;
		}

		/**
		 * Creates a show/hide link
		 * @function
		 * @name link
		 * @param {object} sib The sibling to append the link after
		 * @param {string} text The text to use in the link
		 * @param {function} click The click-callback
		 * @returns {void}
		 */
		function link( sib, text, click ) {
			var link = $( '<a href="javascript://" class="cursorial-hide-long-content-link">' + cursorial_i18n( text ) + '</a>' );
			sib.after( link );
			link.click( $.proxy( click, this ) );
			$( this ).data( 'cursorial-hide-long-content-link', link );
		}

		function removeLink() {
			var currentLink = $( this ).data( 'cursorial-hide-long-content-link' );
			if ( currentLink ) {
				currentLink.remove();
			} else {
				$( this ).next( 'a.cursorial-hide-long-content-link' ).remove();
				$( this ).parent( '.cursorial-hide-long-content-wrapper' ).next( 'a.cursorial-hide-long-content-link' ).remove();
			}
		}

		/**
		 * Shows the content by removing the wrapper
		 * @function
		 * @name show
		 * @param {int|string} delay For how long the show will occur
		 * @param {function} callback Called when the content has been shown
		 * @param {boolean} showLink If the hide link will be shown
		 * @returns {void}
		 */
		function show( delay, callback, showLink ) {
			removeLink.apply( this );

			if ( typeof( delay ) != 'string' && typeof( delay ) != 'number' ) {
				delay = 'fast';
			}

			if ( $( this ).parent( '.cursorial-hide-long-content-wrapper' ).length > 0 ) {
				var content = $( this );
				content.parent().animate( {
					height: content.height()
				}, delay, function() {
					$( this ).replaceWith( content );
					if ( showLink !== false && height.apply( content ) > options.height ) {
						link.apply( content, [ content, 'Hide content', hide ] );
					}
					if ( typeof( callback ) == 'function' ) {
						callback.apply( content );
					}
				} );
			} else if ( typeof( callback ) == 'function' ) {
				callback.apply( content );
			}
		}

		/**
		 * Hides the content if it's too high with a wrapper with overflow hidden
		 * @function
		 * @name hide
		 * @param {int|string} delay For how long the hide will occur
		 * @param {function} callback Called when content is hidden
		 * @param {boolean} showLink If the show link will be shown
		 * @returns {void}
		 */
		function hide( delay, callback, showLink ) {
			removeLink.apply( this );

			if ( typeof( delay ) != 'string' && typeof( delay ) != 'number' ) {
				delay = 'fast';
			}

			if ( $( this ).parent( '.cursorial-hide-long-content-wrapper' ).length == 0 && height.apply( this ) > options.height ) {
				var content = $( this );
				var wrapper = $( '<div class="cursorial-hide-long-content-wrapper"></div>' );

				// I suppose there's a height if content-element is nested inside an element appended to
				// the body. Otherwise there's no need for an animation.
				if ( content.height() > 0 ) {
					wrapper.css( {
						overflow: 'hidden',
						height: content.height()
					} );

					content.wrap( wrapper );
					wrapper = content.parent();

					wrapper.animate( {
						height: options.height
					}, delay, function() {
						if ( showLink !== false ) {
							link.apply( content, [ wrapper, 'Show content', show ] );
						}

						if ( typeof( callback ) == 'function' ) {
							callback.apply( content );
						}
					} );

					return;
				} else {
					wrapper.css( {
						overflow: 'hidden',
						height: options.height
					} );

					content.wrap( wrapper );

					if ( showLink !== false ) {
						link.apply( content, [ content.parent(), 'Show content', show ] );
					}
				}
			} else if ( $( this ).parent( '.cursorial-hide-long-content-wrapper' ).length > 0 && ! $( this ).data( 'cursorial-hide-long-content-link' ) ) {
				if ( showLink !== false ) {
					link.apply( this, [ $( this ).parent(), 'Show content', show ] );
				}
			}

			if ( typeof( callback ) == 'function' ) {
				callback.apply( content );
			}
		}

		return this.each( function() {
			if ( action == 'show' ) {
				show.apply( this, [ options.delay, callback, options.link ] );
			} else {
				hide.apply( this, [ options.delay, callback, options.link ] );
			}
		} );
	}
} )( jQuery );

/**
 * These lines of code creates a callback from the "Set featured image"-functionality that is
 * built into Wordpress. The callback is only created if it's not found so if won't brake some
 * other wordpress-functions.
 */

if ( typeof( WPSetThumbnailID ) == 'undefined' ) {
	/**
	 * Image-picker-popup calls this function when an image is chosen.
	 * This callback sets the post image field value to the chosen id.
	 * @function
	 * @name WPSetThumbnailID
	 * @param {int|string} c The attachment id
	 * @param {?} b I don't know
	 * @return {void}
	 */
	WPSetThumbnailID = function( c, b ) {
		jQuery( '.cursorial-post-edit .cursorial-field-image' ).val( c );
	}
}

if ( typeof( WPSetThumbnailHTML ) == 'undefined' ) {
	/**
	 * Image-picker-popup calls this function when an image is chosen.
	 * This function sets the image HTML with the chosen image.
	 * @function
	 * @name
	 * @param {object} e The DOM-element where the image is places
	 * @return {void}
	 */
	WPSetThumbnailHTML = function( e ) {
		var image = jQuery( e ).find( 'img' );
		if ( image.length > 0 ) {
			var thumb = jQuery( '.cursorial-post-edit .cursorial-thumbnail' );

			if ( thumb.length <= 0 ) {
				thumb = jQuery( '<img class="cursorial-thumbnail"/>' );
				thumb.appendTo( '.cursorial-post-edit .template-data-image' );
			}

			thumb.attr( 'src', image.attr( 'src' ) );
			//jQuery( '.cursorial-post-edit' ).cursorialPost( 'save' );
		}
	}
}
