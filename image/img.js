document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById('image-gallery');
    if (!gallery) return;

    const BATCH_SIZE = 16;
    let allImages = [];
    let renderedCount = 0;
    let loading = false;
    let resizeTimer = null;
    const GAP = 12; // 与 CSS 中间距保持一致

    // 缓存 DOM 元素
    const fragment = document.createDocumentFragment();
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (!img.src) {
                    img.src = img.dataset.src;
                }
                img.classList.remove('lazy-img');
                obs.unobserve(img);
                img.onload = img.onerror = () => requestAnimationFrame(waterfallLayout);
            }
        });
    }, { rootMargin: "100px" }) : null;

    // 获取图片列表
    fetch('https://raw.githubusercontent.com/norespond/picx-images-hosting/master/img.json')
        .then(res => res.json())
        .then(images => {
            allImages = images;
            renderNextBatch(); // 首屏渲染
        });

    // 渲染下一批图片
    function renderNextBatch() {
        if (loading || renderedCount >= allImages.length) return;
        loading = true;
        const nextImages = allImages.slice(renderedCount, renderedCount + BATCH_SIZE);

        // 使用局部 fragment，避免重复复用外部 fragment 导致 DOM 状态错乱
        const localFrag = document.createDocumentFragment();
        const createdImgs = [];

        nextImages.forEach((image, idx) => {
            const div = document.createElement('div');
            div.className = 'waterfall-item';
            const img = document.createElement('img');
            img.setAttribute('data-src', image.src);
            img.alt = image.alt || '';
            img.className = 'lazy-img';
            img.onerror = function () { this.src = 'fallback.jpg'; };

            const thumb = document.createElement('div');
            thumb.className = 'waterfall-thumb';
            thumb.appendChild(img);

            const desc = document.createElement('div');
            desc.className = 'waterfall-desc';
            desc.textContent = image.alt || '';

            div.appendChild(thumb);
            div.appendChild(desc);
            div.addEventListener('click', () => openPreview(image.src));

            localFrag.appendChild(div);
            createdImgs.push(img);
        });

        gallery.appendChild(localFrag);

        // 对于首屏批次，等待所有缩略图加载完毕再做首轮布局，避免使用图片高度为 0 导致错列
        if (renderedCount === 0) {
            let remaining = createdImgs.length;
            const onOneDone = () => {
                remaining--; 
                if (remaining <= 0) {
                    // 所有首屏图片已加载/失败，执行布局
                    requestAnimationFrame(waterfallLayout);
                }
            };

            // 设置 src 并绑定回调
            createdImgs.forEach(img => {
                // 强制基础展示样式，避免因 inline 元素导致测量误差
                img.style.display = 'block';
                img.style.width = '100%';
                img.src = img.dataset.src;
                img.classList.remove('lazy-img');
                img.onload = onOneDone;
                img.onerror = onOneDone;
            });

            // 兜底：如果网络阻塞，1.5s 后也强制布局一次
            setTimeout(() => requestAnimationFrame(waterfallLayout), 1500);
        } else {
            // 后续批次采用观察或回退立即加载
            createdImgs.forEach(img => {
                img.style.display = 'block';
                img.style.width = '100%';
                if (observer) observer.observe(img);
                else { img.src = img.dataset.src; img.classList.remove('lazy-img'); img.onload = img.onerror = () => requestAnimationFrame(waterfallLayout); }
            });
        }

        renderedCount += nextImages.length;
        loading = false;
    }

    // 懒加载图片
    function lazyLoadImages() {
        const imgs = gallery.querySelectorAll('img.lazy-img:not([src])');
        if (observer) {
            imgs.forEach(img => observer.observe(img));
        } else {
            imgs.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy-img');
                img.onload = img.onerror = () => requestAnimationFrame(waterfallLayout);
            });
        }
    }

    // 无限滚动加载
    window.addEventListener('scroll', () => {
        if (renderedCount >= allImages.length) return;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            renderNextBatch();
        }
    });

    // 瀑布流布局
    function waterfallLayout() {
        const items = Array.from(gallery.querySelectorAll('.waterfall-item'));
        if (items.length === 0) return;

        const containerWidth = Math.max(1, gallery.clientWidth);

        // 更准确地使用元素实际渲染宽度
        const firstRect = items[0].getBoundingClientRect();
        const itemWidth = Math.max(1, Math.round(firstRect.width));

        // 计算列数时把 GAP 考虑进去
        const cols = Math.max(1, Math.floor((containerWidth + GAP) / (itemWidth + GAP)));
        const colHeights = new Array(cols).fill(0);

        // 使用 left/top 设置位置（避免 transform 导致的子像素偏差），并四舍五入位置
        items.forEach(item => {
            // 确保使用实际高度进行测量
            const minCol = colHeights.indexOf(Math.min(...colHeights));
            const x = Math.round(minCol * (itemWidth + GAP));
            const y = Math.round(colHeights[minCol]);
            item.style.position = 'absolute';
            item.style.left = x + 'px';
            item.style.top = y + 'px';
            item.style.transform = 'none';
            colHeights[minCol] += Math.round(item.offsetHeight) + GAP;
        });

        // 计算完后统一设置容器的高度
        gallery.style.position = 'relative';
        gallery.style.height = `${Math.max(...colHeights)}px`;
    }

    // 窗口调整时重新布局
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            requestAnimationFrame(waterfallLayout);
        }, 300);
    });

    // 图片放大预览
    function openPreview(url) {
        const overlay = document.createElement('div');
        overlay.className = 'img-preview-overlay';
        overlay.innerHTML = `
            <div class="img-preview-box">
                <img src="${url}" alt="预览图" class="img-preview-img" />
                <span class="img-preview-close">&times;</span>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.img-preview-close').onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    }
});