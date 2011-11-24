<div class="wrap">
	<div id="icon-cursorial-area" class="icon32"><br/></div>
	<h2><?php printf( __( 'Cursorial Area %s', 'cursorial' ), $area->label ); ?></h2>

	<div class="metabox-holder has-right-sidebar">
		<div class="cursorial-right inner-sidebar">
			<div class="cursorial-search postbox">
				<div class="handlediv"><br/></div>
				<h3 class="hndle">
					<span><?php _e( 'Find content', 'cursorial' ); ?></span>
				</h3>
				<div class="inside">
					<div class="cursorial-search-form">
						<form method="post" action="<?php echo CURSORIAL_PLUGIN_URL . 'json.php'; ?>" onsubmit="return false;">
							<input type="hidden" name="target" value=".cursorial-search-result" />
							<p>
								<input id="cursorial-search-field" class="widefat" type="text" value="" name="query" />
							</p>
						</form>
					</div>
					<div class="cursorial-search-result">
						<div class="cursorial-search-result-item template">
							<h4 class="post-title"><span class="template-data-post_title"></span></h4>
							<p class="post-meta">
								<span class="template-data-post_author"></span>
								<span class="template-data-post_date"></span>
							</p>
							<p class="post-excerpt template-data-post_excerpt"></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

</div>
