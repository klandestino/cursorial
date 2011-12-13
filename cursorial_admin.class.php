<?php

/**
 * Administration pages for collections of blocks
 */
class Cursorial_Admin {

	/**
	 * The Cursorial
	 */
	private $cursorial;

	/**
	 * Administration label
	 */
	public $label;

	/**
	 * The collection of blocks to administrate
	 */
	private $blocks;

	/**
	 * Stores all blocks in a grid
	 */
	private $grid;

	/**
	 * Constructor
	 * @param object $cursorial The Cursorial Object
	 * @param string $label Label of administration page
	 * @return void
	 */
	function __construct( $cursorial, $label ) {
		$this->cursorial = $cursorial;
		$this->label = $label;
		$this->blocks = array();
		$this->grid = array();
	}

	/**
	 * Blocks administration page
	 * @return void
	 */
	public function admin_page() {
		global $cursorial_admin;
		$cursorial_admin = $this;
		$this->cursorial->get_template( 'cursorial-admin-blocks', sanitize_title( $this->label ) );
	}

	/**
	 * Sets the the collection of blocks to administrate
	 * @param array $blocks An array of blocks with administration settings
	 * 'block-name' => array(
	 *	'x' => 0, // Column position
	 *	'y' => 0, // Row position
	 *	'width' => 2, // Width in columns
	 *	'height' => 7 // Height in rows
	 * )
	 * @return void
	 */
	public function set_blocks( $blocks ) {
		$this->blocks = array();
		$this->grid = array();
		$this->add_blocks( $blocks );
	}

	/**
	 * Adds or merges existing blocks with specified
	 * @see self::set_blocks
	 * @param array $blocks Blocks to add or merge
	 * @return void
	 */
	public function add_blocks( $blocks ) {
		foreach( $blocks as $name => $settings ) {
			if ( ! isset( $this->blocks[ $name ] ) ) {
				$this->blocks[ $name ] = ( object ) array(
					'block' => $this->cursorial->blocks[ $name ],
					'settings' => array()
				);
			}

			$this->blocks[ $name ]->settings = array_merge( $this->blocks[ $name ]->settings, $settings );

			// Set default position and dimensions in grid
			foreach( array(
				'y' => $this->rows,
				'x' => $this->cols,
				'width' => 1,
				'height' => 1
			) as $prop => $def ) {
				if ( ! isset( $this->blocks[ $name ]->settings[ $prop ] ) ) {
					$this->blocks[ $name ]->settings[ $prop ] = $def;
				}
			}

			for( $r = 0; $r < $this->blocks[ $name ]->settings[ 'y' ] + $this->blocks[ $name ]->settings[ 'height' ]; $r++ ) {
				for( $c = 0; $c < $this->blocks[ $name ]->settings[ 'x' ] + $this->blocks[ $name ]->settings[ 'width' ]; $c++ ) {
					if ( ! isset( $this->grid[ $r ] ) ) {
						$this->grid[ $r ] = array();
					}

					if ( ! isset( $this->grid[ $r ][ $c ] ) ) {
						$this->grid[ $r ][ $c ] = null;
					}

					if (
						$r >= $this->blocks[ $name ]->settings[ 'y' ]
						&& $r <= $this->blocks[ $name ]->settings[ 'y' ] + $this->blocks[ $name ]->settings[ 'height' ]
						&& $c >= $this->blocks[ $name ]->settings[ 'x' ]
						&& $c <= $this->blocks[ $name ]->settings[ 'x' ] + $this->blocks[ $name ]->settings[ 'width' ]
					) {
						$this->grid[ $r ][ $c ] = $this->blocks[ $name ];
					}
				}
			}
		}
	}

	/**
	 * Get an array with blocks
	 * @return array
	 */
	public function get_blocks() {
		return $this->blocks;
	}

	/**
	 * Get block by grid
	 * @param int $row Row
	 * @param int $col Column
	 * @return object
	 */
	public function get_grid( $row, $col ) {
		if ( isset( $this->grid[ $row ] ) ) {
			if ( isset( $this->grid[ $row ][ $col ] ) ) {
				return $this->grid[ $row ][ $col ];
			}
		}

		return null;
	}

	/**
	 * Get total number of rows in grid
	 * @return int
	 */
	public function get_rows() {
		return count( $this->grid );
	}

	/**
	 * Get total number of columns in grid
	 * @return int
	 */
	public function get_cols() {
		return isset( $this->grid[ 0 ] ) ? count( $this->grid[ 0 ] ) : 0;
	}

}
