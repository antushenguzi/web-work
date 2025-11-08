// ========== 鼠标跟踪效果 ==========
document.addEventListener('DOMContentLoaded', function() {
    const cursorFollower = document.querySelector('.cursor-follower');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // 跟踪鼠标位置
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 平滑动画效果
    function animateCursor() {
        const speed = 0.15;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        cursorFollower.style.left = cursorX + 'px';
        cursorFollower.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // 鼠标悬停在链接和按钮上时的效果
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .card, .gallery-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursorFollower.classList.remove('active');
        });
    });
});

// ========== 搜索功能 ==========
(function () {
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const input = $('#q');
    const form = $('#searchForm');
    const clearBtn = $('#clearBtn');
    const cards = $$('.card');
    const totalCount = $('#totalCount');
    const visibleCount = $('#visibleCount');
    const noResults = $('#noResults');
    const yearElement = $('#y');
    
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    if (totalCount && cards.length > 0) {
        totalCount.textContent = cards.length;
    }

    // 从URL参数预填充
    if (input) {
        const params = new URLSearchParams(location.search);
        if (params.has('q')) {
            input.value = params.get('q').trim();
        }
    }

    function normalise(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFKC')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function setHidden(el, hidden) {
        el.hidden = hidden;
        el.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    }

    // 高亮显示匹配的标题
    function highlightTitle(card, term) {
        const h3 = card.querySelector('.card__title');
        if (!h3) return;
        const original = card.dataset.title || h3.textContent;
        if (!term) { h3.innerHTML = original; return; }
        const idx = original.toLowerCase().indexOf(term.toLowerCase());
        if (idx === -1) { h3.innerHTML = original; return; }
        const before = original.slice(0, idx);
        const match = original.slice(idx, idx + term.length);
        const after = original.slice(idx + term.length);
        h3.innerHTML = `${before}<mark>${match}</mark>${after}`;
    }

    function applySearch(termRaw) {
        const term = normalise(termRaw);
        const url = new URL(location.href);
        if (term) url.searchParams.set('q', term); else url.searchParams.delete('q');
        history.replaceState(null, '', url);

        let shown = 0;
        cards.forEach(card => {
            const hay = normalise(card.dataset.index + ' ' + card.dataset.title);
            const hit = term ? hay.includes(term) : true;
            setHidden(card, !hit);
            highlightTitle(card, term);
            if (hit) shown++;
        });
        if (visibleCount) visibleCount.textContent = shown;
        if (noResults) noResults.classList.toggle('show', shown === 0);
    }

    if (form) {
        form.addEventListener('submit', (e) => { e.preventDefault(); applySearch(input.value); });
    }
    if (input) {
        input.addEventListener('input', () => applySearch(input.value));
        applySearch(input.value);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', () => { 
            if (input) {
                input.value = ''; 
                input.focus(); 
            }
            applySearch(''); 
        });
    }
})();

// ========== 图片灯箱功能 ==========
let currentImageIndex = 0;
const galleryImages = [];

// 初始化图片库
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const title = item.dataset.title || '';
        const desc = item.dataset.desc || '';
        galleryImages.push({
            src: img.src,
            alt: img.alt,
            title: title,
            description: desc
        });
    });
});

// 打开灯箱
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const title = document.getElementById('lightboxTitle');
    const desc = document.getElementById('lightboxDesc');
    const counter = document.getElementById('lightboxCounter');
    
    if (!lightbox || !img) return;
    
    const imageData = galleryImages[currentImageIndex];
    img.src = imageData.src;
    img.alt = imageData.alt;
    if (title) title.textContent = imageData.title;
    if (desc) desc.textContent = imageData.description;
    if (counter) counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭灯箱
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
}

// 切换图片
function changeLightboxImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    } else if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    }
    
    const img = document.getElementById('lightboxImg');
    const title = document.getElementById('lightboxTitle');
    const desc = document.getElementById('lightboxDesc');
    const counter = document.getElementById('lightboxCounter');
    
    if (!img) return;
    
    const imageData = galleryImages[currentImageIndex];
    
    img.style.opacity = '0';
    setTimeout(() => {
        img.src = imageData.src;
        img.alt = imageData.alt;
        if (title) title.textContent = imageData.title;
        if (desc) desc.textContent = imageData.description;
        if (counter) counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
        img.style.opacity = '1';
    }, 150);
}

// 键盘导航
document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            changeLightboxImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeLightboxImage(1);
        }
    }
});

// ========== 战机详情页面 ==========
document.addEventListener('DOMContentLoaded', function() {
    // 从URL获取战机ID
    const params = new URLSearchParams(location.search);
    const aircraftId = params.get('id');
    
    if (aircraftId && document.getElementById('aircraftTitle')) {
        loadAircraftDetails(aircraftId);
    }
});

