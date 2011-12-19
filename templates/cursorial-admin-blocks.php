<?php global $cursorial_admin; ?>
<script language="javascript" type="text/javascript">
	jQuery( function( $ ) {
		// Setup cursorial search field
		$( 'input#cursorial-search-field' ).cursorialSearch( {
			templates: {
				post: '#cursorial-search-result .template' // Where to find a template to use when render posts
			},
			timeout: 1000, // For how long wait until search-query is posted to server
			target: '#cursorial-search-result', // Where to place rendered posts
			blocks: '.cursorial-block .cursorial-posts' // Where to find blocks to connect posts to
		} );

		// Setup cursorial blocks
		$( '.cursorial-block' ).cursorialBlock( {
			templates: {
				post: '#cursorial-search-result .template' // Where to find a template to use when render posts
			},
			buttons: {
				save: 'input.cursorial-block-save' // The save button
			},
			target: '.cursorial-posts', // Where to place posts
			blocks: '.cursorial-block .cursorial-posts' // Where to find other blocks to connect posts to
		} );
	} );
</script>
<div id="cursorial-admin" class="wrap">
	<div id="icon-themes" class="icon32"><br/></div>
	<h2><?php printf( __( 'Cursorial » %s', 'cursorial' ), $cursorial_admin->label ); ?></h2>

	<div class="widget-liquid-left">
		<div id="widgets-left">
			<div class="widgets-holder-wrap">

				<table class="cursorial-blocks-table">
					<tbody>

						<?php for( $r = 0; $r < $cursorial_admin->get_rows(); $r++ ) : ?>
							<tr>

								<?php for( $c = 0; $c < $cursorial_admin->get_cols(); $c++ ) :
									$block = $cursorial_admin->get_grid( $r, $c );
									if (
										$block !== null
										&& $block !== $cursorial_admin->get_grid( $r, $c - 1 )
										&& $block !== $cursorial_admin->get_grid( $r - 1, $c )
									) : ?>
										<td colspan="<?php echo $block->settings[ 'width' ]; ?>" rowspan="<?php echo $block->settings[ 'height' ]; ?>">

											<?php if ( $block->block ) : ?>
												<div id="cursorial-block-<?php echo $block->block->name; ?>" class="cursorial-block cursorial-block-<?php echo $block->block->name; ?>">
													<div class="sidebar-name">
														<div class="publishing-actions">
															<input type="submit" value="<?php _e( 'Save block', 'cursorial' ); ?>" class="button-primary cursorial-block-save" name="save_block" />
														</div>
														<h3><?php echo $block->block->label; ?></h3>
														<div class="clear"></div>
													</div>
													<div class="widget-holder">
														<p class="description"><?php _e( "Here's a list of content. To add content into this list, search content in the box to the right.", 'cursorial' ); ?></p>
														<div class="cursorial-posts"></div>
														<div class="clear"></div>
														<div class="publishing-actions">
															<input type="submit" value="<?php _e( 'Save block', 'cursorial' ); ?>" class="button-primary cursorial-block-save" name="save_block" />
														</div>
														<div class="clear"></div>
													</div>
												</div>
											<?php else : ?>
												<div class="sidebar-name">
													<h3><?php echo isset( $block->settings[ 'dummy-title' ] ) ? $block->settings[ 'dummy-title' ] : __( 'Dummy', 'cursorial' ); ?></h3>
												</div>
												<div class="widget-holder">
													<p class="description"><?php echo isset( $block->settings[ 'dummy-description' ] ) ? $block->settings[ 'dummy-description' ] : __( 'dummy', 'cursorial' ); ?></p>
												</div>
											<?php endif; ?>

										</td>
									<?php endif; ?>

								<?php endfor; ?>

							</tr>
						<?php endfor; ?>

					</tbody>
				</table>

			</div>
		</div>
	</div>

	<div class="widget-liquid-right">
		<div id="widgets-right">
			<div id="cursorial-search" class="widgets-holder-wrap">
				<div class="sidebar-name">
					<h3>
						<span><?php _e( 'Find content', 'cursorial' ); ?></span>
					</h3>
				</div>
				<div class="widgets-sortables">
					<div id="cursorial-search-form" class="widget">
						<div class="widget-inside">
							<p class="description"><?php _e( 'Enter keywords below to find content to add into a cursorial block.', 'cursorial' ); ?></p>
							<label for="cursorial-search-field"><?php _e( 'Search keywords:', 'cursorial' ); ?></label>
							<input id="cursorial-search-field" class="widefat" type="text" value="" name="query" />
						</div>
					</div>
					<div id="cursorial-search-result">
						<div class="template widget">
							<div class="widget-top">
								<div class="widget-title">
									<h4 class="post-title"><span class="template-data-post_title"></span></h4>
								</div>
							</div>
							<div class="widget-inside">
								<p class="post-meta">
									<?php _e( 'Author:', 'cursorial' ); ?> <span class="template-data-post_author"></span><br/>
									<?php _e( 'Date:', 'cursorial' ); ?> <span class="template-data-post_date"></span>
								</p>
								<p class="post-excerpt template-data-post_excerpt"></p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

</div>