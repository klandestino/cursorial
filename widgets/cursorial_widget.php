<?php

class Cursorial_Widget extends WP_Widget {

	private $custom_widget_blocks = array();

	function Cursorial_Widget() {

		parent::WP_Widget(
			get_class( $this ),
			__( 'Cursorial Widget', 'cursorial' ),
			array(
				'description' => __( 'Display an existing cursorial blocks or add a new one' )
			)
		);

		$this->custom_widget_blocks = get_option( 'cursorial_custom_widget_blocks' );

		if ( is_array( $this->custom_widget_blocks ) ) {
			$admin = array();
			$x = 0;

			foreach( $this->custom_widget_blocks as $name => $widget ) {
				$admin[ $name ] = array(
					'x' => $x,
					'y' => 0,
					'width' => 1,
					'height' => 1
				);
				$x++;
			}

			register_cursorial( $this->custom_widget_blocks, array( __( 'Custom widget blocks' ) => $admin ) );
		} else {
			$this->custom_widget_blocks = array();
		}
	}

	function widget( $args, $instance ) {
		global $cursorial;

		$blockname = $instance[ 'cursorial-block' ] == '__custom-widget-block__' ? $instance[ 'custom-block-name' ] : $instance[ 'cursorial-block' ];

		echo $args[ 'before_widget' ];
		echo $args[ 'before_title' ];
		printf( $instance[ 'title' ] );
		echo $args[ 'after_title' ];

		?><ul>
			<?php query_cursorial_posts( $blockname ); ?>
			<?php while ( have_posts() ) : the_post(); ?>
				<li>
					<h4><?php the_title(); ?></h4>
					<?php foreach( $cursorial->blocks[ $blockname ]->fields as $field_name => $field_settings ) {
						if ( ! is_cursorial_field_hidden( $field_name ) ) {
							switch( $field_name ) {
								case 'post_excerpt' :
									the_excerpt();
									break;
								case 'post_content' :
									the_content();
									break;
								case 'image' :
									the_cursorial_image();
									break;
								case 'post_date' :
									the_date();
									break;
								case 'post_author' :
									the_author();
									break;
							}
						}
					} ?>
				</li>
			<?php endwhile; ?>
		</ul><?php
		echo $args[ 'after_widget' ];
	}

