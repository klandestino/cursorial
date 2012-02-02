<?php

class Cursorial_Widget extends WP_Widget {

	const CUSTOM_BLOCK_NAME = '__custom-widget-block__';
	const CUSTOM_BLOCK_ID_BASE = '__custom-widget-block-[id]__';

	private $custom_widget_blocks = array();

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

	function set_custom_widget_blocks_by_settings( $settings ) {
		if ( is_array( $settings ) ) {
			foreach( $settings as $instance ) {
				if ( is_array( $instance ) ) {
					if (
						isset( $instance[ 'cursorial-block' ] ) && $instance[ 'cursorial-block' ] == self::CUSTOM_BLOCK_NAME
						&& isset( $instance[ 'custom-block-name' ] )
					) {
						$fields = array(
							'post_title' => array(
								'overridable' => true
							)
						);

						if ( isset( $instance[ 'custom-fields' ] ) && is_array( $instance[ 'custom-fields' ] ) ) {
							foreach( $instance[ 'custom-fields' ] as $field_name ) {
								$fields[ $field_name ] = array(
									'optional' => true,
									'overridable' => ( $field_name == 'post_content' || $field_name == 'post_excerpt' || $field_name == 'image' )
								);
							}
						}

						$this->custom_widget_blocks[ $instance[ 'custom-block-name' ] ] = array(
							'label' => isset( $instance[ 'custom-label' ] ) ? $instance[ 'custom-label' ] : __( 'Custom Widget Block', 'cursorial' ),
							'max' => isset( $instance[ 'custom-max' ] ) && is_int( $instance[ 'custom-max' ] ) ? $instance[ 'custom-max' ] : 5,
							'fields' => $fields
						);
					}
				}
			}
		}
	}

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

	function widget( $args, $instance ) {
		global $cursorial;

		$blockname = $instance[ 'cursorial-block' ] == self::CUSTOM_BLOCK_NAME ? $instance[ 'custom-block-name' ] : $instance[ 'cursorial-block' ];
		query_cursorial_posts( $blockname );

		echo $args[ 'before_widget' ] . $args[ 'before_title' ] . $instance[ 'title' ] . $args[ 'after_title' ];
		$cursorial->get_template( 'cursorial-widget', $blockname );
		echo $args[ 'after_widget' ];
	}

	function form( $instance ) {
		global $cursorial, $cursorial_widget, $cursorial_widget_instance;

		$cursorial_widget = $this;
		$cursorial_widget_instance = $instance;

		$cursorial->get_template( 'cursorial-admin-widget' );
	}

	function update( $new, $old ) {
		$instance = $old;
		$instance[ 'title' ] = strip_tags( $new[ 'title' ] );

		if ( $new[ 'cursorial-block' ] == self::CUSTOM_BLOCK_NAME ) {
			$instance[ 'cursorial-block' ] = $new[ 'cursorial-block' ];

			if ( ! empty( $new[ 'custom-block-name' ] ) && isset( $this->custom_widget_blocks[ $new[ 'custom-block-name' ] ] ) ) {
				$instance[ 'custom-block-name' ] = $new[ 'custom-block-name' ];	
			} else {
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
					|| ( $field[ 'type' ] == 'int' && ! is_int( $new[ $field[ 'name' ] ] ) )
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
