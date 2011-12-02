<?php

define( 'WP_USE_THEMES', false );

$dir = dirname( $_SERVER[ 'SCRIPT_FILENAME' ] );
require_once( substr( $dir, 0, strpos( $dir, '/wp-content' ) ) . '/wp-load.php' );
require_once( dirname( __FILE__ ) . '/cursorial.class.php' );
require_once( dirname( __FILE__ ) . '/cursorial_area.class.php' );
require_once( dirname( __FILE__ ) . '/cursorial_query.class.php' );

$cursorial = new Cursorial();
$query = new Cursorial_Query();

switch ( strtolower( $_POST[ 'action' ] ) ) {
	case 'search':
		$query->search( $_POST[ 'query' ] );
		break;
	case 'posts':
		$query->posts( $_POST[ 'area' ] );
		break;
	case 'save-area':
		$area = new Cursorial_Area( $cursorial, $_POST[ 'area' ] );
		$area->setPosts( $_POST[ 'posts' ] );
		break;
}

echo json_encode( $query->results );
