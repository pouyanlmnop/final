<?php
function my_custom_theme_assets() {
    // بارگذاری CSS اختصاصی
    wp_enqueue_style(
        'my-custom-style',
        get_template_directory_uri() . '/style.css',
        array(),
        '1.0'
    );

    // بارگذاری JS اختصاصی
    wp_enqueue_script(
        'my-custom-script',
        get_template_directory_uri() . '/script.js',
        array('jquery'),
        '1.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'my_custom_theme_assets');

function landshare_enqueue_scripts() {
    // Chart.js
    wp_enqueue_script(
        'chartjs',
        get_template_directory_uri() . '/js/chart.umd.min.js',
        array(),
        null,
        true
    );

    // xlsx
    wp_enqueue_script(
        'xlsx',
        get_template_directory_uri() . '/js/xlsx.full.min.js',
        array(),
        null,
        true
    );

    // jsPDF
    wp_enqueue_script(
        'jspdf',
        get_template_directory_uri() . '/js/jspdf.umd.min.js',
        array(),
        null,
        true
    );

    // html2pdf
    wp_enqueue_script(
        'html2pdf',
        get_template_directory_uri() . '/js/html2pdf.bundle.min.js',
        array(),
        null,
        true
    );
}
add_action('wp_enqueue_scripts', 'landshare_enqueue_scripts');

