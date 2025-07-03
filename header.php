<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?php bloginfo('name'); ?> | <?php wp_title(); ?></title>
  <script src="<?php echo get_template_directory_uri(); ?>/js/chart.umd.min.js"></script>
  <script src="<?php echo get_template_directory_uri(); ?>/js/xlsx.full.min.js"></script>
  <script src="<?php echo get_template_directory_uri(); ?>/js/jspdf.umd.min.js"></script>
  <script src="<?php echo get_template_directory_uri(); ?>/js/html2pdf.bundle.min.js"></script>
  <script src="<?php echo get_template_directory_uri(); ?>/js/crypto-js.min.js"></script>




  <!-- استایل قالب -->
  <link rel="stylesheet" href="<?php echo get_stylesheet_uri(); ?>">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">


  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

      
<nav class="top-navbar">
  <div class="nav-right">
    <button id="toggleSidebar" class="toggle-btn">
      <span class="full-label">☰ تاریخچه</span>
    </button>
  </div>

  <div class="nav-center">
    <h1 class="site-title">محاسبه‌گر قدرالسهم</h1>
    <img src="http://localhost/landshare/wp-content/themes/landshare/img/logo_trim.png" alt="لوگو" class="logo">
  </div>


  <div class="nav-left">
    <button class="dark-toggle" onclick="toggleDarkMode()">🌙 / ☀️</button>
  </div>
</nav>

<ul class="nav-links" id="navLinks">
    <li><a href="<?php echo home_url(); ?>">خانه</a></li>
    <li><a href="http://localhost/landshare/step-by-step-guide-to-calculating-the-land-and-apartment-share-value/">آموزش</a></li>
    <li><a href="http://localhost/landshare/about-us/">درباره ما</a></li>
    <li><a href="http://localhost/landshare/contact-us/">تماس با ما</a></li>
    <li><a href="http://localhost/landshare/donate/" target="_blank">❤️ حمایت</a></li>
</ul>

<div id="sidebar" class="sidebar">
    <div class="sidebar-header">
      <h2>تاریخچه محاسبات</h2>
      <button id="closeSidebar" class="close-sidebar-btn">✖</button>
      <hr>
      <input type="text" id="searchHistory" placeholder="جستجو..." />
      <button id="clearHistory" class="clear-btn">🗑 پاک کردن همه</button>
    </div>
    <div id="historyList" class="history-list"></div>
    
    <hr>
</div>