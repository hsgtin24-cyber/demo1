// --- QUẢN LÝ DARK MODE ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// --- BIẾN TOÀN CỤC ---
let examsData = [];

// --- LOGIC TRANG CHỦ (INDEX.HTML) ---
const examListContainer = document.getElementById('exam-list');
if (examListContainer) {
    const searchInput = document.getElementById('search-input');
    const filterYear = document.getElementById('filter-year');
    const filterType = document.getElementById('filter-type');

    // Fetch dữ liệu từ JSON
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            examsData = data;
            renderExams(examsData);
        })
        .catch(err => console.error("Lỗi tải dữ liệu JSON:", err));

    // Hàm Render danh sách
    function renderExams(exams) {
        examListContainer.innerHTML = '';
        if (exams.length === 0) {
            examListContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Không tìm thấy đề thi phù hợp.</p>';
            return;
        }

        exams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => window.location.href = `detail.html?id=${exam.id}`;
            
            // Format class độ khó để tô màu
            const diffClass = `diff-${exam.dokho.replace(/\s+/g, '.')}`;

            card.innerHTML = `
                <h3 class="card-title">${exam.ten}</h3>
                <div class="card-tags">
                    <span class="tag"><i class="fa-regular fa-calendar"></i> ${exam.nam}</span>
                    <span class="tag"><i class="fa-solid fa-graduation-cap"></i> ${exam.kythi}</span>
                    <span class="tag ${diffClass}">${exam.dokho}</span>
                </div>
                <p class="card-desc">${exam.mota}</p>
                <div class="card-btn">Xem chi tiết</div>
            `;
            examListContainer.appendChild(card);
        });
    }

    // Hàm xử lý Lọc & Tìm kiếm
    function filterExams() {
        const searchTerm = searchInput.value.toLowerCase();
        const year = filterYear.value;
        const type = filterType.value;

        const filtered = examsData.filter(exam => {
            const matchSearch = exam.ten.toLowerCase().includes(searchTerm) || exam.mota.toLowerCase().includes(searchTerm);
            const matchYear = year === 'all' || exam.nam.toString() === year;
            const matchType = type === 'all' || exam.kythi === type;
            return matchSearch && matchYear && matchType;
        });

        renderExams(filtered);
    }

    searchInput.addEventListener('input', filterExams);
    filterYear.addEventListener('change', filterExams);
    filterType.addEventListener('change', filterExams);
}

// --- LOGIC TRANG CHI TIẾT (DETAIL.HTML) ---
const examDetailContainer = document.getElementById('detail-title'); 
if (examDetailContainer) {
    // Lấy ID từ URL (VD: detail.html?id=bai1-olympic10)
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');

    if (examId) {
        fetch('data/data.json')
            .then(res => res.json())
            .then(data => {
                const exam = data.find(e => e.id === examId);
                if (exam) {
                    document.getElementById('detail-title').innerText = exam.ten;
                    
                    // Xử lý hiển thị PDF
                    const pdfViewer = document.getElementById('pdf-viewer');
                    // Gắn thêm param #toolbar=0 để giao diện PDF sạch hơn
                    pdfViewer.src = `${exam.file}#view=FitH`;

                    // Lấy nội dung lời giải HTML bằng Fetch API
                    // THAY BẰNG ĐOẠN NÀY
                    if (exam.loigiai) {
                        // Xóa loader
                        const solutionContainer = document.getElementById('solution-content');
                        solutionContainer.innerHTML = ''; 
                    
                        // Tạo iframe để nhúng file lời giải (bai1.html)
                        const solutionIframe = document.createElement('iframe');
                        solutionIframe.src = exam.loigiai;
                        solutionIframe.style.width = '100%';
                        solutionIframe.style.height = '800px'; // Bạn có thể tăng/giảm chiều cao này cho phù hợp
                        solutionIframe.style.border = 'none';
                        solutionIframe.style.borderRadius = '8px';
                    
                        solutionContainer.appendChild(solutionIframe);
                    } else {
                        document.getElementById('solution-content').innerHTML = '<p style="color:red">Chưa có file hướng dẫn giải.</p>';
                    }
                } else {
                    document.getElementById('detail-title').innerText = "Không tìm thấy đề thi!";
                }
            });
    } else {
        document.getElementById('detail-title').innerText = "URL không hợp lệ!";
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const resizer = document.getElementById('drag-bar');
    const leftPanel = document.getElementById('left-panel');
    const container = document.getElementById('resizable-container');

    if (!resizer || !leftPanel || !container) return;

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.clientX;
        startWidth = parseInt(document.defaultView.getComputedStyle(leftPanel).width, 10);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        
        // Chặn iframe ăn mất sự kiện chuột
        const iframes = container.querySelectorAll('iframe');
        iframes.forEach(iframe => iframe.style.pointerEvents = 'none');
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        let newWidth = startWidth + dx;

        const minWidth = 200;
        const maxWidth = container.offsetWidth - 200;

        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;

        leftPanel.style.width = `${newWidth}px`;
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        const iframes = container.querySelectorAll('iframe');
        iframes.forEach(iframe => iframe.style.pointerEvents = '');
    });
});
