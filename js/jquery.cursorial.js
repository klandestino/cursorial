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
	 *	applyBlockSettings: { an object with settings },
	 *	save: no arguments,
	 *	childStatus: boolean,
	 *	remove: no arguments
	 * }
	 * options = 'data', 'connectToBlocks', 'create', 'applyBlockSettings', 'save', 'childStatus', 'remove'
	 * @param {object|string} [args] Args is used when options is a string.
	 * @returns {object}
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
		 * child element's html text will be filled with matched data property.
		 * @function
		 * @name render
		 * @param {object} data Data to render
		 * @returns {void}
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
						// Add html-data and hide too long contents
						element.html( data[ i ] ).cursorialHideLongContent();
					}

					// If this field is set to be hidden
					// It's saved as post meta and then fetched as field-name_hidden
					if ( typeof( data[ i + '_hidden' ] ) != 'undefined' ) {
						if ( ! element.hasClass( 'cursorial-hidden' ) ) {
							element.addClass( 'cursorial-hidden' );
						}
					} else {
						element.removeClass( 'cursorial-hidden' );
					}
				}
			}

			// cursorial_depth tells us if it's a child or not
			if ( typeof( data[ 'cursorial_depth' ] ) != 'undefined' ) {
				if ( data.cursorial_depth > 0 ) {
					setChildStatus.apply( this, [ true ] );
				}
			}
		}

		/**
		 * Makes post draggable, almost. Blocks are make posts draggable through sorting.
		 * This function adds a couple of listeners.
		 * @function
		 * @name setDraggable
		 * @param {string} blocks jQuery selector for blocks to connect to
		 * @returns {void}
		 */
		function setDraggable( blocks ) {
			$( this ).data( 'cursorial-post-blocks', blocks );
			$( this ).unbind( 'sortstart', $.proxy( startDragging, this ) );
			$( this ).bind( 'sortstart', $.proxy( startDragging, this ) );
			$( this ).unbind( 'sortstop', $.proxy( stopDragging, this ) );
			$( this ).bind( 'sortstop', $.proxy( stopDragging, this ) );
		}

		/**
		 * Used as a listener and called when dragging started
		 * It also adds a mouse movement listener to track it's position
		 * @function
		 * @name startDragging
		 * @param {object} event The event
		 * @param {object} ui Some ui data from jquery-ui
		 * @returns {void}
		 */
		function startDragging( event, ui ) {
			$( this ).fadeTo( 'fast', 0.5 );
			$( document ).mousemove( $.proxy( whileDragging, this ) );

			if ( getChildStatus.apply( this ) ) {
				// This is a child post. Save child status as it may change during dragging.
				// When dragging stops, we'll not move any child siblings.
				$( this ).data( 'cursorial-post-dragging-child-status', true );
			} else {
				// This is not a child. Try to hide all childs that belongs to this post.
				$( this ).data( 'cursorial-post-dragging-childs', getChilds.apply( this ).hide( 'fast' ) );
			}
		}

		/**
		 * Used as a listener and called when dragging is going on.
		 * It sets the placeholder visible and tells if this post will be a child or not
		 * @function
		 * @name whileDragging
		 * @returns {void}
		 */
		function whileDragging() {
			var placeholder = $( '.cursorial-post.ui-sortable-placeholder' );
			var settings = $( this ).data( 'cursorial-post-settings' );

			if ( placeholder.length > 0 ) {
				placeholder.css( { visibility: 'visible' } );

				placeholder.removeClass( 'cursorial-child-depth-1' );
				setChildStatus.apply( this, [ false ] );

				var prev = getParent.apply( placeholder );
				if ( prev.length > 0 && childsAllowed.apply( prev ) ) {
					if ( $( this ).offset().left - prev.offset().left > prev.width() / 3 ) {
						placeholder.addClass( 'cursorial-child-depth-1' );
						setChildStatus.apply( this, [ true ] );
					}
				}
			}
		}

		/**
		 * Used as a listener and called when dragging stops.
		 * It removes the mouse move listener and places the post where it was dropped.
		 * @function
		 * @name stopDragging
		 * @param {object} event The event
		 * @param {object} ui Some ui data from jquery-ui
		 * @returns {void}
		 */
		function stopDragging( event, ui ) {
			$( document ).unbind( 'mousemove', $.proxy( whileDragging, this ) );
			var orig = this;
			var data = $( this ).data( 'cursorial-post-data' );
			var childs = $( this ).data( 'cursorial-post-dragging-childs' );

			// If this post has been rejected and if was a child before dragging
			// started, it'll go back as a child.
			if ( $( this ).data( 'cursorial-post-dragging-child-status' ) && $( this ).hasClass( 'cursorial-post-rejected' ) ) {
				setChildStatus.apply( this, [ true ] );
			}

			$( this ).data( 'cursorial-post-dragging-child-status', false );

			// We'll use this timeout for two reasons: user experience gets a bit
			// better and we'll have enough time to wait for all the jquery-ui-stuff
			// to get done.
			setTimeout( function() {
				$( orig ).fadeTo( 'fast', 1 );
				if ( childs ) {
					if ( childsAllowed.apply( orig ) ) {
						childs.insertAfter( orig ).show( 'fast' );
					} else {
						childs.remove();
					}
				}
				$( this ).data( 'cursorial-post-dragging-childs', null );
			}, 500 );
		}

		/**
		 * Find buttons and apply functionality to them
		 * @function
		 * @name setButtons
		 * @param {object} buttons The buttons selectors
		 * @returns {void}
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
		 * Applies the block settings. It shows fields that are set to be shown and hides
		 * the rest.
		 * @function
		 * @name applyBlockSettings
		 * @param {object} settings
		 * @returns {void}
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
				// If set to hide, we need to remove all wrappers and stuff when they're not needed
				$( this ).cursorialHideLongContent( 'show', { link: false } );
			} );

			$( this ).find( fields.join( ', ' ) ).fadeTo( 'fast', 1, function() {
				$( this ).cursorialHideLongContent();
			} );
		}

		/**
		 * Switch to edit-mode by hiding content and insert some form fields
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

				var data = $( this ).data( 'cursorial-post-data' );
				var settings = $( this ).data( 'cursorial-post-settings' );
				var fieldSettings = getFieldSettings.apply( this );	

				for( var i in fieldSettings ) {
					var element = $( this ).find( '.template-data-' + i );

					if ( element.length > 0 ) {
						var fieldset = $( '<fieldset class="cursorial-fieldset cursorial-fieldset-' + i + '"></fieldset>' );
						fieldset.append( '<legend class="cursorial-fieldtitle cursorial-fieldtitle-' + i + '">' + cursorial_i18n( i.replace( '_', ' ' ) ) + '</legend>' );

						// If the option "optional" is set, this field requires a show/hide option
						if ( typeof( fieldSettings[ i ][ 'optional' ] ) != 'undefined' ) {
							if ( fieldSettings[ i ].optional ) {
								fieldset.append( '<div class="cursorial-hiddenoption cursorial-hiddenoption-' + i + '">' +
									'<label for="' + $( this ).attr( 'id' ) + '-hiddenoption-' + i + '">' + cursorial_i18n( 'Visible:' ) + '</label>' +
									'<input id="' + $( this ).attr( 'id' ) + '-hiddenoption-' + i + '" type="checkbox" value="true"' + ( typeof( data[ i + '_hidden' ] ) != 'undefined' ? '' : ' checked="checked"' ) + '/>' +
								'</div>' );
							}
						}

						if ( typeof( fieldSettings[ i ][ 'overridable' ] ) != 'undefined' ) {
							if ( fieldSettings[ i ].overridable ) {
								var field = null;

								switch( i ) {
									case 'post_excerpt' :
									case 'post_content' :
										field = $( '<textarea class="cursorial-field cursorial-field-' + i + ' widefat"></textarea>' );
										field.height( element.height() > 100 ? element.height() : 100 );
										break;
									case 'image' :
										var postId = $( this ).data( 'cursorial-post-data' ).cursorial_ID;
										if ( postId ) {
											var imageId = $( this ).data( 'cursorial-post-data' ).image;
											field = $(
												'<input class="cursorial-field cursorial-field-' + i + '" type="hidden" value="' + imageId + '"/>' +
												'<a class="cursorial-field cursorial-image-link thickbox" href="media-upload.php?post_id=' + postId + '&amp;type=image&amp;TB_iframe=1width=640&height=546" title="' + cursorial_i18n( 'Set featured image' ) + '">' + cursorial_i18n( 'Set featured image' ) + '</a>'
											);
										} else {
											field = $( '<p class="cursorial-field description">' + cursorial_i18n( 'You need to save this block before you can change image.' ) + '</p>' );
										}
										break;
									default :
										field = $( '<input class="cursorial-field cursorial-field-' + i + ' widefat" type="text"/>' );
								}

								if ( i != 'image' ) {
									field.val( element.html() );
								}

								fieldset.append( field );

								element.cursorialHideLongContent( 'show', {
									delay: 0,
									link: false
								}, function() {
										element.after( fieldset ).hide();
										// This determines what image field is about to change.
										// The class is removed by WPSetThumbnailHTML() witch is a Wordpress callback called when a image selection has been done.
										element.parent().find( 'a.cursorial-image-link' ).click( function() {
											$( this ).addClass( 'cursorial-image-link-current' );
										} );
								} );
							}
						}
					}
				}

				$( this ).parent().sortable( 'disable' );
			}
		}

		/**
		 * Switch back view-mode and store data
		 * @function
		 * @name save
		 * @returns {void}
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
				var hidden = $( this ).find( '.cursorial-hiddenoption-' + i );
				if ( hidden.length > 0 ) {
					if ( hidden.find( 'input:not(:checked)' ).length > 0 ) {
						data[ i + '_hidden' ] = true;
					} else if ( typeof( data[ i + '_hidden' ] ) != 'undefined' ) {
						delete data[ i + '_hidden' ];
					}
				}

				var field = $( this ).find( '.cursorial-field-' + i );
				if ( field.length > 0 ) {
					data[ i ] = field.val();
				}

				$( this ).find( '.template-data-' + i ).show();
				$( this ).find( '.cursorial-fieldset-' + i ).remove();
			}

			$( this ).parents( '.cursorial-block' ).cursorialBlock( 'savedStatus', false );

			$( this ).find( '.cursorial-field' ).remove();
			render.apply( this, [ data ] );
			$( this ).parent().sortable( 'enable' );
		}

		/**
		 * Simply removes element from dom
		 * @function
		 * @name remove
		 * @returns {void}
		 */
		function remove() {
			$( this ).fadeTo( 'fast', 0, function() {
				$( this ).remove();
			} );

			getChilds.apply( this ).cursorialPost( 'remove' );
		}

		/**
		 * Returns the current fields settings based on childs status
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
			// If set to be removed, remove and then stop
			if ( typeof( options[ 'remove' ] ) != 'undefined' ) {
				remove.apply( this );
				return;
			}

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
	 * @function
	 * @name cursorialBlock
	 * @memberof $.fn
	 * @param {object|string} options Plugin options can be set as an object with several parameters or a string defining one:
	 *	{
	 *		target: 'jQuery selector where to put posts',
	 *		templates: {
	 *			post: 'jQuery selector for post templates'
	 *		},
	 *		buttons: {
	 *			save: 'jQuery selector for save button',
	 *			post_edit: 'jQuery selector for post edit button',
	 *			post_save: 'jQuery selector for post save button',
	 *			post_remove: 'jQuery selector for post remove button'
	 *		},
	 *		blocks: 'jQuery selector where to find all blocks',
	 *		statusIndicator: 'jQuery selector where to find the status indicator',
	 *		save: no arguments, // Saves the block
	 *		load: no arguments, // Loads the block
	 *		savedStatus: boolean // Sets the saved/not saved with changes status
	 *	}
	 * @returns {object}
	 */
	$.fn.cursorialBlock = function( options, args ) {
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
		 * Fetches all posts connected to this block with a json-request
		 * and then stores them in the data-property.
		 * When post data is here, it will call the rendering-method.
		 * @function
		 * @name load
		 * @param function callback Function that will be called when everything is done.
		 * @returns {void}
		 */
		function load( callback ) {
			var block = this;
			$( this ).cursorialLoader( 'start' );
			$.ajax( {
				url: CURSORIAL_PLUGIN_URL + 'json.php',
				type: 'POST',
				data: {
					action: 'block',
					block: $( this ).data( 'cursorial-block-name' )
				},
				dataType: 'json',
				error: function( data ) {
					$( block ).cursorialLoader( 'stop' );
					callback.apply( block );
				},
				success: function( data ) {
					$( block ).cursorialLoader( 'stop' );
					setSettings.apply( block, [ data.blocks ] );
					render.apply( block, [ data.results ] );
					callback.apply( block );
				}
			} );
		}

		/**
		 * Renders post items from data-property with specified template in options
		 * @function
		 * @name render
		 * @param array posts The posts to render
		 * @returns void
		 */
		function render( posts ) {
			var block = this;
			var options = getOptions.apply( this );
			var template = $( options.templates.post );
			$( this ).find( '.cursorial-post' ).remove();

			for ( var i in posts ) {
				template.first().clone().cursorialPost( {
					data: posts[ i ],
					buttons: options.buttons,
					connectToBlocks: options.blocks,
					applyBlockSettings: getSettings.apply( this ),
					create: function() {
						$( block ).find( options.target ).append( $( this ) );
						receivePost.apply( block, [ this ] );
					}
				} );
			}
		}

		/**
		 * Finds all post-elements with specified post ids in block element
		 * and creates a ajax-post to save the data.
		 * @return void
		 */
		function save() {
			var data = {
				action: 'save-block',
				posts: [],
				block: $( this ).data( 'cursorial-block-name' )
			};

			// Extract post ids
			var posts = $( this ).find( '.cursorial-post' );
			posts.cursorialPost( 'save' );

			for ( var i = 0; i < posts.length; i++ ) {
				// data-property does not follow draggable items,
				// therefore we've stored the post id in a class name :(
				var id = $( posts[ i ] ).attr( 'id' ).match( /cursorial-post-([0-9]+)/ );
				if ( id ) {
					var post = {
						id: id[ 1 ],
						depth: $( posts[ i ] ).data( 'cursorial-child-status' ) === true ? 1 : 0
					};

					var fields = $( posts[ i ] ).data( 'cursorial-post-data' );
					var settings = getSettings.apply( this, [ 'fields' ] );
					for( var ii in settings ) {
						if ( typeof( fields[ ii ] ) != 'undefined' ) {
							if ( settings[ ii ].overridable ) {
								post[ ii ] = fields[ ii ];
							}

							if ( settings[ ii ].optional && typeof( fields[ ii + '_hidden' ] ) != 'undefined' ) {
								post[ ii + '_hidden' ] = true;
							}
						}
					}

					data.posts.push( post );
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
					setSavedStatus.apply( block, [ true ] );
					setSettings.apply( block, [ data.blocks ] );
					render.apply( block, [ data.results ] );
				}
			} );
		}

		/**
		 * Sets this blocks settings from a settings-array fetched from server
		 * @function
		 * @name setSettings
		 * @param object settings Settings to set
		 * @returns {void}
		 */
		function setSettings( settings ) {
			if ( settings[ $( this ).data( 'cursorial-block-name' ) ] ) {
				settings = settings[ $( this ).data( 'cursorial-block-name' ) ];
			}

			if ( settings ) {
				$( this ).data( 'cursorial-block-settings', settings );
			}
		}

		/**
		 * Returns all settings or a spcified one if it exists
		 * @function
		 * @name getSettings
		 * @param string setting The setting to get
		 * @returns {mixed}
		 */
		function getSettings( setting ) {
			var settings = $( this ).data( 'cursorial-block-settings' );
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
		 * Used as a listener and called when block starts sorting
		 * @function
		 * @name startSorting
		 * @param {object} event The event being executed
		 * @param {object} ui jQuery-ui-sortable ui-object
		 * @returns {void}
		 */
		function startSorting( event, ui ) {
			outSorting.apply( this, [ event, ui ] );
			$( this ).addClass( 'cursorial-block-active' );
			$( document ).mousemove( $.proxy( whileSorting, this ) );
		}

		/**
		 * Used as a listener and called when mouse moves
		 * It tells the post if it's welcome or rejected based on the max param.
		 * @function
		 * @name whileSorting
		 * @returns {void}
		 */
		function whileSorting() {
			var post = $( '.cursorial-post.ui-sortable-helper' );
			var placeholder = $( this ).find( '.cursorial-post.ui-sortable-placeholder' );

			if ( post.length > 0 && placeholder.length > 0 ) {
				post.removeClass( 'cursorial-post-rejected' );
				placeholder.removeClass( 'cursorial-post-rejected' );
				var max = getSettings.apply( this, [ 'max' ] );

				if ( max ) {
					if (
						max < $( this ).find( getOptions.apply( this ).target ).children( '.cursorial-post:not(.cursorial-child-depth-1, #' + post.attr( 'id' ) + '):visible' ).length
						&& ! post.hasClass( 'cursorial-child-depth-1' )
					) {
						post.addClass( 'cursorial-post-rejected' );
						placeholder.addClass( 'cursorial-post-rejected' );
					}
				}
			}
		}

		/**
		 * Called when a post leaves the block.
		 * @function
		 * @name outSorting
		 * @param {object} event The event being executed
		 * @param {object} ui jQuery-ui-sortable ui-object
		 * @returns {void}
		 */
		function outSorting( event, ui ) {
			$( this ).removeClass( 'cursorial-block-active' );
			$( document ).unbind( 'mousemove', $.proxy( whileSorting, this ) );
		}

		/**
		 * Called when sorting stops
		 * @function
		 * @name stopSorting
		 * @param {object} event The event being executed
		 * @param {object} ui jQuery-ui-sortable ui-object
		 * @returns {void}
		 */
		function stopSorting( event, ui ) {
			outSorting.apply( this, [ event, ui ] );

			if ( $( ui.item ).hasClass( 'cursorial-post-rejected' ) ) {
				$( ui.item ).removeClass( 'cursorial-post-rejected' );
				$( ui.item ).parent().sortable( 'cancel' );
			}
		}

		/**
		 * Called when a post has been dragged into the block.
		 * Tells the from-sortable if it's ok and applies settings
		 * to the coming post.
		 * @function
		 * @name receivePost
		 * @param {object} post The post being received
		 * @param {object} from From where the post comes from
		 * @returns {void}
		 */
		function receivePost( post, from ) {
			if ( from && post.hasClass( 'cursorial-post-rejected' ) ) {
				post.removeClass( 'cursorial-post-rejected' );
				from.sortable( 'cancel' );
				return;
			}

			// Don't trust the post
			$( this ).find( '.cursorial-post' ).cursorialPost( {
				applyBlockSettings: getSettings.apply( this ),
				buttons: getOptions.apply( this ).buttons
			} );
		}

		/**
		 * Sets block to be sortable and connects it with other blocks
		 * @function
		 * @name setSortable
		 * @returns {void}
		 */
		function setSortable() {
			var block = this;
			var options = getOptions.apply( this );
			$( this ).find( options.target ).sortable( {
				start: function( event, ui ) {
					$( ui.item ).trigger( 'sortstart' );
					startSorting.apply( block, [ event, ui ] );
				},
				stop: function( event, ui ) {
					$( ui.item ).trigger( 'sortstop' );
					stopSorting.apply( block, [ event, ui ] );
				},
				over: $.proxy( startSorting, this ),
				out: $.proxy( outSorting, this ),
				change: $.proxy( function( event, ui ) {
					setSavedStatus.apply( this, [ false ] );
				}, this ),
				receive: $.proxy( function( event, ui ) {
					receivePost.apply( this, [ ui.item, ui.sender ] );
				}, this ),
				revert: true,
				connectWith: '.cursorial-block ' + options.target,
				delay: 200,
				distance: 30
			} );
		}

		/**
		 * Changes the saved status indicator - if it has unsaved changes or not
		 * @function
		 * @name setSavedStatus
		 * @param {boolean} status
		 * @returns {void}
		 */
		function setSavedStatus( status ) {
			if ( $( this ).data( 'cursorial-block-status' ) !== status ) {
				$( this ).data( 'cursorial-block-status', status );

				var indicator = getOptions.apply( this ).statusIndicator;
				var name = $( this ).data( 'cursorial-block-name' );

				if ( status ) {
					$( this ).removeClass( 'cursorial-block-status-unsaved' );
					$( indicator ).find( '.cursorial-block-status-' + name ).remove();
					$( window ).unbind( 'beforeunload.' + $( this ).data( 'cursorial-block-name' ) );
				} else {
					$( this ).addClass( 'cursorial-block-status-unsaved' );
					var li = $( '<li class="cursorial-block-status cursorial-block-status-' + name + '">' + cursorial_i18n( '%s has some unsaved changes.' ).replace( '%s', getSettings.apply( this, [ 'label' ] ) ) + '</li>' );
					$( indicator ).append( li );
					$( window ).bind( 'beforeunload.' + $( this ).data( 'cursorial-block-name' ), $.proxy( getSavedStatus, this ) );
				}
			}
		}

		/**
		 * Returns the current saved status
		 * @function
		 * @name getSavedStatus
		 * @returns {boolean}
		 */
		function getSavedStatus() {
			return $( this ).data( 'cursorial-block-status' );
		}

		/**
		 * Applies click event listeners to save buttons through the buttons jQuery
		 * selector applied in the options param fot this plugin.
		 * @function
		 * @name setSavedStatus
		 * @returns {void}
		 */
		function setSavingButtons() {
			$( this ).find( getOptions.apply( this ).buttons.save ).unbind( 'click', $.proxy( save, this ) );
			$( this ).find( getOptions.apply( this ).buttons.save ).bind( 'click', $.proxy( save, this ) );
		}

		/**
		 * Returns the options set through the options param for this plugin
		 * @function
		 * @name getOptions
		 * @returns {object}
		 */
		function getOptions() {
			return $( this ).data( 'cursorial-block-options' );
		}

		/**
		 * Loops through each matched element
		 */
		return this.each( function() {
			// Set default properties in options object
			$( this ).data( 'cursorial-block-options', $.extend( {
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
				blocks: '',
				statusIndicator: ''
			}, $( this ).data( 'cursorial-block-options' ), options ) );

			if ( ! $( this ).data( 'cursorial-block-name' ) ) {
				// Try to extract the block name from class attribute with pattern "cursorial-block-NAME"
				var extractedName = $( this ).attr( 'id' ).match( /cursorial-block-([^$]+)/ );
				if ( extractedName ) {
					extractedName = extractedName[ 1 ];
				}
				$( this ).data( 'cursorial-block-name', extractedName );

				if ( typeof( options[ 'load' ] ) == 'undefined' ) {
					options.load = '';
				}

				// Set the savings buttons
				setSavingButtons.apply( this );
			}

			if ( ! $( this ).hasClass( 'cursorial-block' ) ) {
				$( this ).addClass( 'cursorial-block' );
			}

			// Do actions if there are any
			for( var i in options ) {
				switch( i ) {
					case 'save' :
						save.apply( this );
						break;
					case 'load' :
						if ( typeof( options[ 'save' ] ) == 'undefined' ) {
							load.apply( this, [ $.proxy( setSortable, this ) ] );
						}
						break;
					case 'savedStatus' :
						setSavedStatus.apply( this, [ args ] );
						break;
				}
			}
		} );
	};

	/**
	 * Handles content searching
	 * @function
	 * @name cursorialSearch
	 * @memberOf $.fn
	 * @param {object} options Search options
	 *	timeout: integer in milliseconds between last keystroke and server request,
	 *	templates: {
	 *		post: 'jQuery selector where to find a post template',
	 *	},
	 *	target: 'jQuery selector where to place all posts',
	 *	blocks: 'jQuery selector where to find blocks to connect to'
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
		 * Executes the search with a server request
		 * @function
		 * @name search
		 * @returns {void}
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
		 * If there's a keystroke, the timeout will be recreated.
		 * If there's no keystroke, the timeout will call search()
		 * @function
		 * @name searchByTimeout
		 * @returns {void}
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
		 * @function
		 * @name results
		 * @returns {void}
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

			// Connect to blocks
			$( options.target ).sortable( {
				start: function( event, ui ) {
					$( ui.item ).trigger( 'sortstart' );
				},
				stop: function( event, ui ) {
					$( ui.item ).trigger( 'sortstop' );
				},
				revert: true,
				connectWith: options.blocks,
				delay: 200,
				distance: 30
			} );
		} );
	};

	/**
	 * Creates a ui-loader
	 * @function
	 * @name cursorialLoader
	 * @memberOf $.fn
	 * @param {string} action Either start or stop
	 * @returns {object}
	 */
	$.fn.cursorialLoader = function( action ) {
		/**
		 * Starts the ui-loader
		 * @function
		 * @name start
		 * @returns {void}
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
		 * @function
		 * @name stop
		 * @returns {void}
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
	 * @memberOf $.fn
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
				height: 200,
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
			removeLink.apply( this );
			var link = $( '<a href="javascript://" class="cursorial-hide-long-content-link">' + cursorial_i18n( text ) + '</a>' );
			sib.after( link );
			link.click( $.proxy( click, this ) );
			$( this ).data( 'cursorial-hide-long-content-link', link );
		}

		/**
		 * Removes show/hide links
		 * @function
		 * @name removeLink
		 * @returns {void}
		 */
		function removeLink() {
			$( this ).nextUntil( ':not(a.cursorial-hide-long-content-link)' ).remove();
			$( this ).parent( '.cursorial-hide-long-content-wrapper' ).nextUntil( ':not(a.cursorial-hide-long-content-link)' ).remove();
			$( this ).data( 'cursorial-hide-long-content-link', null );
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
	 * @name WPSetThumbnailHTML
	 * @param {object} e The DOM-element where the image is places
	 * @return {void}
	 */
	WPSetThumbnailHTML = function( e ) {
		var image = jQuery( e ).find( 'img' );
		if ( image.length > 0 ) {
			jQuery( 'a.cursorial-image-link-current' ).parents( '.cursorial-post-edit' ).each( function() {;
				var data = jQuery( this ).data( 'cursorial-post-data' );
				if ( typeof( data ) == 'object' ) {
					data.cursorial_image = [ image.attr( 'src' ), parseInt( image.attr( 'width' ) ), parseInt( image.attr( 'height' ) ), true ];
					jQuery( this ).data( 'cursorial-post-data', data );
				}
				jQuery( this ).find( 'a.cursorial-image-link-current' ).removeClass( 'cursorial-image-link-current' );
			} );
		}
	}
}
