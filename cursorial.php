<?php

/*
Plugin Name: Cursorial
Plugin URI: https://github.com/klandestino/cursorial
Description: Wordpress Plugin
Version: 0.1
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
define( 'CURSORIAL_VERSION', '0.1' );
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

// Add the plugin initiator function to Wordpress
add_action( 'init', array( $cursorial, 'init' ) );

// Add the plugin action for wp_head
add_action( 'wp_head', array( $cursorial, 'head' ) );

// Add content filters for cursorial content type
add_filter( 'the_title', array( $cursorial, 'the_title' ) );
