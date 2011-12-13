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
		load_theme_textdomain( 'cursorial', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
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
				'jquery-ui-droppable'
			)
		);

		wp_enqueue_style(
			'cursorial-admin',
			CURSORIAL_PLUGIN_URL . 'css/admin.css',
			array(
				'widgets'
			)
		);
	}

	/**
	 * Add administration pages
	 * @see add_action
	 * @return void
	 */
	public function admin_menu() {
		add_menu_page(
			'Cursorial',
			'Cursorial',
			'manage_options',
			'cursorial',
			array( $this, 'admin_page' )
		);

		foreach ( $this->admin as $admin ) {
			add_submenu_page(
				'cursorial',
				sprintf( __( 'Edit cursorial area %s', 'cursorial' ), $admin->label ),
				$admin->label,
				'manage_options',
				sanitize_title( $admin->label ),
				array( $admin, 'admin_page' )
			);
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
			//]]>
		</script><?php
	}

	/**
	 * Registers an area for placing content.
	 * @param array $block_args Arguments
	 * 'main-feed' => array(
	 *	'label' => __( 'Stuff you must read' ),
	 *	'max' => 4, // Maximum amount of posts
	 *	'related' => array( // Related content, child-post support
	 *		'post_types' => array( 'post' ), // Version 2
	 *		'max' => 2,
	 *		'show' => array( // What to show
	 *			'title' => array( // Post field
	 *				'optional' => false, // If field is optional or required
	 *				'overridable' => true // If field can be overrided with custom content
	 *			)
	 *		)
	 *	),
	 *	'show' => array(
	 *		'title' => array(
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
	 *	'show' => array(
	 *		'title' => array(
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
	 *	'_dummy' => array( // Dummy to occupy space
	 *		'x' => 0,
	 *		'y' => 0,
	 *		'width' => 2,
	 *		'height' => 7,
	 *		'dummy-block' => true, // Determines dummy status
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
					load_template( CURSORIAL_TEMPLATE_DIR . '/' . $name, true );
					return;
				}
			}
		}
	}

	/**
	 * Content filter
	 * Replaces the title with the original title unless there's an override
	 * @see add_filter
	 * @param string $title Post title
	 * @return string
	 */
	public function the_title( $title ) {
		return $this->replace_content( $title, 'title' );
	}

	// PRIVATE METHODS

	/**
	 * Content filter
	 * A general content filter. Takes content and replaces
	 */
	private function replace_content( $content, $property ) {
		global $id;
		$post = $_GLOBALS[ 'post' ];

		if ( empty( $content ) && ( is_object( $post ) || ! empty( $id ) ) ) {
			$property = 'post_' . $property;

			if ( ! is_object( $post ) ) {
				$post = get_post( $id );
			}

			if ( $post->post_type == self::POST_TYPE && property_exists( $post, $property ) ) {
				$original_id = get_post_meta( $post->ID, 'cursorial-post-id', true );
				$original = null;

				if ( is_object( $this->current_original ) ) {
					if ( $this->current_original->ID == $original_id ) {
						$original = $this->current_original;
					}
				}

				if ( ! $original ) {
					$original = get_post( $original_id );
					$this->current_original = $original;
				}

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
					'name' => __( 'Area', 'cursorial' )
				),
				'public' => false
			)
		);
	}

}
