<?php

define( 'WP_USE_THEMES', false );

$dir = dirname( $_SERVER[ 'SCRIPT_FILENAME' ] );
require_once( substr( $dir, 0, strpos( $dir, '/wp-content' ) ) . '/wp-load.php' );

get_currentuserinfo();

if ( ! user_can( $user_ID, 'publish_posts' ) ) {
	echo 'Where I\'m I? Hello?';
	exit;
}

require_once( dirname( __FILE__ ) . '/cursorial.class.php' );
require_once( dirname( __FILE__ ) . '/cursorial_block.class.php' );
require_once( dirname( __FILE__ ) . '/cursorial_query.class.php' );

$cursorial = new Cursorial();
$query = new Cursorial_Query();

switch ( strtolower( $_POST[ 'action' ] ) ) {
	case 'search':
		$query->search( $_POST[ 'query' ] );
		break;
	case 'block':
		$query->block( $_POST[ 'block' ] );
		break;
	case 'save-block':
		$block = new Cursorial_Block( $cursorial, $_POST[ 'block' ] );
		$block->set_posts( $_POST[ 'posts' ] );
		$query->block( $_POST[ 'block' ] );
		break;
}

echo json_encode( $query->results );
