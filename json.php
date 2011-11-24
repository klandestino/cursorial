<?php

define( 'WP_USE_THEMES', false );

$dir = dirname( $_SERVER[ 'SCRIPT_FILENAME' ] );
require_once( substr( $dir, 0, strpos( $dir, '/wp-content' ) ) . '/wp-load.php' );

$results = array();
$search_query = explode( ' ', trim( $_POST[ 'query' ] ) );

function post_title_filter( $where = '' ) {
	global $search_query;
	foreach ( $search_query as $term ) {
		$where .= sprintf( ' AND post_title LIKE "%%%s%%"', preg_replace( '/[\'\"]/', '', $term ) );
	}
	return $where;
}

foreach ( array(
	'title' => 'post_title_filter',
	'category' => array(
		'tax_query' => array(
			array(
				'taxonomy' => 'category',
				'field' => 'slug',
				'terms' => $search_query
			)
		)
	),
	'tags' => array(
		'tax_query' => array(
			array(
				'taxonomy' => 'post_tag',
				'field' => 'slug',
				'terms' => $search_query
			)
		)
	),
	'author' => array(
		'author_name' => implode( ',', $search_query )
	)
) as $field => $args ) {
	if ( is_string( $args ) ) {
		add_filter( 'posts_where', $args );
		$query = new WP_Query();
		$posts = $query->get_posts();
		remove_filter( 'posts_where', $args );
	} else {
		$query = new WP_Query( $args );
		$posts = $query->get_posts();
	}

	foreach ( $posts as $post ) {
		if ( ! array_key_exists( $post->ID, $results ) ) {
			setup_postdata( $post );
			$post->post_author = get_the_author();
			$post->post_date = get_the_date();
			$post->post_excerpt = get_the_excerpt();
			$results[ $post->ID ] = $post;
		}
	}
}

echo json_encode( $results );
