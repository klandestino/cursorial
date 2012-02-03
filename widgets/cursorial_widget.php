<?php

/**
 * This widget shows posts from registered cursorial block or a block 
 * created by this widget.
 *
 * Both admin and public display are rendered through templates found in 
 * the template directory. They're also overridable by themes.
 * The admin template is called `cursorial-admin-widget.php` and the 
 * public template `cursorial-widget.php`.
 *
 * Custom blocks are registered when this class is initiated. It'll loop 
 * through all registered cursorial widgets and register blocks with 
 * their's settings.
 */
class Cursorial_Widget extends WP_Widget {

	/**
	 * The block name value that defines a custom block
	 */
	const CUSTOM_BLOCK_NAME = '__custom-widget-block__';

	/**
	 * The block name pattern used by naming the custom blocks
	 */
	const CUSTOM_BLOCK_ID_BASE = '__custom-widget-block-[id]__';

	/**
	 * @private
	 * Local array with custom blocks created by this widget
	 */
	private $custom_widget_blocks = array();

	/**
	 * The constructor – will get widget settings and register custom 
	 * cursorial blocks if there are any.
	 */
	function Cursorial_Widget() {
		parent::WP_Widget(
			get_class( $this ),
			__( 'Cursorial Widget', 'cursorial' ),
			array(
				'description' => __( 'Display an existing cursorial block or add a new one' )
			)
		);

		$this->set_custom_widget_blocks_by_settings( $this->get_settings() );
		$this->register_custom_widget_blocks( $this->custom_widget_blocks );
	}

	/**
	 * @private
	 * Searches specified settings for any custom block settings and saves 
	 * it to the local block array.
	 * @param array $settings Settings to search for blocks in
	 * @return void
	 */
	function set_custom_widget_blocks_by_settings( $settings ) {
		if ( is_array( $settings ) ) {
			foreach( $settings as $instance ) {
				if ( is_array( $instance ) ) {
					if (
						isset( $instance[ 'cursorial-block' ] ) && $instance[ 'cursorial-block' ] == self::CUSTOM_BLOCK_NAME
						&& isset( $instance[ 'custom-block-name' ] )
					) {
						// Post titles are always visible
						$fields = array(
							'post_title' => array(
								'overridable' => true
							)
						);

						if ( isset( $instance[ 'custom-fields' ] ) && is_array( $instance[ 'custom-fields' ] ) ) {
							foreach( $instance[ 'custom-fields' ] as $field_name ) {
								$fields[ $field_name ] = array(
									'optional' => true,
									// When this widget was written, this plugin could not 
									// handle date and author overrides – therefor we'll 
									// only apply override to content, excerpt and image 
									// fields.
									'overridable' => ( $field_name == 'post_content' || $field_name == 'post_excerpt' || $field_name == 'image' )
								);
							}
						}

						$this->custom_widget_blocks[ $instance[ 'custom-block-name' ] ] = array(
							// Default label if it's not set
							'label' => isset( $instance[ 'custom-label' ] ) ? $instance[ 'custom-label' ] : __( 'Custom Widget Block', 'cursorial' ),
							// Same goes to maximum amount of posts
							'max' => isset( $instance[ 'custom-max' ] ) && is_numeric( $instance[ 'custom-max' ] ) ? $instance[ 'custom-max' ] : 5,
							// And then the fields...
							'fields' => $fields
						);
					}
				}
			}
		}
	}

	/**
	 * @private
	 * Registers the specified blocks and creates an admin settings array 
	 * for them. All blocks are found on the same page horisontally 
	 * aligned.
	 * @param array $blocks Blocks to register
	 * @return void
	 */
	function register_custom_widget_blocks( $blocks ) {
		if ( count( $blocks ) ) {
			$admin = array();
			$x = 0;

			foreach( $blocks as $name => $block ) {
				$admin[ $name ] = array(
					'x' => $x,
					'y' => 0,
					'width' => 1,
					'height' => 1
				);
				$x++;
			}

			register_cursorial( $blocks, array( __( 'Custom Widget Blocks', 'cursorial' ) => $admin ) );
		}
	}

