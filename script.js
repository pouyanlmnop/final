localStorage.removeItem('landShareData');
    let isLoadingFromHistory = false;
    let activeRecordId = null;
    let history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');


    // حالت تاریک و ذخیره‌سازی
    function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    }
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
    }

    // فرمت ورودی عددی (فارسی)
    function formatInput(input) {
      let value = input.value.replace(/[^\d]/g, '');
      input.value = Number(value).toLocaleString('en-US');
    }

    function parseNumber(str) {
      return parseFloat(str.replace(/,/g, '')) || 0;
    }

    // ایجاد جدول ورودی واحدها
    function generateUnits() {
      const count = parseInt(document.getElementById('unitCount').value);
      const container = document.getElementById('unitInputs');
      container.innerHTML = '';

      if (!count || count <= 0) {
        alert('لطفاً تعداد واحد معتبر وارد کنید');
        return;
      }

      let table = `<table>
        <thead>
          <tr>
            <th>واحد</th>
            <th>نام مالک</th>
            <th>متراژ مفید</th>
            <th>پارکینگ</th>
            <th>انباری</th>
            <th>بالکن</th>
          </tr>
        </thead><tbody>`;

      for (let i = 1; i <= count; i++) {
        table += `<tr>
          <td>${i}</td>
          <td><input type="text" id="owner_${i}" placeholder="نام مالک" vazirmatn="نام مالک واحد ${i}" /></td>
          <td><input type="number" id="useful_${i}" min="0" step="0.01" vazirmatn="متراژ مفید واحد ${i}" /></td>
          <td><input type="number" id="parking_${i}" min="0" step="0.01" vazirmatn="پارکینگ واحد ${i}" /></td>
          <td><input type="number" id="storage_${i}" min="0" step="0.01" vazirmatn="انباری واحد ${i}" /></td>
          <td><input type="number" id="balcony_${i}" min="0" step="0.01" vazirmatn="بالکن واحد ${i}" /></td>
        </tr>`;
      }
      table += '</tbody></table>';
      container.innerHTML = table;

      // بارگذاری مقادیر ذخیره شده قبلی
      loadUnitsFromLocalStorage(count);
    }

    // بارگذاری اطلاعات واحدها از localStorage
    function loadUnitsFromLocalStorage(count) {
      const data = JSON.parse(localStorage.getItem('landShareData') || '{}');
      if (!data.units || data.units.length !== count) return;

      for (let i = 1; i <= count; i++) {
        const unit = data.units[i - 1];
        if (!unit) continue;
        document.getElementById(`owner_${i}`).value = unit.owner || '';
        document.getElementById(`useful_${i}`).value = unit.useful || '';
        document.getElementById(`parking_${i}`).value = unit.parking || '';
        document.getElementById(`storage_${i}`).value = unit.storage || '';
        document.getElementById(`balcony_${i}`).value = unit.balcony || '';
      }
    }

    // محاسبه سهم ها و نمایش نتایج
    function calculate() {
      // ورودی‌های اصلی
      const landArea = parseNumber(document.getElementById('landArea').value);
      const pricePerMeter = parseNumber(document.getElementById('pricePerMeter').value);
      const totalBudget = parseNumber(document.getElementById('totalBudget').value);
      const coef_parking = parseFloat(document.getElementById('coef_parking').value) || 0;
      const coef_storage = parseFloat(document.getElementById('coef_storage').value) || 0;
      const coef_balcony = parseFloat(document.getElementById('coef_balcony').value) || 0;
      const count = parseInt(document.getElementById('unitCount').value);

      if (!landArea || !pricePerMeter || !totalBudget || !count || count <= 0) {
        alert('لطفاً همه مقادیر اولیه را به درستی وارد کنید');
        return;
      }

      // جمع مساحت وزنی کل
      let totalWeightedArea = 0;
      const units = [];

      // خواندن داده‌های واحدها
      for (let i = 1; i <= count; i++) {
        const owner = document.getElementById(`owner_${i}`).value.trim() || `واحد ${i}`;
        const useful = parseFloat(document.getElementById(`useful_${i}`).value) || 0;
        const parking = parseFloat(document.getElementById(`parking_${i}`).value) || 0;
        const storage = parseFloat(document.getElementById(`storage_${i}`).value) || 0;
        const balcony = parseFloat(document.getElementById(`balcony_${i}`).value) || 0;

        const weightedArea = useful + parking * coef_parking + storage * coef_storage + balcony * coef_balcony;

        units.push({ owner, useful, parking, storage, balcony, weightedArea });
        totalWeightedArea += weightedArea;
      }

      // محاسبه درصد سهم و ارزش هر واحد
      for (const u of units) {
        u.sharePercent = (u.weightedArea / totalWeightedArea) * 100;
        u.shareValue = (u.sharePercent / 100) * totalBudget;
      }

      // ذخیره داده‌ها در LocalStorage
      const calculationData = {
        landArea,
        pricePerMeter,
        totalBudget,
        coef_parking,
        coef_storage,
        coef_balcony,
        count,
        units,
        timestamp: new Date().toISOString()
      };
       localStorage.setItem('landShareData', JSON.stringify(calculationData));

      
      // ذخیره در تاریخچه
     
        saveToHistory(calculationData);
        displayResults(units, landArea, pricePerMeter, totalBudget, totalWeightedArea);
        drawChart(units);
        isLoadingFromHistory = false;
    }
  
  
    // نمایش نتایج
    function displayResults(units, landArea, pricePerMeter, totalBudget, totalWeightedArea) {
      const container = document.getElementById('results');
      container.innerHTML = '';

      let sumUseful = 0, sumParking = 0, sumStorage = 0, sumBalcony = 0;
      units.forEach(u => {
        sumUseful += u.useful;
        sumParking += u.parking;
        sumStorage += u.storage;
        sumBalcony += u.balcony;
      });

      let html = `<table>
        <thead>
          <tr>
            <th>واحد</th>
            <th>نام مالک</th>
            <th>متراژ مفید (متر مربع)</th>
            <th>پارکینگ (متر مربع)</th>
            <th>انباری (متر مربع)</th>
            <th>بالکن (متر مربع)</th>
            <th>مساحت وزنی (متر مربع)</th>
            <th>درصد سهم (%)</th>
            <th>ارزش سهم (تومان)</th>
          </tr>
        </thead>
        <tbody>`;

      units.forEach((u, i) => {
        html += `<tr>
          <td>${i + 1}</td>
          <td>${u.owner}</td>
          <td>${u.useful.toLocaleString('fa-IR')}</td>
          <td>${u.parking.toLocaleString('fa-IR')}</td>
          <td>${u.storage.toLocaleString('fa-IR')}</td>
          <td>${u.balcony.toLocaleString('fa-IR')}</td>
          <td>${u.weightedArea.toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${u.sharePercent.toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
          <td>${Math.round(u.shareValue).toLocaleString('fa-IR')}</td>
        </tr>`;
      });

      html += `</tbody></table>`;
      html += `
      <table class="summary-table">
        <thead>
          <hr>
          <h2>خلاصه وضعیت ملکی شما : </h2>
          <tr>
            <th>عنوان</th>
            <th>مقدار</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>مجموع متراژ مفید</td>
            <td>${sumUseful.toLocaleString('fa-IR')} متر مربع</td>
          </tr>
          <tr>
            <td>مجموع پارکینگ</td>
            <td>${sumParking.toLocaleString('fa-IR')} متر مربع</td>
          </tr>
          <tr>
            <td>مجموع انباری</td>
            <td>${sumStorage.toLocaleString('fa-IR')} متر مربع</td>
          </tr>
          <tr>
            <td>مجموع بالکن</td>
            <td>${sumBalcony.toLocaleString('fa-IR')} متر مربع</td>
          </tr>
          <tr>
            <td>مساحت زمین</td>
            <td>${landArea.toLocaleString('fa-IR')} متر مربع</td>
          </tr>
          <tr>
            <td>قیمت هر متر مربع زمین</td>
            <td>${pricePerMeter.toLocaleString('fa-IR')} تومان</td>
          </tr>
          <tr>
            <td>بودجه کل پروژه</td>
            <td>${totalBudget.toLocaleString('fa-IR')} تومان</td>
          </tr>
          <tr>
            <td>مجموع مساحت وزنی</td>
            <td>${totalWeightedArea.toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} متر مربع</td>
          </tr>
        </tbody>
      </table>`;

      container.innerHTML = html;
    }

    // رسم نمودار درصد سهم
    function drawChart(units) {
      const ctx = document.getElementById('myChart').getContext('2d');

      if (window.mychart) {
        window.mychart.destroy();
      }

      const labels = units.map((u, i) => `واحد ${i + 1} (${u.owner})`);
      const data = units.map(u => u.sharePercent);

      window.mychart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'درصد سهم هر واحد',
            data,
            backgroundColor: generateColors(data.length),
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { enabled: true },
          }
        }
      });
    }

    // تولید رنگ‌های تصادفی زیبا برای نمودار
    function generateColors(count) {
      const baseColors = [
        '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
        '#59a14f', '#edc949', '#af7aa1', '#ff9da7',
        '#9c755f', '#bab0ab'
      ];
      let colors = [];
      for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
      }
      return colors;
    }

  function saveToHistory(data) {
  let history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
  const now = new Date();
  const persianDate = now.toLocaleString('fa-IR');

  const record = {
    ...data,
    displayDate: persianDate,
    timestamp: now.getTime(),
  };

  if (activeRecordId) {
    const index = history.findIndex(item => item.id === activeRecordId);
    if (index !== -1) {
      record.id = activeRecordId;
      record.edited = true; // 🔥 اضافه شدن برچسب "ویرایش‌شده"
      history[index] = record;
    }
  } else {
    const newId = Date.now().toString();
    record.id = newId;
    record.edited = false;
    history.unshift(record);
    activeRecordId = newId;
  }

  if (history.length > 20) {
    history = history.slice(0, 20);
  }

  localStorage.setItem('calculationHistory', JSON.stringify(history));
  renderHistory();
}


    // نمایش تاریخچه محاسبات
  function renderHistory() {
  const historyContainer = document.getElementById('historyList');
  let history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');

  if (history.length === 0) {
    historyContainer.innerHTML = '<div class="history-item"><div class="history-item-content">تاریخچه‌ای وجود ندارد</div></div>';
    return;
  }


  historyContainer.innerHTML = '';

  history.forEach((item, idx) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';

    const totalValue = item.units.reduce((sum, unit) => sum + unit.shareValue, 0);

    historyItem.innerHTML = `
      <div class="history-item-content">
        <div class="history-item-title">
          محاسبه ${idx + 1} - ${item.displayDate}
          ${item.edited ? '<span class="edited-label">✏️edited</span>' : ''}
        </div>
        <div class="history-item-details">
          <div>تعداد واحدها: ${item.count}</div>
          <div>مساحت زمین: ${item.landArea.toLocaleString('fa-IR')} متر مربع</div>
          <div>بودجه کل: ${item.totalBudget.toLocaleString('fa-IR')} تومان</div>
        </div>
      </div>
      <button class="delete-entry" onclick="deleteHistoryItem(${idx})">✖ حذف</button>
      <button class="load-btn" onclick="loadHistoryItem(${idx})">بارگذاری</button>
      
    `;

    historyContainer.appendChild(historyItem);
    
  });
  
}

    // حذف یک مورد از تاریخچه
    function deleteHistoryItem(index) {
      let history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
      history.splice(index, 1);
      localStorage.setItem('calculationHistory', JSON.stringify(history));
      renderHistory();
    }

    // بارگذاری یک مورد از تاریخچه
    function loadHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
    const item = history[index];
    if (!item) return;

  activeRecordId = item.id;
  isLoadingFromHistory = true;

  // فرم
  document.getElementById('landArea').value = item.landArea;
  document.getElementById('pricePerMeter').value = item.pricePerMeter.toLocaleString('en-US');
  document.getElementById('totalBudget').value = item.totalBudget.toLocaleString('en-US');
  document.getElementById('coef_parking').value = item.coef_parking;
  document.getElementById('coef_storage').value = item.coef_storage;
  document.getElementById('coef_balcony').value = item.coef_balcony;
  document.getElementById('unitCount').value = item.count;

  generateUnits();

  setTimeout(() => {
    item.units.forEach((unit, i) => {
      const idx = i + 1;
      document.getElementById(`owner_${idx}`).value = unit.owner || '';
      document.getElementById(`useful_${idx}`).value = unit.useful || '';
      document.getElementById(`parking_${idx}`).value = unit.parking || '';
      document.getElementById(`storage_${idx}`).value = unit.storage || '';
      document.getElementById(`balcony_${idx}`).value = unit.balcony || '';
    });

    calculate();
    isLoadingFromHistory = false;
  }, 100);
}

    // پاک کردن داده‌ها و رفرش صفحه
    function clearData() {
      if (confirm('آیا مطمئن هستید که می‌خواهید تمامی داده‌ها پاک شود؟')) {
   // فیلدهایی که باید پاک بشن (ورودی‌های عددی و متنی اصلی)
      const clearFields = ['landArea', 'pricePerMeter', 'totalBudget', 'unitCount'];

      clearFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      // پاک‌سازی فرم واحدها
      document.getElementById('unitInputs').innerHTML = '';
      document.getElementById('results').innerHTML = '';

      // ریست وضعیت چک‌باکس‌ها (اگر داشتی)
      document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);

      // حذف نمودار اگر وجود دارد
      if (window.mychart) {
        window.mychart.destroy();
        window.mychart = null;
      }

      // ریست شناسه و وضعیت لود
      activeRecordId = null;
      isLoadingFromHistory = false;

    }
      if (window.mychart) {
      window.mychart.destroy();
      window.mychart = null;
  }
      }
    

    function updateTotalBudget() {
      const landArea = parseNumber(document.getElementById('landArea').value);
      const pricePerMeter = parseNumber(document.getElementById('pricePerMeter').value);

      if (landArea && pricePerMeter) {
          const totalBudget = landArea * pricePerMeter;
          document.getElementById('totalBudget').value = totalBudget.toLocaleString('en-US');
      }
    }

    function updatePricePerMeter() {
      const landArea = parseNumber(document.getElementById('landArea').value);
      const totalBudget = parseNumber(document.getElementById('totalBudget').value);

      if (landArea && totalBudget) {
          const pricePerMeter = totalBudget / landArea;
          document.getElementById('pricePerMeter').value = pricePerMeter.toLocaleString('en-US');
      }
    }

    // اضافه کردن event listener به ورودی‌ها
    document.getElementById('landArea').addEventListener('input', updateTotalBudget);
    document.getElementById('pricePerMeter').addEventListener('input', updateTotalBudget);
    document.getElementById('totalBudget').addEventListener('input', updatePricePerMeter);

    // خروجی PDF با jsPDF
    function exportPDF() {
      const container = document.getElementById('results');
      if (!container || !container.innerHTML.trim()) {
        alert('لطفاً ابتدا محاسبه را انجام دهید');
        return;
      }

      const element = document.querySelector(".container");

      // حذف margin و padding بالا برای جلوگیری از فاصله خالی در PDF
      element.style.margin = "10";
      element.style.padding = "10";
      element.style.width = "100%";
      element.style.height = "100%";

      const opt = {
       
        filename: 'land-share.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          scrollY: 0,
          scrollX: 0,
          useCORS: true
        },
        jsPDF: {
          unit: 'pt',
          format: 'a4',
          orientation: 'landscape'
        }
      };

      html2pdf().set(opt).from(element).save();
    }

    // خروجی Excel با SheetJS (xlsx)
    function exportExcel() {
      const data = JSON.parse(localStorage.getItem('landShareData') || '{}');
      if (!data.units) {
        alert('لطفاً ابتدا محاسبه را انجام دهید');
        return;
      }

      const wb = XLSX.utils.book_new();

      // آماده‌سازی داده‌ها برای شیت
      const ws_data = [
        ['واحد', 'نام مالک', 'متراژ مفید', 'پارکینگ', 'انباری', 'بالکن', 'مساحت وزنی', 'درصد سهم', 'ارزش سهم (تومان)']
      ];

      data.units.forEach((u, i) => {
        ws_data.push([
          i + 1,
          u.owner,
          u.useful,
          u.parking,
          u.storage,
          u.balcony,
          u.weightedArea.toFixed(2),
          u.sharePercent.toFixed(2),
          u.shareValue.toFixed(0),
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(ws_data);

      // تنظیمات سبک (رنگ و فونت) به صورت ساده
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cell_address]) continue;

          if (R === 0) {
            // سطر عنوان با رنگ پس‌زمینه و رنگ متن سفید
            ws[cell_address].s = {
              fill: { fgColor: { rgb: "FF000080" } },
              font: { color: { rgb: "FFFFFFFF" }, bold: true }
            };
          } else {
            // سلول‌های داده با رنگ متن مشکی و فونت معمولی
            ws[cell_address].s = {
              font: { color: { rgb: "FF000000" } }
            };
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, "نتایج سهم زمین");

      XLSX.writeFile(wb, "land_share_result.xlsx");
    }

    // مدیریت سایدبار تاریخچه
    const toggleBtn = document.getElementById("toggleSidebar");
    const sidebar = document.getElementById("sidebar");


    const closeBtn = document.getElementById("closeSidebar");
    closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
    });
    
    const clearBtn = document.getElementById("clearHistory");
    const searchInput = document.getElementById("searchHistory");

    // Toggle sidebar
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });

    // Clear all history
    clearBtn.addEventListener("click", () => {
      if (confirm('آیا مطمئن هستید که می‌خواهید تمام تاریخچه پاک شود؟')) {
        localStorage.removeItem("calculationHistory");
        renderHistory();
      }
    });

    // Search history
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll(".history-item").forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? "block" : "none";
      });
    });

    // بارگذاری اولیه تاریخچه
    document.addEventListener('DOMContentLoaded', () => {
        activeRecordId = null;
        isLoadingFromHistory = true;


      renderHistory();

      isLoadingFromHistory = true;  // 

      document.getElementById('coef_parking').value = '0.5';
      document.getElementById('coef_storage').value = '0.3';
      document.getElementById('coef_balcony').value = '0.2';
      if (!data.units) return;

      document.getElementById('landArea').value = data.landArea || '';
      document.getElementById('pricePerMeter').value = data.pricePerMeter ? Number(data.pricePerMeter).toLocaleString('en-US') : '';
      document.getElementById('totalBudget').value = data.totalBudget ? Number(data.totalBudget).toLocaleString('en-US') : '';
      document.getElementById('coef_parking').value = data.coef_parking || 0.5;
      document.getElementById('coef_storage').value = data.coef_storage || 0.3;
      document.getElementById('coef_balcony').value = data.coef_balcony || 0.2;
      document.getElementById('unitCount').value = data.count || '';

      if (data.count) {
        generateUnits();
        setTimeout(() => {
          calculate();
          isLoadingFromHistory = false;  // بعد از محاسبه، فلگ رو خاموش کن
        }, 100);
      }
      document.addEventListener('DOMContentLoaded', () => {
      renderHistory();
    // یا سایر کدهایی که باید بعد از بارگذاری اجرا شن
});


});


