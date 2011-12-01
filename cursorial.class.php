<?php

/**
 * The general plugin class
 */
class Cursorial {

	// CONSTANTS
	const POST_TYPE = 'cursorial';
	const TAXONOMY = 'cursorial_area';

	// PUBLIC PROPERTIES

	/**
	 * Object with Wordpress pages Cursorial_Pages
	 */
	public $pages;

	/**
	 * Array with available areas defined by self::register_area()
	 * @see Cursorial::register_area
	 */
	public $areas;

	// CONSTRUCTOR

	/**
	 * Constructs Cursorial plugin object
	 */
	function __construct() {
		$this->pages = new Cursorial_Pages();
		$this->areas = array();
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
			'cursorial-admin',
			CURSORIAL_PLUGIN_URL . 'js/admin.js',
			array(
				'jquery',
				'jquery-form',
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
			array( $this->pages, 'admin' )
		);

		foreach ( $this->areas as $area ) {
			add_submenu_page(
				'cursorial',
				sprintf( __( 'Edit cursorial area %s', 'cursorial' ), $area->label ),
				$area->label,
				'manage_options',
				$area->name,
				array( $area, 'admin' )
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
	 * @param string $name An unique name used to identify your area.
	 * @param string $label A readable label used in the administrative
	 * interface
	 * @param array $args Arguments
	 * @return void
	 */
	public function register_area( $name, $label, $args ) {
		$this->areas[ $name ] = new Cursorial_Area( $this, $name, $label, $args );
	}

	// PRIVATE METHODS

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
