<?php

/**
 * This file contains all the administrative functions used by Wordpress
 * administration interface to create an interface for cursorial
 * content.
 */

/**
 * Initiates cursorial administration
 * @return void
 */
function cursorial_admin_init() {
}

// Add the plugin administration initiator function to Wordpress
add_action( 'admin_init', 'cursorial_admin_init' );
