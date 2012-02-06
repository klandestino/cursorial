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
	 * Get all settings in an array
	 * @return array
	 */
	public function get_settings() {
		return $this->settings;
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
		global $user_ID, $id;
		get_currentuserinfo();

		// Delete all current posts
		$this->remove_posts();

		// Order is defined by date/time. We begin with now and subtract a second for each
		// new post below.
		$time = current_time( 'timestamp' );
		$count = 0;

		foreach( $posts as $post_data ) {
			$post = null;

			if ( array_key_exists( 'id', $post_data ) ) {
				$ref_id = $post_data[ 'id' ];
				$post = get_post( $ref_id );
				setup_postdata( &$post );
			}

			if ( ! empty( $post ) ) {
				$fields = array(
					'post_title' => '-',
					'post_content' => ''
				);

				/**
				 * This is really not the best way to do this. But if the cursorial content will
				 * override the reference post content. The overriding content is saved as content
				 * to the cursorial post. But how this is controlled is not that good.
				 * Saved content are matched with posted content. If mismatch, the content is saved,
				 * otherwise fetched from the reference through filters. In this way it's very
				 * difficult to control where the content comes from in this plugins many layers.
				 * In admin it whould be nice to hace a revert-button. How is this possible with
				 * this solution? I need to rewrite this later on... Now it has be get finished.
				 */

				$post->post_excerpt = apply_filters( 'the_excerpt', $post->post_excerpt );
				$post->post_content = apply_filters( 'the_content', $post->post_content );

				// Stores the visibility for fields
				$hidden_fields = array();

				foreach( $post_data as $field_name => $field ) {
					if ( $field_name != 'id' && property_exists( $post, $field_name ) ) {
						if ( trim( strip_tags( $post->$field_name ) ) != trim( strip_tags( stripslashes( $field ) ) ) ) {
							$fields[ $field_name ] = trim( $field );
						}
					}

					if ( isset( $post_data[ $field_name . '_hidden' ] ) ) {
						$hidden_fields[] = $field_name;
					}
				}

				$fields = array_merge( $fields, array(
					'post_type' => Cursorial::POST_TYPE,
					'post_author' => $user_ID,
					'post_status' => 'publish',
					'post_date' => date( 'Y-m-d H:i:s', $time ),
					'menu_order' => $count
				) );

				$new_id = wp_insert_post( $fields );

				add_post_meta( $new_id, 'cursorial-post-id', $ref_id, true );
				add_post_meta( $new_id, 'cursorial-post-depth', isset( $post_data[ 'depth' ] ) ? $post_data[ 'depth' ] : 0, true );
				add_post_meta( $new_id, 'cursorial-post-hidden-fields', $hidden_fields, true );
				wp_set_post_terms( $new_id, $this->name, Cursorial::TAXONOMY, false );

				if ( isset( $post_data[ 'image' ] ) ) {
					$id = $new_id;
					$image = apply_filters( 'cursorial_image_id', get_post_thumbnail_id( $ref_id ) );
					if ( trim( $image ) != trim( $post_data[ 'image' ] ) ) {
						set_post_thumbnail( $new_id, $post_data[ 'image' ] );
					}
				}

				$time--;
				$count++;
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

	/**
	 * Creates a wp_query and does a loop with template named
	 * cursorial.php or cursorial-{block-name}.php
	 * @return void
	 */
	public function get_loop() {
		query_posts( Cursorial_Query::get_block_query_args( $this->name ) );
		$this->cursorial->get_template( 'cursorial', $this->name );
	}

}
