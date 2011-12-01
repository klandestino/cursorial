<?php

define( 'WP_USE_THEMES', false );

$dir = dirname( $_SERVER[ 'SCRIPT_FILENAME' ] );
require_once( substr( $dir, 0, strpos( $dir, '/wp-content' ) ) . '/wp-load.php' );
require_once( dirname( __FILE__ ) . '/cursorial_query.class.php' );

$query = new Cursorial_Query();

switch ( strtolower( $_POST[ 'action' ] ) ) {
	case 'search':
		$query->search( $_POST[ 'query' ] );
		break;
}

echo json_encode( $query->results );
