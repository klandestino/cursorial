=== Cursorial ===

Contributors: spurge, redundans, alfred
Tags: cursorial, admin, content, custom, news, loops
Requires at least: 3.2.1
Tested up to: 3.2.1
Stable tag: 0.9.1
License: GPLv2

Create custom loops with an easy drag-and-drop interface.

== Description ==

Register custom loops in your theme and administrate them in the admin with an easy drag-and-drop interface.

== Installation ==

* Register loops with register_cursorial( array( blocks ), array( admin ) )
* Set posts in administration
* Get posts with query_cursorial_posts( $block_name ) or get_cursorial_block( $block_name )

== Frequently Asked Questions ==

== Screenshot ==

== Changelog ==

= v0.9 =

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

= v0.9.1 =

Second stable beta release.

* Maximum number of posts can be set for both blocks and post childs.

= v0.9.2 =

Third stable beta release.

* An optional show/hide option on fields.

== Upcoming ==

= v1.0 =

* Replace individual block save buttons with a general save button for all visible blocks.
* Write a user manual in the plugin admin index.
* Update readme.txt

= v1.1 =

* Create an indicator for unsaved blocks.
* Let the textareas use TinyMCE
