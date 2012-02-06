<?php

/**
 * The general plugin class
 */
class Cursorial {

	// CONSTANTS
	const POST_TYPE = 'cursorial';
	const TAXONOMY = 'cursorial_block';

	// PUBLIC PROPERTIES

	/**
	 * Array with available blocks defined by self::register()
	 * @see Cursorial::register
	 */
	public $blocks;

	/**
	 * Array with admin-specs defined by self::register()
	 * @see Cursorial::register
	 */
	public $admin;

	/**
	 * If set to true, all content will be displayd even if
	 * it's set to be hidden.
	 */
	public $prevent_hidden = false;

	// PRIVATE PROPERTIES

	/**
	 * Here is the current post.
	 * the_title, the_content etc. are often called together and therefore it
	 * could be smart to store the data locally instead of getting it everytime
	 * we need it.
	 */
	private $current_original;

	// CONSTRUCTOR

	/**
	 * Constructs Cursorial plugin object
	 */
	function __construct() {
		$this->blocks = array();
		$this->admin = array();
	}

	// PUBLIC METHODS

	/**
	 * Initiates the Cursorial plugin.
	 * @see add_action
	 * @return void
	 */
	public function init() {
		$this->register_post_type();
		load_plugin_textdomain( 'cursorial', false, CURSORIAL_PLUGIN_DIR_NAME . '/languages' );
	}

	/**
	 * Initiates the administration
	 * @see add_action
	 * @return void
	 */
	public function admin_init() {
		wp_enqueue_script(
			'jquery-cursorial',
			CURSORIAL_PLUGIN_URL . 'js/jquery.cursorial.js',
			array(
				'jquery',
				'jquery-ui-sortable',
				'jquery-ui-draggable',
				'jquery-ui-droppable',
				'thickbox'
			)
		);

		wp_enqueue_style(
			'cursorial-admin',
			CURSORIAL_PLUGIN_URL . 'css/admin.css',
			array(
				'thickbox'
			)
		);
	}

	/**
	 * Add administration pages
	 * @see add_action
	 * @return void
	 */
	public function admin_menu() {
		if ( count( $this->admin ) ) {
			add_menu_page(
				'Cursorial',
				'Cursorial',
				'manage_options',
				'cursorial',
				array( $this, 'admin_page' )
			);

			$first = true;
			foreach ( $this->admin as $admin ) {
				add_submenu_page(
					'cursorial',
					sprintf( __( 'Edit cursorial blocks in %s', 'cursorial' ), $admin->label ),
					$admin->label,
					'manage_options',
					$first ? 'cursorial' : sanitize_title( $admin->label ),
					array( $admin, 'admin_page' )
				);
				$first = false;
			}
		}
	}

	/**
	 * Insert code into the header tag <head>
	 * @see add_action
	 * @return void
	 */
	public function head() {
		?><script language="javascript" type="text/javascript">
			//<![CDATA[
			var CURSORIAL_PLUGIN_URL = '<?php echo CURSORIAL_PLUGIN_URL; ?>';
			var cursorial_i18n = function( str ) {
				var i18n = {};
				i18n[ 'Set featured image' ] = "<?php echo esc_attr( __( 'Set featured image', 'cursorial' ) ); ?>";
				i18n[ 'Show content' ] = "<?php echo esc_attr( __( 'Show content', 'cursorial' ) ); ?>";
				i18n[ 'Hide content' ] = "<?php echo esc_attr( __( 'Hide content', 'cursorial' ) ); ?>";
				i18n[ 'Visible:' ] = "<?php echo esc_attr( __( 'Visible:', 'cursorial' ) ); ?>";
				i18n[ 'post title' ] = "<?php echo esc_attr( __( 'post title', 'cursorial' ) ); ?>";
				i18n[ 'image' ] = "<?php echo esc_attr( __( 'image', 'cursorial' ) ); ?>";
				i18n[ 'post excerpt' ] = "<?php echo esc_attr( __( 'post excerpt', 'cursorial' ) ); ?>";
				i18n[ 'post content' ] = "<?php echo esc_attr( __( 'post content', 'cursorial' ) ); ?>";
				i18n[ 'post date' ] = "<?php echo esc_attr( __( 'post date', 'cursorial' ) ); ?>";
				i18n[ '%s has some unsaved changes.' ] = "<?php echo esc_attr( __( '%s has some unsaved changes.', 'cursorial' ) ); ?>";
				i18n[ 'You need to save this block before you can change image.' ] = "<?php echo esc_attr( __( 'You need to save this block before you can change image.', 'cursorial' ) ); ?>";
				if ( typeof( i18n[ str ] ) != 'undefined' ) {
					return i18n[ str ];
				} else {
					return str;
				}
			};
			//]]>
		</script><?php
	}

