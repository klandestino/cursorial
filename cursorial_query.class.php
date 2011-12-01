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
	private function populateResults( $post ) {
		if ( ! array_key_exists( $post->ID, $this->results ) ) {
			setup_postdata( $post );
			$post->post_author = get_the_author();
			$post->post_date = get_the_date();
			$post->post_excerpt = get_the_excerpt();
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
				$posts = $query->get_posts();
				remove_filter( 'posts_where', array( &$this, $args ) );
			} else {
				$query = new WP_Query( $args );
				$posts = $query->get_posts();
			}

			foreach ( $posts as $post ) {
				$this->populateResults( $post );
				
			}
		}
	}
}
