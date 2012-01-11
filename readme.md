Cursorial
=========

* Contributors: spurge, redundans, alfred
* Tags: cursorial, content, post, custom, editing, loops
* Requires at least: 3.2.1
* Tested up to: 3.2.1
* Stable tag: 0.9.3
* License: GPLv2

Create custom loops with an easy drag-and-drop interface.

Description
-----------

With this plugin you can create your own
[loops](http://codex.wordpress.org/The_Loop "The Loop « Wordpress Codex")
and manage them with a simple drag-and-drop interface.

Register one or more loops in your theme's `function.php` and then use
them as any other loop in your theme with `have_posts()`, `the_post()`
etc. Editors can then manage these loops in the administration by simply
drag posts to these loops or between them and override the posts content
if they like.

The loops can be configured to

* allow just a limited number of posts,
* to have posts with children (like nested loops),
* make post content overridable and optional
* and be set together in the administration.

### No additional database tables or writeable directories are added

This plugin will simply register a hidden [custom post
type](http://codex.wordpress.org/Post_Types "Post Types « Wordpress
Codex") and a [custom taxonomy](http://codex.wordpress.org/Taxonomies
"Taxonomies « Wordpress Codex"). It's therefore installable/runnable on
the most kinds of web hosts/environments.

Installation
------------

### 1. Install the plugin

Place this plugin in your plugin directory and then activate it.

### 2. Register your loops in the theme's function.php

Use `register_cursorial()` to register loops. This function takes to
arguments. First an array with the loops you want, and then an another
array with information about how your loops will be shown for the
editors.

Here's some lines of code:

	add_action( 'after_setup_theme', 'your_theme_setup' );

	function your_theme_setup() {
		if ( function_exists( 'register_cursorial' ) ) {
			register_cursorial(
				array( // Array with the custom loops
					'main-feed' => array( // The key is the name of the loop
						'label' => __( 'Main Feed' ), // The official label of the loop
						'max' => 2, // The maximum amount of allowed posts
						'childs' => array( // If set, all posts in this loop can have childs
							'max' => 2, // The maximum amount of allowed childs posts
							'fields' => array( // Set the displayable child post field
								'post_title' => array( // The key is the name of the post field
									'optional' => false, // If set to true, the field can be hidden by the editor in the admin
									'overridable' => true // If set to true, the fields content can be overriden by the editor in the admin
								),
								'post_date' => array(
									'optional' => true,
									'overridable' => false
								)
							)
						),
						'fields' => array( // Set the displayable post field
							'post_title' => array(
								'optional' => false,
								'overridable' => true
							),
							'post_excerpt' => array(
								'optional' => false,
								'overridable' => true
							),
							'image' => array( // This field will fetch any image from the post
								'optional' => true,
								'overridable' => true
							)
						)
					),
					'second-feed' => array(
						'label' => __( 'Secondary Feed' ),
						'max' => 4,
						'fields' => array(
							'post_title' => array(
								'optional' => false,
								'overridable' => false
							),
							'post_excerpt' => array(
								'optional' => true,
								'overridable' => true
							),
							'post_date' => array(
								'optional' => false,
								'overridable' => false
							)
						)
					)
					)
				),
				array( // Second argument is an array with some admin config
					__( 'Home' ) => array( // The key is the name of the page where editors can edit specified loops
						'main-feed' => array( // The key is the name of the loop that will be editable
							'x' => 0, // In what column this loop should be placed
							'y' => 0, // In that row this loop should be placed
							'width' => 2, // How many columns this loop is wide
							'height' => 7 // How many rows this loop is tall
						),
						'banner-space-1' => array( // If there's no matched loop with this name, the space will be occupied by a dummy placeholder
							'x' => 2,
							'y' => 0,
							'width' => 1,
							'height' => 2,
							'dummy-title' => __( 'Banners' ), // A customized title
							'dummy-description' => __( 'On front page there are a couple of banners here.' ) // A customized description
						),
						'second-feed' => array(
							'x' => 2,
							'y' => 2,
							'width' => 1,
							'height' => 3
						)
					),
					__( 'Sub pages' ) => array( // Another admin page with a set of loops
						'_dummy' => array(
							'x' => 0,
							'y' => 0,
							'width' => 2,
							'height' => 7,
							'dummy-title' => __( 'Page or post content' ),
							'dummy-description' => __( 'The current page or post content.' )
						),
						'second-feed' => array(
							'x' => 2,
							'y' => 0,
							'width' => 1,
							'height' => 7
						)
					)
				)
			);
		}
	}

### 3. Query the posts

There are two ways to print the posts from your customized loops.

You can embed a loop anywhere in your theme with `query_cursorial_posts()`.
This will work almost exactly as if you used `query_posts()` (see
[reference](http://codex.wordpress.org/Function_Reference/query_posts
"Function Reference/query posts « Wordpress Codex")). The only
difference is that you'll not be able to customize the loop with
arguments. `query_cursorial_posts()` takes only one argument, and that's
the name of the loop that you want to get posts from.

Example:

	<?php query_cursorial_posts( 'main-feed' ); ?>
	<?php while( have_posts() ): the_post(); ?>
		<div class="post">
			<h2><?php the_title(); ?></h2>
			<?php the_cursorial_image(); ?>
			<?php the_excerpt(); ?>
		</div>
	<?php endwhile; ?>

Or why not use another template:

	<?php query_cursorial_posts( 'main-feed' ); ?>
	<?php while( have_posts() ): the_post(); ?>
		<?php get_template_part( 'content', get_post_type() ); ?>
	<?php endwhile; ?>

If you want to place all your custom loop code in some other templates
you can use `get_cursorial_block()`. It will call templates called
`cursorial.php` or `cursorial-LOOP-NAME.php`.

Example:

	// In home.php
	<?php get_cursorial_block( 'main-feed' ); ?>

	// In cursorial-main-feed.php
	<?php while( have_posts() ): the_post(); ?>
		<?php get_template_part( 'content', get_post_type() ); ?>
	<?php endwhile; ?>

Frequently Asked Questions
--------------------------

Screenshot
----------

Changelog
---------

### v0.9

First stable beta release with some of the main features.

* Register blocks with custom feeds and gather them in the administration.
* Search posts in the administration and drag posts into cursorial
	blocks.
* Drag posts between blocks.
* Override posts contents.
* Images will be set by wordpress own image library.
* Posts can be set to have childs.
* Admin pages templates are overridable.
* Loops for displaying block posts are available through both a query
	method and a template fetcher.

### v0.9.1

* Maximum number of posts can be set for both blocks and post childs.

### v0.9.2

* An optional show/hide option on fields.

### v0.9.3

* Administration interface have a saved/unsaved status indicator.
* There's a save all blocks button.
* The jQuery block plugin have some of it's internal function available
	from outside.
* Swedish translation.

### v?

#### Bugfixes

* Deleting posts with childs must also remove childs.
* Image won't change until the block is saved.
* You can't choosa an image override if there's no cursurial
	representative.
* Search seems to get all posts even if they don't match.
* Templates are located but not loaded.
* Default generated excerpt was saved as overrides even if there was no
	difference from the original.

### New features

* Search posts by date.
* First occuring block is used be default is no block is specified in
	get_cursorial_block() and query_cursorial_posts().
* Search result is limited.

Upcoming
--------

### Bugfixes

* Bugs?

### Version 1.0

* Write a user manual in the plugin admin index or remove it.
* Update readme.txt

### v1.1

* An included widget that shows chosen block.
