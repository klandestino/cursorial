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
define( 'CURSORIAL_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Inlude and define a global cursorial object
 */
require_once( dirname( __FILE__ ) . '/cursorial.class.php' );
$cursorial = new Cursorial();

/**
 * If we're working in the administration interface we need the 
 * administration code.
 */
if ( is_admin() ) {
	require_once( dirname( __FILE__ ) . '/admin.php' );
}

// Add the plugin initiator function to Wordpress
add_action( 'init', array( $cursorial, 'init' ) );
