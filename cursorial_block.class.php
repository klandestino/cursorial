<?php

/**
 * Class for cursorial blocks
 */
class Cursorial_Block {

	// PRIVATE PROPERTIES

	/**
	 * The cursorial
	 */
	private $cursorial;

	/**
	 * Block settings
	 */
	private $settings;
	
	// CONSTRUCTOR

	/**
	 * Constructs the Block
	 * @param object $cursorial
	 * @param string $name An unique name used to identify your block.
	 */
	function __construct( $cursorial, $name ) {
		$this->cursorial = $cursorial;
		$this->settings = array( 'name' => $name );
	}

	// OVERLOADING

	/**
	 * Getter
	 * @param string $property The name of the property
	 * @return mixed
	 */
	public function __get( $property ) {
		if ( array_key_exists( $property, $this->settings ) ) {
			return $this->settings[ $property ];
		}

		return null;
	}

	// PUBLIC METHODS

	/**
	 * Sets blocks settings
	 * @param array $settings The settings
	 * @return void
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Add settings / merges current settings with specified settings
	 * @param array $settings The settings
	 * @return void
	 */
	public function add_settings( $settings ) {
		$this->settings = array_merge( $this->settings, $settings );
	}

	/**
	 * Get posts from block
	 * @return array
	 */
	public function get_posts() {
		$query = new Cursorial_Query();
		$query->block( $this->name );
		return $query->results;
	}

	/**
	 * Fills block with specified posts
	 * @param array $posts An array with post-ids
	 * @return void
	 */
	public function set_posts( $posts ) {
		global $user_ID;
		get_currentuserinfo();

		// Delete all current posts
		$this->remove_posts();

		// Order is defined by date/time. We begin with now and subtract a second for each
		// new post below.
		$time = current_time( 'timestamp' );
		$count = 0;
		$keep = array();

		foreach( $posts as $ref_id ) {
			$post = get_post( $ref_id );

			if ( ! empty( $post ) ) {
				$new_id = wp_insert_post( array(
					'post_type' => Cursorial::POST_TYPE,
					'post_title' => '-',
					'post_content' => '-',
					'post_author' => $user_ID,
					'post_status' => 'publish',
					'post_date' => date( 'Y-m-d H:i:s', $time ),
					'menu_order' => $count
				) );

				add_post_meta( $new_id, 'cursorial-post-id', $ref_id, true );
				wp_set_post_terms( $new_id, $this->name, Cursorial::TAXONOMY, false );

				$time--;
				$count++;
				$keep[] = $new_id;
			}
		}
	}

	/**
	 * Remove all posts
	 * @return void
	 */
	public function remove_posts() {
		foreach ( $this->get_posts() as $post ) {
			wp_delete_post( $post->cursorial_ID, true );
		}
	}

}
