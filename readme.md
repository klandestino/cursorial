Cursorial
=========

* Contributors: spurge, redundans, alfreddatakillen
* Tags: cursorial, content, post, custom, editing, loops, widget
* Requires at least: 3.2.1
* Tested up to: 3.3.1
* Stable tag: 1.1
* License: GPLv2

Create custom loops and edit it's posts with an easy drag-and-drop
interface. Override the post's title, content, excerpt and images. Then
display the loops' posts with a widget or a theme template file.

Description
-----------

With this plugin you can create your own
[loops](http://codex.wordpress.org/The_Loop "The Loop « Wordpress Codex")
and manage them with a simple drag-and-drop interface.

Register one or more loops in your theme's `function.php` and then use
them as any other loop in your theme with `have_posts()`, `the_post()`
etc. Editors can then manage these loops in the administration by simply
drag posts to these loops or between them and override the posts' content
if they like. They'll find posts in a search box just next to the loops.

**The loops can be configured to ...**

* allow just a limited number of posts,
* allow just a specified set of post types,
* to have posts with children (like nested loops, related content etc),
* make posts' content overrideable and optional,
* be set together in the administration,
* and use images fetched from content or the featured image.

**This plugin also comes with a widget that ...**

* displays a registered loop
* or creates one for you.

### No additional database tables or writeable directories are added

This plugin will simply register a hidden [custom post
type](http://codex.wordpress.org/Post_Types "Post Types « Wordpress
Codex") and a [custom taxonomy](http://codex.wordpress.org/Taxonomies
"Taxonomies « Wordpress Codex"). It's therefore installable/runnable on
most kinds of web hosts/environments.

### More info, wiki and issue tracker

https://github.com/klandestino/cursorial

Installation
------------

### 1. Install the plugin

You can install Cursorial using the built in Wordpress plugin
installer. If you wish to install Cursorial manually, make sure
you've uploaded the plugin to `wp-content/plugins/cursorial`.

Activate the plugin in the _Plugins_ admin panel using the _Activate_
link. You'll then be able to register your loops and use the widget that
follows with this plugin.

### 2. How to use the widget

Drag the _Cursorial Widget_ to any preferable sidebar in _Widget_ admin
panel found in _Appearence_. You'll then see a list of available
loops, called blocks, if you've registered any. If not, you'll be able
to create one for the current widget by checking the _Custom block_
radio button. You can set the maximum number of posts and what fields
that will be available.

All widget-created blocks are then found in the _Custom Widget Blocks_
admin panel found in the _Cursorial_ menu.

### 3. Register your loops in the theme's function.php

Use `register_cursorial()` to register loops. This function takes two
arguments. First an array with the loops you want, and then another
array with information about how your loops will be shown for the
editors in the administration.

Here's some lines of code:

	add_action( 'after_setup_theme', 'your_theme_setup' );

	function your_theme_setup() {
		if ( function_exists( 'register_cursorial' ) ) {
			register_cursorial(
				array( // Array with the custom loops
					'main-feed' => array( // The key is the name of the loop
						'label' => __( 'Main Feed' ), // The official label of the loop
						'max' => 2, // The maximum amount of allowed posts
						'post_type' => array( 'page' ), // Limit posts with post type. Can be defined as an array or a string
						'childs' => array( // If set, all posts in this loop can have childs
							'max' => 2, // The maximum amount of allowed childs posts
							'post_type' => 'post', // Limit child posts with post type
							'fields' => array( // Set the displayable child post field
								'post_title' => array( // The key is the name of the post field
									'optional' => false, // If set to true, the field can be hidden by the editor in the admin
									'overridable' => true // If set to true, the field's content can be overridden by the editor in the admin
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
							'image' => array( // This field will fetch the first occuring image from the post
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

### 4. Query the posts

There are two ways to print the posts from your customized loops.

You can embed a loop anywhere in your theme with `query_cursorial_posts()`.
This will work almost exactly as if you used `query_posts()` (see
[reference](http://codex.wordpress.org/Function_Reference/query_posts
"Function Reference/query posts « Wordpress Codex")). The only
difference is that you'll not be able to customize the loop with
arguments. `query_cursorial_posts()` takes only one argument, and that's
the name of the loop that you want to get posts from. If you omit this
argument, the function will query posts from the first occuring
registered loop.

Example:

	<?php query_cursorial_posts( 'main-feed' ); ?>
	<?php while( have_posts() ): the_post(); ?>
		<div class="post">
			<h2><?php the_title(); ?></h2>
			<?php the_cursorial_image(); ?>
			<?php the_excerpt(); ?>
		</div>
	<?php endwhile; ?>

Here with the `get_template_part()`:

	<?php query_cursorial_posts( 'main-feed' ); ?>
	<?php while( have_posts() ): the_post(); ?>
		<?php get_template_part( 'content', get_post_type() ); ?>
	<?php endwhile; ?>

If you want to place all your custom loop code in some other template
files you can use `get_cursorial_block()`. It will call templates
called `cursorial.php` or `cursorial-LOOP-NAME.php`.

Example:

	// In home.php
	<?php get_cursorial_block( 'main-feed' ); ?>

	// In cursorial-main-feed.php
	<?php while( have_posts() ): the_post(); ?>
		<?php get_template_part( 'content', get_post_type() ); ?>
	<?php endwhile; ?>

### 5. Print images, get it's depth and check if a post field is hidden

If you are using the field `image` (witch is a non wordpress field,
added by this plugin), an image is fetched either from a featured image
or the first occuring image in the content. It can then be overrided by
the editor if you set the field to be overrideable. In order to print
this image you need to call `the_cursorial_image()` or
`get_the_cursorial_image()` (witch will return the image tag instead of
printing it).

If you've set a loop to support child posts, then you'll need to know
what posts are childs or not. With `the_cursorial_depth()` and
`get_the_cursorial_depth()` you'll get an integer for what depth the
current post has. 0 for parents and 1 for childs. An important thing to
know is that both parents and childs are found in the same loop. There
are no nested loops of any kind.

If you've set a field to be `optional`, an editor may have hidden some
posts' fields. You'll notice that the template tag for that field will
not return anything. But in some cases you may want to also hide some
HTML that wraps the field. With `is_cursorial_field_hidden( 'field_name'
)` you'll know if the field is set to be hidden.

Example:

	<?php while ( have_posts() ) : the_post(); ?>
		<div class="post<?php echo get_the_cursorial_depth() ? ' post-child' : ' post-parent'; ?>
			<h2><a href="<?php echo esc_url( get_permalink() ); ?>" title="<?php esc_attr( get_the_title() ); ?>"><?php the_title(); ?></a></h2>
			<?php if ( ! is_cursorial_field_hidden( 'image' ) ) : ?>
				<div class="image">
					<?php the_cursorial_image(); ?>
				</div>
			<?php endif; ?>
		</div>
	<?php endwhile; ?>

Frequently Asked Questions
--------------------------

### In what languages are this plugin available?

* English (built-in)
* Svenska

### Can I override the widget output template?

Yep. Create a template in your theme and call it `cursorial-widget.php`.
The loop in the template file is already initiated. You'll just need to
do the while loop like so ...

	<ul>
		<?php
		# In cursorial-widget.php
		while ( have_posts() ) : the_post(); ?>
			<li>
				<h4><a href="<?php echo esc_url( get_permalink() ); ?>" title="<?php echo esc_attr( get_the_title() ); ?>"><?php the_title(); ?></a></h4>
			</li>
		<?php endwhile; ?>
	</ul>

### Can I override the administration templates?

Yes you can.

Create a template in you theme and call it `cursorial-admin-blocks.php`
or `cursorial-admin-blocks-BLOCK-ADMIN-NAME.php`. The BLOCK-ADMIN-NAME
should be replaced by the key for the specified group of blocks in the
admin array in `register_cursorial()`.

The administration functionality is mainly done with some
jQuery-plugins. See ´templates/cursorial-admin-block.php´ in the plugin
directory to see how the jQuery plugins are applied.

Screenshots
-----------

1. An overview of the administration.

Changelog
---------

### v1.1

#### Bugfixes

* Fixed issue with siblings being removed when removing childs.
* Even more content override that might solve some unwanted override
	savings.
* Fixed a javascript error that occured in some cases.

#### New features

* Added widget that displays existing blocks or creates new ones.
* Widget have overridable widget templates for both public use and the admin.
* Support for blocks to limit posts by post-type.

### v1.0.1

#### Bugfixes

* Fixed issue with hidden image selector.
* Posts' order failed in chrome and maybe some other browsers.
* Fixed issue with using the "Insert into Post"-button in image
	selector.

#### New features

* Search queries looks for all post types except cursorials. Thereby you
	can add pages and custom post types to your cursorial loops.

### v1.0

#### Bugfixes

* Deleting posts with childs must also remove childs.
* Image won't change until the block is saved.
* You can't choosa an image override if there's no cursurial
	representative.
* Search seems to get all posts even if they don't match.
* Templates are located but not loaded.
* Default generated excerpt was saved as overrides even if there was no
	difference from the original.

#### New features

* Search posts by date.
* First occuring block is used as default if no block is specified in
	get_cursorial_block() and query_cursorial_posts().
* Search result is limited.

### v0.9.3

* Administration interface have a saved/unsaved status indicator.
* There's a save all blocks button.
* The jQuery block plugin have some of it's internal functions available
	from outside.
* Swedish translation.

### v0.9.2

* An optional show/hide option on fields.

### v0.9.1

* Maximum number of posts can be set for both blocks and post childs.

### v0.9

First stable beta release with some of the main features.

* Register blocks with custom loops and gather them in the administration.
* Search posts in the administration and drag posts into cursorial
	blocks.
* Drag posts between blocks.
* Override posts' contents.
* Images will be set by wordpress' own image library.
* Posts can be set to have childs.
* Admin pages templates are overridable.
* Loops for displaying block posts are available through both a query
	method and a template fetcher.
