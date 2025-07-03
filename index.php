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

<h1>محاسبه‌گر سهم زمین و بودجه (قدرالســهم)</h1>

<div class="container">

  <p class="p-title">محاسبه قدرالســهم زمین و آپارتمان | پویان</p>
  <p class="p-print">محاسبه قدرالســهم | نسخه چاپی</p>

  <div class="form-group">
    <label for="landArea">متراژ زمین:</label>
    <input type="number" id="landArea" placeholder="مثلاً 300" min="0" />
  </div>

  <div class="form-group">
    <label for="pricePerMeter">قیمت هر متر مربع:</label>
    <input type="text" id="pricePerMeter" placeholder="مثلاً 70,000,000" min="0" oninput="formatInput(this)" />
  </div>

  <div class="form-group">
    <label for="totalBudget">بودجه کل خریدار:</label>
    <input type="text" id="totalBudget" placeholder="مثلاً 4,000,000,000" min="0" oninput="formatInput(this)" />
  </div>

  <hr />

  <div class="form-group">
    <label for="coef_parking">ضریب پارکینگ:</label>
    <input type="number" id="coef_parking" step="0.01" value="0.5" min="0" />
  </div>

  <div class="form-group">
    <label for="coef_storage">ضریب انباری:</label>
    <input type="number" id="coef_storage" step="0.01" value="0.3" min="0" />
  </div>

  <div class="form-group">
    <label for="coef_balcony">ضریب بالکن:</label>
    <input type="number" id="coef_balcony" step="0.01" value="0.2" min="0" />
  </div>

  <hr />

  <div class="form-group">
    <label for="unitCount">تعداد واحدها:</label>
    <input type="number" id="unitCount" min="1" placeholder="مثلاً 3" />
    <button type="button"  onclick="generateUnits()">ثبت واحدها</button>
  </div>

  <div id="unitInputs" class="responsive-table" aria-live="polite"></div>

  <div class="actions">
    <button type="button" onclick="calculate()">محاسبه</button>
    <button type="button" onclick="exportPDF()">📄 خروجی PDF</button>
    <button type="button" onclick="exportExcel()">📊 خروجی Excel</button>
    <button type="button" onclick="clearData()">🗑 پاک کردن داده‌ها</button>
  </div>

  <div id="results" class="responsive-table" aria-live="polite"></div>

  <canvas id="myChart" style="max-width: 100%; margin: 2rem auto;"></canvas>
</div>
<?php get_footer(); ?>


<?php wp_footer(); ?>
<script src="<?php echo get_template_directory_uri(); ?>/script.js"></script>
</body>
</html>