	/**
	 * Registers an area for placing content.
	 * @param array $block_args Arguments
	 * 'main-feed' => array(
	 *	'label' => __( 'Stuff you must read' ),
	 *	'max' => 4, // Maximum amount of posts
	 *	'post_type' => array( 'page', 'post' ), // Limit posts in the feed with specified post types
	 *	'childs' => array( // Related content, child-post support
	 *		'max' => 2,
	 *		'post_type' => 'page', // Limit child posts by post type
	 *		'fields' => array( // Fields added here is shown in admin and can set to be overridable
	 *											 // and/or optional/required to be added into the block
	 *			'post_title' => array( // Post field
	 *				'optional' => false, // If field is optional or required
	 *				'overridable' => true // If field can be overrided with custom content
	 *			)
	 *		)
	 *	),
	 *	'fields' => array(
	 *		'post_title' => array(
	 *			'optional' => false,
	 *			'overridable' => true
	 *		),
	 *		'image' => array(
	 *			'optional' => true,
	 *			'overridable' => true
	 *		)
	 *	)
	 * ),
	 * 'second-feed' => array(
	 *	'max' => 4,
	 *	'fields' => array(
	 *		'post_title' => array(
	 *			'optional' => false,
	 *			'overridable' => true
	 *		)
	 *	)
	 * )
	 * @param array $admin_args Administration arguments
	 * __( 'Home feeds' ) => array(
	 *	'main-feed' => array(
	 *		'x' => 0, // Column position
	 *		'y' => 0, // Row position
	 *		'width' => 2, // Width in columns
	 *		'height' => 7 // Height in rows
	 *	),
	 *	'second-feed' => array(
	 *		'x' => 2,
	 *		'y' => 0,
	 *		'width' => 1,
	 *		'height' => 7
	 *	)
	 * ),
	 * __( 'Sub page feeds' ) => array(
	 *	'_dummy' => array( // Dummy used to show other non-cursorial content
	 *		'x' => 0,
	 *		'y' => 0,
	 *		'width' => 2,
	 *		'height' => 7,
	 *		'dummy-title' => __( 'Banner list' ),
	 *		'dummy-description' => __( 'Some banners' )
	 * 	),
	 *	'second-feed' => array(
	 *		'x' => 2,
	 *		'y' => 0,
	 *		'width' => 1,
	 *		'height' => 7
	 *	)
	 * )
	 * @return void
	 */
	public function register( $block_args, $admin_args ) {
		foreach( $block_args as $name => $settings ) {
			if ( ! isset( $this->blocks[ name ] ) ) {
				$this->blocks[ $name ] = new Cursorial_Block( $this, $name );
			}

			$this->blocks[ $name ]->add_settings( $settings );
		}

		foreach( $admin_args as $label => $blocks ) {
			if ( ! isset( $this->admin[ $label ] ) ) {
				$this->admin[ $label ] = new Cursorial_Admin( $this, $label );
			}

			$this->admin[ $label ]->add_blocks( $blocks );
		}
	}

	/**
	 * Renders a administration page
	 * @return void
	 */
	public function admin_page() {
		$this->get_template( 'cursorial-admin-index' );
	}

	/**
	 * Locates and loads a template by using Wordpress locate_template.
	 * If no template is found, it loads a template from this plugins template
	 * directory.
	 * @see locate_template
	 * @param string $slug
	 * @param string $name
	 * @return void
	 */
	public function get_template( $slug, $name = '' ) {
		$template_names = array(
			$slug . '-' . $name . '.php',
			$slug . '.php'
		);

		$located = locate_template( $template_names );

		if ( empty( $located ) ) {
			foreach( $template_names as $name ) {
				if ( file_exists( CURSORIAL_TEMPLATE_DIR . '/' . $name ) ) {
					load_template( CURSORIAL_TEMPLATE_DIR . '/' . $name, false );
					return;
				}
			}
		} else {
			load_template( $located, false );
		}
	}

