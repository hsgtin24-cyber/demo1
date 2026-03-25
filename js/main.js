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
const examDetailContainer = document.getElementById('exam-detail');
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
/* ==========================================================
   JavaScript cho logic kéo thả tăng giảm độ rộng
   ========================================================== */
document.addEventListener('DOMContentLoaded', function () {
    const resizer = document.getElementById('drag-bar');
    const leftPanel = document.getElementById('left-panel');
    const container = document.getElementById('resizable-container');

    // Kiểm tra nếu các element tồn tại trong trang hiện tại thì mới chạy
    if (!resizer || !leftPanel || !container) return;

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    // Khi nhấn chuột xuống thanh kéo
    resizer.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.clientX;
        // Lấy chiều rộng hiện tại của panel trái bằng pixel
        startWidth = parseInt(document.defaultView.getComputedStyle(leftPanel).width, 10);

        // Thêm một lớp CSS temporary để tránh việc bôi đen văn bản khi kéo
        document.body.style.userSelect = 'none';
        // Đổi con trỏ chuột toàn màn hình sang col-resize để không bị giật
        document.body.style.cursor = 'col-resize';
        
        // Thêm class active cho thanh kéo (nếu muốn CSS thêm)
        resizer.classList.add('gutter-active');
        
        // Cực kỳ quan trọng: Nếu bên phải là iframe, ta phải chặn pointer events của nó
        // nếu không, sự kiện di chuyển chuột sẽ bị iframe 'bắt mất' và bị dừng.
        const iframe = container.querySelector('#solution-content iframe');
        if (iframe) {
            iframe.style.pointerEvents = 'none';
        }
    });

    // Khi di chuyển chuột (gắn sự kiện vào document để bắt chuột ngay cả khi chuột ra ngoài thanh kéo)
    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;

        // Tính khoảng cách đã di chuyển
        const dx = e.clientX - startX;
        
        // Tính độ rộng mới
        let newWidth = startWidth + dx;

        // Đặt giới hạn (để không bị kéo mất panel hoặc panel quá nhỏ)
        const containerWidth = container.offsetWidth;
        const minWidth = 200; // Pixel tối thiểu
        const maxWidth = containerWidth - 200; // Pixel tối đa (chừa space cho panel phải)

        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;

        // Cập nhật độ rộng cho panel trái bằng pixel
        leftPanel.style.width = `${newWidth}px`;
    });

    // Khi buông chuột
    document.addEventListener('mouseup', function () {
        if (!isDragging) return;

        isDragging = false;
        
        // Trả lại trạng thái bình thường cho body
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        resizer.classList.remove('gutter-active');

        // Khôi phục lại pointer events cho iframe (nếu có)
        const iframe = container.querySelector('#solution-content iframe');
        if (iframe) {
            iframe.style.pointerEvents = '';
        }
    });
});
