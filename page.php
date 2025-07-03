<?php get_header(); ?>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn&display=swap" rel="stylesheet">
<div class="page-container">
  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

    <h1><?php the_title(); ?></h1>
    <div class="page-content">
      <?php the_content(); ?>
    </div>

  <?php endwhile; endif; ?>
</div>

<?php get_footer(); ?>

