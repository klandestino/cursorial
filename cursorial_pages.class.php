<?php

/**
 * All the cursorial generated pages
 */
class Cursorial_Pages {

	/**
	 * The general administration page
	 */
	public function admin() {
		include( dirname( __FILE__ ) . '/templates/admin.php' );
	}

	/**
	 * Area administration page
	 */
	public function admin_area( $area ) {
		include( dirname( __FILE__ ) . '/templates/admin-area.php' );
	}

}
