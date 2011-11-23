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
	function __construct( $cursorial, $name, $label, $args = array() ) {
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

}