	/**
	 * Displays/echoes the widget by speficied arguments and instance.
	 * It uses a template for rendering. The template is found in 
	 * `templates/cursorial-widget.php` and can be overrided by a theme 
	 * template with the same name.
	 * @param array $args Display arguments
	 * @param array $instance The widget instance settings
	 * @return void
	 */
	function widget( $args, $instance ) {
		global $cursorial;

		$blockname = $instance[ 'cursorial-block' ] == self::CUSTOM_BLOCK_NAME ? $instance[ 'custom-block-name' ] : $instance[ 'cursorial-block' ];
		query_cursorial_posts( $blockname );

		echo $args[ 'before_widget' ] . $args[ 'before_title' ] . $instance[ 'title' ] . $args[ 'after_title' ];
		$cursorial->get_template( 'cursorial-widget', $blockname );
		echo $args[ 'after_widget' ];
	}

	/**
	 * Displays/echoes the widget admin form for specified widget 
	 * instance. It uses a template for rendering. The template is found 
	 * in `templates/cursorial-admin-widget.php` and can be overrided by a 
	 * theme template with the same name.
	 * @param array $instance The widget instance settings
	 * @return void
	 */
	function form( $instance ) {
		global $cursorial, $cursorial_widget, $cursorial_widget_instance;

		$cursorial_widget = $this;
		$cursorial_widget_instance = $instance;

		$cursorial->get_template( 'cursorial-admin-widget' );
	}

	/**
	 * Updates a widget instance settings.
	 * @param array $new The new instance settings
	 * @param array $old The old instance settings
	 * @return void
	 */
	function update( $new, $old ) {
		$instance = $old;
		$instance[ 'title' ] = strip_tags( $new[ 'title' ] );

		if ( $new[ 'cursorial-block' ] == self::CUSTOM_BLOCK_NAME ) {
			$instance[ 'cursorial-block' ] = $new[ 'cursorial-block' ];

			if ( ! empty( $new[ 'custom-block-name' ] ) && isset( $this->custom_widget_blocks[ $new[ 'custom-block-name' ] ] ) ) {
				$instance[ 'custom-block-name' ] = $new[ 'custom-block-name' ];	
			} else {
				/**
				 * $length option is used to get an unique number for custom 
				 * widget blocks. It's used together with CUSTOM_BLOCK_ID_BASE 
				 * constant to create an unique blick id/name.
				 */

				$length = get_option( 'cursorial_custom_widget_block_length' );

				if ( ! $length ) {
					$length = 1;
				} else {
					$length++;
				}

				delete_option( 'cursorial_custom_widget_block_length' );
				add_option( 'cursorial_custom_widget_block_length', $length );

				$instance[ 'custom-block-name' ] = str_replace( self::CUSTOM_BLOCK_ID_BASE, '[id]', $length );
			}

			/**
			 * $id is only fetched to create an unique label as a 
			 * fallback/default value when a label is not specified.
			 */

			$id = '';

			if ( preg_match( '/' . str_replace( self::CUSTOM_BLOCK_ID_BASE, '[id]', '([0-9]+)' ) . '/', $instance[ 'custom-block-name' ], $match ) ) {
				$id = $match[ 1 ];
			}

			foreach( array(
				array( 'name' => 'custom-label', 'default' => 'Custom Widget Block ' . $id, 'type' => 'string' ),
				array( 'name' => 'custom-max', 'default' => '5', 'type' => 'int' )
			) as $field ) {
				if (
					! isset( $new[ $field[ 'name' ] ] )
					|| empty( $new[ $field[ 'name' ] ] )
					|| ( $field[ 'type' ] == 'int' && ! is_numeric( $new[ $field[ 'name' ] ] ) )
				) {
					$instance[ $field[ 'name' ] ] = $field[ 'default' ];
				} else {
					$instance[ $field[ 'name' ] ] = $new[ $field[ 'name' ] ];
				}
			}

			$instance[ 'custom-fields' ] = $new[ 'custom-fields' ];
		} else {
			$instance[ 'cursorial-block' ] = $new[ 'cursorial-block' ];
		}

		return $instance;
	}

}