	function form( $instance ) {
		global $cursorial;

		echo '<script language="javascript" type="text/javascript">
			jQuery(\'input.' . $this->get_field_id( 'cursorial-block' ) . '\').live(\'change\',function(){
				if(jQuery(this).val()=="__custom-widget-block__")jQuery(\'#' . $this->get_field_id( 'cursorial-custom-block' ) . '\').show(\'fast\');
				else jQuery(\'#' . $this->get_field_id( 'cursorial-custom-block' ) . '\').hide(\'fast\');
			});
		</script>';

		echo '<p><label for="' . $this->get_field_id( 'title' ) . '">' . __( 'Title:' ) . '</label><br/>
			<input
				id="' . $this->get_field_id( 'title' ) . '"
				type="text" name="' . $this->get_field_name( 'title' ) . '"
				value="' . ( isset( $instance[ 'title' ] ) ? $instance[ 'title' ] : '' ) . '"
				class="widefat"
			/></p>';

		echo '<h3>' . __( 'Available cursorial blocks', 'cursorial' ) . '</h3>';
		echo '<ul>';

		foreach( $cursorial->blocks as $name => $block ) {
			if ( ! preg_match( '/__custom-widget-block-(?:[0-9]+)__/', $name ) ) {
				echo '<li><input
						id="' . $this->get_field_id( 'cursorial-block' ) . '-' . $name . '"
						class="' . $this->get_field_id( 'cursorial-block' ) . '"
						type="radio" name="' . $this->get_field_name( 'cursorial-block' ) . '"
						value="' . $name . '"
						' . ( isset( $instance[ 'cursorial-block' ] ) && $instance[ 'cursorial-block' ] == $name ? 'checked="checked"' : '' ) . '
					/> <label for="' . $this->get_field_id( 'cursorial-block' ) . '-' . $name . '">' . $block->label . '</label></li>';
			}
		}

		echo '<input
				id="' . $this->get_field_id( 'cursorial-block' ) . '-__custom-widget-block__"
				class="' . $this->get_field_id( 'cursorial-block' ) . '"
				type="radio" name="' . $this->get_field_name( 'cursorial-block' ) . '"
				value="__custom-widget-block__"
				' . ( isset( $instance[ 'cursorial-block' ] ) && $instance[ 'cursorial-block' ] == '__custom-widget-block__' ? 'checked="checked"' : '' ) . '
			/> <label for="' . $this->get_field_id( 'cursorial-block' ) . '-__custom-widget-block__">' . __( 'Custom block' ) . '</label><br/>';
		echo '</ul>';
		echo '<div
				id="' . $this->get_field_id( 'cursorial-custom-block' ) . '"
				' . ( isset( $instance[ 'cursorial-block' ] ) && $instance[ 'cursorial-block' ] == '__custom-widget-block__' ? '' : 'style="display:none;"' ) . '
			>';
		echo '<h3>' . __( 'Add new custom cursorial block', 'cursorial' ) . '</h3>';

		foreach( array(
			array( 'name' => 'custom-label', 'title' => __( 'Block label:', 'cursorial' ) ),
			array( 'name' => 'custom-max', 'title' => __( 'Maximum number of posts:', 'cursorial' ) )
		) as $field ) {
			echo '<p><label for="' . $this->get_field_id( $field[ 'name' ] ) . '">' . $field[ 'title' ] . '</label><br/>
				<input
					id="' . $this->get_field_id( $field[ 'name' ] ) . '"
					type="text" name="' . $this->get_field_name( $field[ 'name' ] ) . '"
					value="' . ( isset( $instance[ $field[ 'name' ] ] ) ? $instance[ $field[ 'name' ] ] : '' ) . '"
					class="widefat"
				/></p>';
		}

		echo '<h4>' . __( 'What fields should be available?', 'cursorial' ) . '</h4>';
		echo '<input
				type="hidden" name="' . $this->get_field_name( 'custom-block-name' ) . '"
				value="' . ( isset( $instance[ 'custom-block-name' ] ) ? $instance[ 'custom-block-name' ] : '' ) . '"
			/>';
		echo '<ul>';

		foreach( array(
			array( 'name' => 'post_excerpt', 'title' => __( 'Excerpt', 'cursorial' ) ),
			array( 'name' => 'post_content', 'title' => __( 'Content', 'cursorial' ) ),
			array( 'name' => 'image', 'title' => __( 'Image', 'cursorial' ) ),
			array( 'name' => 'post_date', 'title' => __( 'Date', 'cursorial' ) ),
			array( 'name' => 'post_author', 'title' => __( 'Author', 'cursorial' ) )
		) as $field ) {
			echo '<li><input
					id="' . $this->get_field_id( 'custom-field-' . $field[ 'name' ] ) . '"
					type="checkbox" name="' . $this->get_field_name( 'custom-fields' ) . '[]"
					value="' . $field[ 'name' ] . '"
					' . ( isset( $instance[ 'custom-fields' ] ) && in_array( $field[ 'name' ], $instance[ 'custom-fields' ] ) ? 'checked="checked"' : '' ) . '
				/> <label for="' . $this->get_field_id( 'custom-field-' . $field[ 'name' ] ) . '">' . $field[ 'title' ] . '</label></li>';
		}

		echo '</ul>';
		echo '</div>';
	}

	function update( $new, $old ) {
		$instance = $old;
		$instance[ 'title' ] = strip_tags( $new[ 'title' ] );

		if ( $new[ 'cursorial-block' ] == '__custom-widget-block__' ) {
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

				$instance[ 'custom-block-name' ] = '__custom-widget-block-' . $length . '__';
			}

			foreach( array(
				array( 'name' => 'custom-label', 'default' => 'Custom Widget Block' ),
				array( 'name' => 'custom-max', 'default' => '5' )
			) as $field ) {
				if ( ! isset( $new[ $field[ 'name' ] ] ) ) {
					$instance[ $field[ 'name' ] ] = $field[ 'default' ];
				} else {
					$instance[ $field[ 'name' ] ] = $new[ $field[ 'name' ] ];
				}
			}

			$fields = array(
				'post_title' => array(
					'overridable' => true
				)
			);

			if ( isset( $new[ 'custom-fields' ] ) ) {
				foreach( $new[ 'custom-fields' ] as $field ) {
					$fields[ $field ] = array( 'overridable' => true );
				}

				$instance[ 'custom-fields' ] = $new[ 'custom-fields' ];
			}

			$this->custom_widget_blocks[ $instance[ 'custom-block-name' ] ] = array(
				'label' => $instance[ 'custom-label' ],
				'max' => $instance[ 'custom-max' ],
				'fields' => $fields
			);
		} else {
			$instance[ 'cursorial-block' ] = $new[ 'cursorial-block' ];

			if ( $old[ 'cursorial-block' ] == '__custom-widget-block__' ) {
				if ( ! empty( $old[ 'custom-block-name' ] ) && isset( $this->custom_widget_blocks[ $old[ 'custom-block-name' ] ] ) ) {
					unset( $this->custom_widget_blocks[ $old[ 'custom-block-name' ] ] );
				}
			}
		}

		delete_option( 'cursorial_custom_widget_blocks' );
		add_option( 'cursorial_custom_widget_blocks', $this->custom_widget_blocks );

		return $instance;
	}

}
