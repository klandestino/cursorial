<?php

/*
Plugin Name: Cursorial
Plugin URI: https://github.com/klandestino/cursorial
Description: Create custom loops with an easy drag-and-drop interface.
Version: 0.9
Author: Klandestino
Author URI: http://klandestino.se
License: GPLv2
*/

/*
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

/**
 * This plugin is not a stand-alone script. Fail if this is loaded
 * outside Wordpress.
 */
if ( ! function_exists( 'add_action' ) ) {
	echo "Hi there! I'm just a plugin, not much I can do when called directly.";
	exit;
}

/**
 * Define plugin constants
 */
define( 'CURSORIAL_VERSION', '0.9' );
define( 'CURSORIAL_PLUGIN_DIR_NAME', dirname( plugin_basename( $plugin ) ) );
define( 'CURSORIAL_PLUGIN_URL', plugin_dir_url( plugin_basename( $plugin ) ) );
define( 'CURSORIAL_TEMPLATE_DIR', dirname( __FILE__ ) . '/templates' );

/**
 * Inlude and define a global cursorial object
 */
require_once( dirname( __FILE__ ) . '/cursorial.class.php' );
require_once( dirname( __FILE__ ) . '/cursorial_block.class.php' );
require_once( dirname( __FILE__ ) . '/cursorial_admin.class.php' );
require_once( dirname( __FILE__ ) . '/cursorial_query.class.php' );

$cursorial = new Cursorial();

/**
 * If we're working in the administration interface we need the 
 * administration code.
 */
if ( is_admin() ) {
	require_once( dirname( __FILE__ ) . '/admin.php' );
}

/**
 * Wrapper for Cursorial::register
 * @see Cursorial::register
 * @return void
 */
function register_cursorial( $block_args, $admin_args ) {
	global $cursorial;
	$cursorial->register( $block_args, $admin_args );
}

/**
 * Runs query_posts with cursorial-block-arguments from Cursorial_Query::get_block_query_args
 * @see Cursorial_Query::get_block_query_args
 * @param string $block_name The name of the block
 * @return object
 */
function query_cursorial_posts( $block_name ) {
	query_posts( Cursorial_Query::get_block_query_args( $block_name ) );
}

/**
 * Wrapper for Cursorial::get_image
 * Image tag for cursorial images
 * @param string $size The size of the image
 * @param array $attr Image attributes
 * @return string
 */
function get_the_cursorial_image( $size = 'medium', $attr = array() ) {
	global $post, $cursorial;
	return $cursorial->get_image( $post, $size, $attr );
}

/**
 * Wrapper for Cursorial_Block::get_loop
 * @param string $block_name The block to render
 * @return void
 */
function get_cursorial_block( $block_name ) {
	global $cursorial;
	if ( isset( $cursorial->blocks[ $block_name ] ) ) {
		$cursorial->blocks[ $block_name ]->get_loop();
	}
}

/**
 * Wrapper for get_the_cursorial_image
 * This echoes the image-tag instead of returning it.
 * @param string $size Size of the image
 * @param array $attr Attributes for the image tag
 * @return void
 */
function the_cursorial_image( $size = 'medium', $attr = array() ) {
	echo get_the_cursorial_image( $size, $attr );
}

/**
 * Wrapper for Cursorial::is_hidden
 * @param string $field_name Field name
 * @return boolean
 */
function is_cursorial_field_hidden( $field_name ) {
	global $post, $cursorial;
	return $cursorial->is_hidden( property_exists( $post, 'cursorial_ID' ) ? $post->cursorial_ID : $post->ID, $field_name );
}

/**
 * Wrapper for Cursorial::get_depth
 * @return int
 */
function get_the_cursorial_depth() {
	global $post, $cursorial;
	return $cursorial->get_depth( $post );
}

/**
 * An echo-wrapper for get_the_cursorial_depth
 * @return void
 */
function the_cursorial_depth() {
	echo get_the_cursorial_depth();
}

// Add the plugin initiator function to Wordpress
add_action( 'init', array( $cursorial, 'init' ) );

// Add the plugin action for wp_head
add_action( 'wp_head', array( $cursorial, 'head' ) );

// Add content filters
add_action( 'the_post', array( $cursorial, 'the_post' ) );
$cursorial->set_content_filters();
