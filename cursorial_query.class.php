<?php

/**
 * Class that handles all the Cursorial wp-queries
 */
class Cursorial_Query {
	/**
	 * Contains all results
	 */
	public $results = array();

	/**
	 * Search query keyword terms
	 */
	public $search_keywords = array();

	/**
	 * Populates the result-array with given post.
	 * It skips already populated posts
	 *
	 * @param object $post Post from a wp_query
	 * @return void
	 */
	private function populate_results( $post ) {
		if ( ! array_key_exists( $post->ID, $this->results ) ) {
			setup_postdata( $post );

			// If this post has a cursorial-post-id stored as meta-data and is a cursorial post
			// type, then replace post-id with the real post id.
			$ref_id = get_post_meta( $post->ID, 'cursorial-post-id', true );
			if ( $ref_id && $post->post_type == Cursorial::POST_TYPE ) {
				$post->cursorial_ID = $post->ID;
				$post->ID = $ref_id;
			}

			$post->post_title = apply_filters( 'the_title', $post->post_title );
			$post->post_author = get_the_author();
			$post->post_date = apply_filters( 'the_date', $post->post_date );
			$post->post_excerpt = apply_filters( 'the_excerpt', $post->post_excerpt );

			$this->results[ $post->ID ] = $post;
		}
	}

	/**
	 * Modifies the wp_query-where-string with search keywords
	 *
	 * @param string $where The SQL-where-string to modify
	 * @return string SQL-where-string
	 */
	public function post_title_filter( $where = '' ) {
		foreach ( $this->search_keywords as $term ) {
			$where .= sprintf( ' AND post_title LIKE "%%%s%%"', preg_replace( '/[\'\"]/', '', $term ) );
		}
		return $where;
	}

	/**
	 * Populates the result-array with a search-query.
	 * The search is split into four different queries, each with it's own priority order.
	 * * Priority #1: title, match words in title
	 * * Priority #2: category taxonomy, match category names
	 * * Priority #3: tags taxonomy, match tag names
	 * * Priority #4: author, match author name
	 *
	 * @param string $terms Search keywords
	 * @return void
	 */
	public function search( $terms ) {
		$this->search_keywords = explode( ' ', trim( $terms ) );

		foreach ( array(
			'title' => 'post_title_filter',
			'category' => array(
				'tax_query' => array(
					array(
						'taxonomy' => 'category',
						'field' => 'slug',
						'terms' => $this->search_keywords
					)
				)
			),
			'tags' => array(
				'tax_query' => array(
					array(
						'taxonomy' => 'post_tag',
						'field' => 'slug',
						'terms' => $this->search_keywords
					)
				)
			),
			'author' => array(
				'author_name' => implode( ',', $this->search_keywords )
			)
		) as $field => $args ) {
			if ( is_string( $args ) ) {
				add_filter( 'posts_where', array( &$this, $args ) );
				$query = new WP_Query();
				remove_filter( 'posts_where', array( &$this, $args ) );
			} else {
				$query = new WP_Query( $args );
			}

			foreach ( $query->get_posts() as $post ) {
				$this->populate_results( $post );
			}
		}
	}

	/**
	 * Makes a query for all posts in specified block and populates the results-array.
	 *
	 * @param string $block Block name
	 * @return void
	 */
	public function block( $name ) {
		$query = new WP_Query( array(
			'post_type' => Cursorial::POST_TYPE,
			'tax_query' => array(
				array(
					'taxonomy' => Cursorial::TAXONOMY,
					'field' => 'slug',
					'terms' => array( $name )
				)
			)
		) );

		foreach ( $query->get_posts() as $post ) {
			$this->populate_results( $post );
		}
	}
}