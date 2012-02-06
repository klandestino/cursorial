<ul class="cursorial-widget-post-list">
	<?php $even = true; ?>
	<?php while ( have_posts() ) : the_post(); $even = !( $even ); ?>
	<li class="cursorial-widget-post cursorial-widget-post-<?php echo $even ? 'even' : 'odd'; ?>">
			<h4 class="cursorial-widget-post-title"><a href="<?php echo esc_url( get_permalink() ); ?>" title="<?php echo esc_attr( get_the_title() ); ?>"><span><?php the_title(); ?></span></a></h4>
			<?php if ( ! is_cursorial_field_hidden( 'post_date' ) && ! is_cursorial_field_hidden( 'post_author' ) ) : ?>
				<p class="cursorial-widget-post-meta">
					<?php printf( __( 'Posted on %1$s by %2$s', 'cursorial' ),
						'<span class="date">' . get_the_date() . '</span>',
						'<span class="author">' . get_the_author_link() . '</span>'
					); ?>
				</p>
			<?php elseif ( ! is_cursorial_field_hidden( 'post_date' ) ) : ?>
				<p class="cursorial-widget-post-meta">
					<?php printf( __( 'Posted on %1$s', 'cursorial' ),
						'<span class="date">' . get_the_date() . '</span>'
					); ?>
				</p>
			<?php elseif ( ! is_cursorial_field_hidden( 'post_author' ) ) : ?>
				<p class="cursorial-widget-post-meta">
					<?php printf( __( 'Written by %1$s', 'cursorial' ),
						'<span class="author">' . get_the_author_link() . '</span>'
					); ?>
				</p>
			<?php endif; ?>
			<?php foreach( array(
				'image',
				'post_excerpt',
				'post_content'
			) as $field_name ) {
				if ( ! is_cursorial_field_hidden( $field_name ) ) {
					echo '<div class="cursorial-widget-post-' . $field_name . '">';
					switch( $field_name ) {
						case 'post_excerpt' :
							the_excerpt();
							break;
						case 'post_content' :
							the_content();
							break;
						case 'image' :
							the_cursorial_image( 'thumbnail', array( 'class' => 'aligncenter' ) );
							break;
					}
					echo '</div>';
				}
			} ?>
		</li>
	<?php endwhile; ?>
</ul>