	/**
	 * If specified field is set to be hidden or not.
	 * @param int $post_id Cursorial posts ID
	 * @param string $field_name Field name
	 * @return boolean
	 */
	public function is_hidden( $post_id, $field_name ) {
		if ( ! $this->prevent_hidden ) {
			$hiddens = get_post_meta( $post_id, 'cursorial-post-hidden-fields', true );
			if ( is_array( $hiddens ) ) {
				if ( in_array( $field_name, $hiddens ) ) {
					return true;
				}
			}

			$depth = ( int ) get_post_meta( $post_id, 'cursorial-post-depth', true );
			$block = strip_tags( get_the_term_list( $post_id, self::TAXONOMY, '', '', '' ) );
			$fields = array();

			if ( isset( $this->blocks[ $block ] ) ) {
				if ( is_array( $this->blocks[ $block ]->fields ) ) {
					$fields = $this->blocks[ $block ]->fields;
				}

				if ( $depth ) {
					if ( is_array( $this->blocks[ $block ]->childs ) ) {
						if ( is_array( $this->blocks[ $block ]->childs[ 'fields' ] ) ) {
							$fields = $this->blocks[ $block ]->childs[ 'fields' ];
						}
					}
				}
			}

			if ( count( $fields ) && ! isset( $fields[ $field_name ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Image tag for cursorial images
	 * @param object $post The post to get image from
	 * @param string $size The size of the image
	 * @param array $attr Image attributes
	 * @return string
	 */
	public function get_image( $post, $size = 'medium', $attr = array() ) {
		if ( is_object( $post ) ) {
			$post_id = property_exists( $post, 'cursorial_ID' ) ? $post->cursorial_ID : $post->ID;

			if ( $this->is_hidden( $post_id, 'image' ) ) {
				return '';
			}

			$image_id = apply_filters( 'cursorial_image_id', get_post_thumbnail_id( $post_id ) );

			if ( ! empty( $image_id ) ) {
				$image_src = wp_get_attachment_image_src( $image_id, $size );

				if ( ! empty( $image_src ) ) {
					$attr_str = '';
					$classes = '';

					foreach( $attr as $attr_name => $attr_val ) {
						if ( $attr_name == 'class' ) {
							$classes .= ' ' . $attr_val;
						} elseif ( $attr_name != 'src' && $attr_name != 'width' && $attr_name != 'height' ) {
							$attr_str .= ' ' . $attr_name . '="' . esc_attr( $attr_val ) . '"';
						}
					}

					return sprintf(
						'<img src="%s" width="%s" height="%s" class="wp-post-image attachment-%s%s"%s/>',
						$image_src[ 0 ], $image_src[ 1 ], $image[ 2 ], $size, $classes, $attr_str
					);
				}
			}
		}

		return '';
	}

	/**
	 * Get the depth of a cursorial post and applies the cursorial_depth-filter
	 * @param object $post The post to get depth from
	 * @return int
	 */
	public function get_depth( $post ) {
		if ( is_object( $post ) ) {
			return apply_filters( 'cursorial_depth', ( int ) get_post_meta( property_exists( $post, 'cursorial_ID' ) ? $post->cursorial_ID : $post->ID, 'cursorial-post-depth', true ) );
		}

		return 0;
	}

	/**
	 * Action hook that adds data to the $post-object if it's a cursorial-post.
	 * It replaces the ID property with the original and stores the
	 * cursorial post id in cursorial_ID. The original post type is stored
	 * in cursorial_post_type.
	 * @param object $post The post reference
	 * @return void
	 */
	public function the_post( $post ) {
		// If this post has a cursorial-post-id stored as meta-data and is a cursorial post
		// type, then replace post-id with the real post id.
		$ref_id = get_post_meta( $post->ID, 'cursorial-post-id', true );
		if ( $ref_id && $post->post_type == Cursorial::POST_TYPE ) {
			$post->cursorial_ID = $post->ID;
			$post->ID = $ref_id;

			$original = $this->get_original( $post->cursorial_ID );
			if ( $original ) {
				$post->cursorial_post_type = $original->post_type;
			}
		}
	}

	/**
	 * Add content filters
	 * @return void
	 */
	public function set_content_filters() {
		foreach( array(
			'the_title',
			'the_date',
			'the_author',
			'the_excerpt',
			'the_content',
			'the_permalink',
			'cursorial_image_id'
		) as $filter ) {
			add_filter( $filter, array( $this, $filter . '_filter' ) );
		}
	}

	/**
	 * Content filter
	 * Replaces the title with the original title unless there's an override
	 * @see add_filter
	 * @param string $title Post title
	 * @return string
	 */
	public function the_title_filter( $title ) {
		return $this->replace_content( $title, 'post_title' );
	}

	/**
	 * Content filter
	 * Replaces the date the original date unless there's an override
	 *cursorial @see add_filter
	 * @param string $date Post date
	 * @return string
	 */
	public function the_date_filter( $date ) {
		return $this->replace_content( $date, 'post_date', true );
	}

	/**
	 * Content filter
	 * Replaces the author the original author unless there's an override
	 * @see add_filter
	 * @param string $author Post author
	 * @return string
	 */
	public function the_author_filter( $author ) {
		return $this->replace_content( $author, 'post_author' );
	}

	/**
	 * Content filter
	 * Replaces the excerpt the original excerpt unless there's an override.
	 * This filter will also strip images.
	 * @see add_filter
	 * @param string $excerpt Post excerpt
	 * @return string
	 */
	public function the_excerpt_filter( $excerpt ) {
		global $id;

		$excerpt = $this->replace_content( $excerpt, 'post_excerpt' );

		if ( empty( $excerpt ) && ! $this->is_hidden( $id, 'post_excerpt' ) ) {
			$hidden = $this->prevent_hidden;
			$this->prevent_hidden = true;
			$excerpt = apply_filters( 'get_the_excerpt', '' );
			$this->prevent_hidden = $hidden;
		}

		/*if ( $this->get_original( $id ) ) {
			// Strip images
			$excerpt = preg_replace( '/<img [^>]+>/i', '', $excerpt );
			// Images can be wrapped in links, strip empty links
			$excerpt = preg_replace( '/<a [^>]+><\/a>/i', '', $excerpt );
		}*/

		// Okidok
		return $excerpt;
	}

	/**
	 * Content filter
	 * Replaces the content the original content unless there's an override
	 * @see add_filter
	 * @param string $content Post content
	 * @return string
	 */
	public function the_content_filter( $content ) {
		return $this->replace_content( $content, 'post_content' );
	}

	/**
	 * Content filter
	 * Replaces the cursorial post permalink with the original
	 * @param string $permalink The permalink
	 * @return string
	 */
	public function the_permalink_filter( $permalink ) {
		global $id;
		$original = $this->get_original( $id );

		if ( $original ) {
			return get_permalink( $original->ID );
		}

		return $permalink;
	}

	/**
	 * Content filter
	 * Retrieves fetaured image or a image from content
	 * @see add_filter
	 * @param int $image_id The image id
	 * @return string
	 */
	public function cursorial_image_id_filter( $image_id ) {
		global $id;

		if ( empty( $image_id ) ) {
			$original = $this->get_original( $id );

			if ( ! $original ) {
				$original = get_post( $id );
			}

			if ( $original ) {
				// Featured images are prioritized
				$image_id = get_post_thumbnail_id( $original->ID );

				// If there was no featured image, try to find an attachment in the post_content
				if ( empty( $image_id ) ) {
					// This expression seems to work quite well. But it will just get images with a wordpress
					// image attachment id defined.
					// I was using SimpleXMLElement before, but it doesn't handle broken html that well and
					// it was a but slower.
					$hidden = $this->prevent_hidden;
					$this->prevent_hidden = true;
					if ( preg_match(
						'/<img [^>]*?class="[^"]*?wp-image-([0-9]+)[^"]*?"[^>]*?>/i',
						apply_filters( 'the_content', $original->post_content ),
						$image_match
					) ) {
						$image_id = $image_match[ 1 ];
					}
					$this->prevent_hidden = $hidden;
				}

				if ( empty( $image_id ) ) {
					// I was thinking of implementing images with just an url, instead of a wordpress attachment id.
					// But I'll leave it for a while.
				}
			}
		}

		return $image_id;
	}

	// PRIVATE METHODS

	/**
	 * Gets the original/reference post
	 * @param int $post_id Cursorial post id
	 * @return object
	 */
	private function get_original( $post_id ) {
		$post = get_post( $post_id );

		$original = null;

		if ( is_object( $post ) ) {
			if ( $post->post_type == self::POST_TYPE ) {
				if ( property_exists( $post, 'cursorial_ID' ) ) {
					$original_id = $post->ID;
				} else {
					$original_id = get_post_meta( $post->ID, 'cursorial-post-id', true );
				}

				if ( is_object( $this->current_original ) ) {
					if ( $this->current_original->ID == $original_id ) {
						$original = $this->current_original;
					}
				}

				if ( ! $original ) {
					$original = get_post( $original_id );
					$this->current_original = $original;
				}
			}
		}

		return $original;
	}

	/**
	 * Content filter
	 * A general content filter. Takes content and replaces
	 * @param string $content The post content
	 * @param string $property The property in the post object to handle
	 * @param boolean $force If property should be replaced even if there's an override
	 * @return string
	 */
	private function replace_content( $content, $property, $force = false ) {
		global $id;

		if ( $this->is_hidden( $id, $property ) ) {
			return '';
		}

		$original = $this->get_original( $id );

		if ( $original ) {
			if ( property_exists( $original, $property ) && ( $force || empty( $content ) || $content == '-' ) ) {
				$content = $original->$property;
			}
		}

		return $content;
	}


	/**
	 * Registers the post-type we use to store all content and a taxonomy
	 * used to locate areas.
	 * @return void
	 */
	private function register_post_type() {
		/**
		 * All content is saved as posts in a plugin-defined post-type.
		 */
		register_post_type(
			self::POST_TYPE,
			array(
				'public' => false
			)
		);

		/**
		 * Every post is connected to a specific area with it's own loop. 
		 * These areas are stored as a taxonomy.
		 */
		register_taxonomy(
			self::TAXONOMY,
			self::POST_TYPE,
			array(
				'labels' => array(
					'name' => __( 'Block', 'cursorial' )
				),
				'public' => false
			)
		);
	}

}
