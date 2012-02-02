<?php global $cursorial, $cursorial_widget, $cursorial_widget_instance; ?>

<script language="javascript" type="text/javascript">
	jQuery( 'input.<?php echo $cursorial_widget->get_field_id( 'cursorial-block' ); ?>' ).live( 'change', function() {
		if ( jQuery( this ).val() == '<?php echo Cursorial_Widget::CUSTOM_BLOCK_NAME; ?>' ) {
			jQuery( '#<?php echo $cursorial_widget->get_field_id( 'cursorial-custom-block' ); ?>' ).show( 'fast' );
		} else {
			jQuery( '#<?php echo $cursorial_widget->get_field_id( 'cursorial-custom-block' ); ?>' ).hide( 'fast' );
		}
	} );
</script>

<p>
	<label for="<?php echo $cursorial_widget->get_field_id( 'title' ); ?>"><?php echo __( 'Title:' ); ?></label><br/>
	<input
		id="<?php echo $cursorial_widget->get_field_id( 'title' ); ?>"
		type="text" name="<?php echo $cursorial_widget->get_field_name( 'title' ); ?>"
		value="<?php echo ( isset( $cursorial_widget_instance[ 'title' ] ) ? $cursorial_widget_instance[ 'title' ] : '' ); ?>"
		class="widefat"
	/>
</p>

<h3><?php echo __( 'Available cursorial blocks', 'cursorial' ); ?></h3>
<ul>

	<?php foreach( $cursorial->blocks as $name => $block ) :
		if ( ! preg_match( '/' . str_replace( Cursorial_Widget::CUSTOM_BLOCK_ID_BASE, '[id]', '(?:[0-9]+)' ) . '/', $name ) ) : ?>
			<li><input
				id="<?php echo $cursorial_widget->get_field_id( 'cursorial-block' ); ?>-<?php echo $name; ?>"
				class="<?php echo $cursorial_widget->get_field_id( 'cursorial-block' ); ?>"
				type="radio" name="<?php echo $cursorial_widget->get_field_name( 'cursorial-block' ); ?>"
				value="<?php echo $name; ?>"
				<?php echo ( isset( $cursorial_widget_instance[ 'cursorial-block' ] ) && $cursorial_widget_instance[ 'cursorial-block' ] == $name ? 'checked="checked"' : '' ); ?>
			/> <label for="<?php echo $cursorial_widget->get_field_id( 'cursorial-block' ); ?>-<?php echo $name; ?>"><?php echo $block->label; ?></label></li>
		<?php endif;
	endforeach; ?>

	<li><input
		id="<?php echo $cursorial_widget->get_field_id( 'cursorial-block' ); ?>-<?php echo Cursorial_Widget::CUSTOM_BLOCK_NAME; ?>"
		class="<?php echo $cursorial_widget->get_field_id( 'cursorial-block' ); ?>"
		type="radio" name="<?php echo $cursorial_widget->get_field_name( 'cursorial-block' ); ?>"
		value="<?php echo Cursorial_Widget::CUSTOM_BLOCK_NAME; ?>"
		<?php echo ( isset( $cursorial_widget_instance[ 'cursorial-block' ] ) && $cursorial_widget_instance[ 'cursorial-block' ] == Cursorial_Widget::CUSTOM_BLOCK_NAME ? 'checked="checked"' : '' ); ?>
	/> <label for="<?php echo $cursorial_widget->get_field_id( 'cursorial-block' ); ?>-<?php echo Cursorial_Widget::CUSTOM_BLOCK_NAME; ?>"><?php echo __( 'Custom block' ); ?></label></li>
</ul>

<div
	id="<?php echo $cursorial_widget->get_field_id( 'cursorial-custom-block' ); ?>"
	<?php echo ( isset( $cursorial_widget_instance[ 'cursorial-block' ] ) && $cursorial_widget_instance[ 'cursorial-block' ] == Cursorial_Widget::CUSTOM_BLOCK_NAME ? '' : 'style="display:none;"' ); ?>
>
	<h3><?php echo __( 'Add new custom cursorial block', 'cursorial' ); ?></h3>

	<?php foreach( array(
		array( 'name' => 'custom-label', 'title' => __( 'Block label:', 'cursorial' ) ),
		array( 'name' => 'custom-max', 'title' => __( 'Maximum number of posts:', 'cursorial' ) )
	) as $field ) : ?>
		<p>
			<label for="<?php echo $cursorial_widget->get_field_id( $field[ 'name' ] ); ?>"><?php echo $field[ 'title' ]; ?></label><br/>
			<input
				id="<?php echo $cursorial_widget->get_field_id( $field[ 'name' ] ); ?>"
				type="text" name="<?php echo $cursorial_widget->get_field_name( $field[ 'name' ] ); ?>"
				value="<?php echo ( isset( $cursorial_widget_instance[ $field[ 'name' ] ] ) ? $cursorial_widget_instance[ $field[ 'name' ] ] : '' ); ?>"
				class="widefat"
			/>
		</p>
	<?php endforeach; ?>

	<h4><?php echo __( 'What fields should be available?', 'cursorial' ); ?></h4>
	<input
		type="hidden" name="<?php echo $cursorial_widget->get_field_name( 'custom-block-name' ); ?>"
		value="<?php echo ( isset( $cursorial_widget_instance[ 'custom-block-name' ] ) ? $cursorial_widget_instance[ 'custom-block-name' ] : '' ); ?>"
	/>

	<ul>
		<?php foreach( array(
			array( 'name' => 'post_excerpt', 'title' => __( 'Excerpt', 'cursorial' ) ),
			array( 'name' => 'post_content', 'title' => __( 'Content', 'cursorial' ) ),
			array( 'name' => 'image', 'title' => __( 'Image', 'cursorial' ) ),
			array( 'name' => 'post_date', 'title' => __( 'Date', 'cursorial' ) ),
			array( 'name' => 'post_author', 'title' => __( 'Author', 'cursorial' ) )
		) as $field ) : ?>
			<li><input
				id="<?php echo $cursorial_widget->get_field_id( 'custom-field-' . $field[ 'name' ] ); ?>"
				type="checkbox" name="<?php echo $cursorial_widget->get_field_name( 'custom-fields' ); ?>[]"
				value="<?php echo $field[ 'name' ]; ?>"
				<?php echo ( isset( $cursorial_widget_instance[ 'custom-fields' ] ) && in_array( $field[ 'name' ], $cursorial_widget_instance[ 'custom-fields' ] ) ? 'checked="checked"' : '' ); ?>
			/> <label for="<?php echo $cursorial_widget->get_field_id( 'custom-field-' . $field[ 'name' ] ); ?>"><?php echo $field[ 'title' ]; ?></label></li>
		<?php endforeach; ?>
	</ul>

</div>