function loadAircraftDetails(id) {
    // 战机数据库 (实际项目中应该从API获取)
    const aircraftData = {
        'f22': {
            title: 'F-22 猛禽 隐身战斗机',
            subtitle: '美国第五代隐身战斗机',
            image: 'https://via.placeholder.com/1000x600/1a2332/4ea1ff?text=F-22+Raptor',
            description: 'F-22"猛禽"（F-22 Raptor）是美国洛克希德·马丁公司和波音公司联合研制的单座双发第五代隐身战斗机。F-22是世界上第一种服役的第五代战斗机，配备了先进的航空电子系统、武器和隐身技术，具有卓越的空中优势作战能力。',
            specs: [
                { label: '最大速度', value: 'Mach 2.25 (约2,410 km/h)' },
                { label: '作战半径', value: '约 759 km' },
                { label: '最大航程', value: '约 2,960 km' },
                { label: '实用升限', value: '19,812 m' },
                { label: '发动机', value: '2× 普惠 F119-PW-100' },
                { label: '最大起飞重量', value: '38,000 kg' },
                { label: '机长', value: '18.92 m' },
                { label: '翼展', value: '13.56 m' }
            ],
            features: [
                '先进的隐身设计，雷达反射截面极小',
                '超音速巡航能力，无需加力燃烧即可突破音速',
                '超视距作战能力，配备AIM-120先进中程空对空导弹',
                '矢量推力技术，具有卓越的机动性能',
                '先进的航空电子系统和传感器融合技术',
                '优秀的态势感知能力'
            ],
            model: 'F-22 Raptor',
            country: '美国',
            manufacturer: '洛克希德·马丁 / 波音',
            type: '隐身战斗机',
            firstFlight: '1997年9月7日',
            inService: '2005年12月',
            produced: '195架'
        },
        'f35': {
            title: 'F-35 闪电 II 战斗机',
            subtitle: '美国第五代多用途战斗机',
            image: 'https://via.placeholder.com/1000x600/1a2332/4ea1ff?text=F-35+Lightning',
            description: 'F-35闪电II（F-35 Lightning II）是一款第五代多用途战斗机，由洛克希德·马丁公司研制。F-35拥有三个主要型号：常规起降型F-35A、短距起降型F-35B和航母型F-35C，能够执行空对空、空对地和侦察等多种任务。',
            specs: [
                { label: '最大速度', value: 'Mach 1.6 (约1,960 km/h)' },
                { label: '作战半径', value: '约 1,135 km' },
                { label: '最大航程', value: '约 2,220 km' },
                { label: '实用升限', value: '15,240 m' },
                { label: '发动机', value: '1× 普惠 F135' },
                { label: '最大起飞重量', value: '31,800 kg' },
                { label: '机长', value: '15.67 m' },
                { label: '翼展', value: '10.7 m' }
            ],
            features: [
                '先进的隐身技术',
                '多用途作战能力',
                '先进的传感器和航空电子系统',
                '网络中心战能力',
                '三种型号满足不同需求',
                '国际合作项目'
            ],
            model: 'F-35 Lightning II',
            country: '美国',
            manufacturer: '洛克希德·马丁',
            type: '多用途战斗机',
            firstFlight: '2006年12月15日',
            inService: '2015年7月',
            produced: '超过900架（持续生产中）'
        },
        'j20': {
            title: '歼-20 威龙 隐身战斗机',
            subtitle: '中国第五代隐身战斗机',
            image: 'https://via.placeholder.com/1000x600/1a2332/4ea1ff?text=J-20+威龙',
            description: '歼-20（J-20）威龙是中国成都飞机工业集团公司研制的第五代隐身战斗机。歼-20采用了先进的隐身技术、鸭式布局和推力矢量技术，是中国空军现代化建设的重要标志。',
            specs: [
                { label: '最大速度', value: 'Mach 2.0+ (估计)' },
                { label: '作战半径', value: '约 1,000-1,200 km (估计)' },
                { label: '最大航程', value: '约 5,500 km (估计)' },
                { label: '实用升限', value: '20,000 m (估计)' },
                { label: '发动机', value: '2× WS-10C / WS-15' },
                { label: '最大起飞重量', value: '约 37,000 kg (估计)' },
                { label: '机长', value: '约 20.3 m' },
                { label: '翼展', value: '约 12.88 m' }
            ],
            features: [
                '先进的隐身设计',
                '鸭式布局提供优秀机动性',
                '先进的有源相控阵雷达',
                '内置弹舱设计',
                '国产先进航空发动机',
                '综合航电系统'
            ],
            model: 'J-20 (歼-20)',
            country: '中国',
            manufacturer: '成都飞机工业集团',
            type: '隐身战斗机',
            firstFlight: '2011年1月11日',
            inService: '2017年',
            produced: '超过200架 (估计，持续生产中)'
        }
    };
    
    // 加载战机详情
    const aircraft = aircraftData[id] || aircraftData['f22'];
    
    const titleEl = document.getElementById('aircraftTitle');
    const subtitleEl = document.getElementById('aircraftSubtitle');
    const imageEl = document.getElementById('mainImage');
    const descEl = document.getElementById('description');
    const specsEl = document.getElementById('specs');
    const featuresEl = document.getElementById('features');
    
    if (titleEl) titleEl.textContent = aircraft.title;
    if (subtitleEl) subtitleEl.textContent = aircraft.subtitle;
    if (imageEl) {
        imageEl.src = aircraft.image;
        imageEl.alt = aircraft.title;
    }
    if (descEl) descEl.textContent = aircraft.description;
    
    // 加载性能参数
    if (specsEl && aircraft.specs) {
        specsEl.innerHTML = aircraft.specs.map(spec => `
            <div class="spec-item">
                <span class="spec-label">${spec.label}</span>
                <span class="spec-value">${spec.value}</span>
            </div>
        `).join('');
    }
    
    // 加载特点
    if (featuresEl && aircraft.features) {
        featuresEl.innerHTML = aircraft.features.map(feature => 
            `<li>${feature}</li>`
        ).join('');
    }
    
    // 加载基本信息
    const infoFields = ['model', 'country', 'manufacturer', 'type', 'firstFlight', 'inService', 'produced'];
    infoFields.forEach(field => {
        const el = document.getElementById(field);
        if (el && aircraft[field]) {
            el.textContent = aircraft[field];
        }
    });
}

// ========== 滚动动画 ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.card, .gallery-item, .about-section, .feature-box');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// ========== 导航栏活动状态 ==========
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

console.log('✈️ 空军主力战机 - 已加载');
