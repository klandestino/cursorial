<?php

/**
 * Class for cursorial areas
 */
class Cursorial_Area {

	// PRIVATE PROPERTIES

	/**
	 * The cursorial
	 */
	private $cursorial;

	/**
	 * Public properties
	 */
	private $properties;
	
	// CONSTRUCTOR

	/**
	 * Constructs the Area
	 * @param object $cursorial
	 * @param string $name An unique name used to identify your area.
	 * @param string $label A readable label used in the administrative
	 * interface
	 * @param array $args Arguments
	 */
	function __construct( $cursorial, $name, $label = '', $args = array() ) {
		$this->cursorial = $cursorial;
		$this->properties = array(
			'name' => $name,
			'label' => $label,
			'args' => $args
		);
	}

	// OVERLOADING

	/**
	 * Getter
	 * @param string $property The name of the property
	 * @return mixed
	 */
	public function __get( $property ) {
		if ( array_key_exists( $property, $this->properties ) ) {
			return $this->properties[ $property ];
		}

		return null;
	}

	// PUBLIC METHODS

	/**
	 * Generates an admin page
	 * A wrapper for Cursorial_Pages::admin_area
	 * @return void
	 */
	public function admin() {
		$this->cursorial->pages->admin_area( $this );
	}

	/**
	 * Fills area with specified posts
	 * @param array $posts An array with post-ids
	 * @return void
	 */
	public function setPosts( $posts ) {
		// Start with deleting all posts
		$this->removePosts();

		// Order is defined by date/time. We begin with now and subtract a second for each
		// new post below.
		$time = current_time( 'timestamp' );
		$count = 0;

		foreach( $posts as $ref_id ) {
			$new_id = wp_insert_post( array(
				'post_type' => Cursorial::POST_TYPE,
				'post_title' => $ref_id,
				'post_content' => 'Cursorial Post',
				'post_author' => 1,
				'post_status' => 'publish',
				'post_date' => date( 'Y-m-d H:i:s', $time ),
				'menu_order' => $count
			) );

			add_post_meta( $new_id, 'cursorial-post-id', $ref_id, true );
			wp_set_post_terms( $new_id, $this->name, Cursorial::TAXONOMY, false );

			$time++;
			$count++;
		}
	}

	/**
	 * Remove all posts
	 * @return void
	 */
	public function removePosts() {
		$query = new Cursorial_Query();
		foreach ( $query->posts( $this->name ) as $post ) {
			wp_delete_post( $post->ID, true );
		}
	}

}
