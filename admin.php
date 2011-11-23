<?php

/**
 * This file contains all the administrative functions used by Wordpress
 * administration interface to create an interface for cursorial
 * content.
 */

/**
 * If this file is loaded outside Cursorial plugin it will fail.
 */
if ( ! isset( $cursorial ) ) {
	echo "Hello! I'm not even a plugin, not even close to much I can do when called directly.";
	exit;
}

// Add the plugin administration initiator function to Wordpress
add_action( 'admin_init', array( $cursorial, 'admin_init' ) );
