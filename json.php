<?php

define( 'WP_USE_THEMES', true );

$dir = dirname( $_SERVER[ 'SCRIPT_FILENAME' ] );
require_once( substr( $dir, 0, strpos( $dir, '/wp-content' ) ) . '/wp-load.php' );

get_currentuserinfo();

if ( ! user_can( $user_ID, 'publish_posts' ) ) {
	echo 'Where I\'m I? Hello?';
	exit;
}

require_once( dirname( __FILE__ ) . '/cursorial.php' );

$query = new Cursorial_Query();
$blocks = array();

switch ( strtolower( $_POST[ 'action' ] ) ) {
	case 'search':
		$query->search( $_POST[ 'query' ] );
		break;
	case 'block':
		$cursorial->prevent_hidden = true;
		if ( array_key_exists( $_POST[ 'block' ], $cursorial->blocks ) ) {
			$query->block( $_POST[ 'block' ] );
			$blocks[ $_POST[ 'block' ] ] = $cursorial->blocks[ $_POST[ 'block' ] ]->get_settings();
		}
		break;
	case 'save-block':
		if ( array_key_exists( $_POST[ 'block' ], $cursorial->blocks ) ) {
			$block = $cursorial->blocks[ $_POST[ 'block' ] ];
			$block->set_posts( $_POST[ 'posts' ] );
			$query->block( $_POST[ 'block' ] );
			$blocks[ $_POST[ 'block' ] ] = $block->get_settings();
		}
		break;
}

echo json_encode( array( 'blocks' => $blocks, 'results' => $query->results ) );
