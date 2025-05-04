document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById('image-gallery');
    fetch('./image/images.json')
        .then(res => res.json())
        .then(images => {
            images.forEach(url => {
                const div = document.createElement('div');
                div.className = 'waterfall-item';
                div.innerHTML = `
                    <div class="waterfall-thumb"><img src="${url}" loading="lazy"></div>
                `;
                gallery.appendChild(div);
            });

            // 瀑布流布局函数和图片加载监听
            function waterfallLayout() {
                const items = Array.from(document.querySelectorAll('.waterfall-item'));
                if (items.length === 0) return;
                const containerWidth = gallery.clientWidth;
                const itemWidth = items[0].offsetWidth + 12;
                const cols = Math.max(1, Math.floor(containerWidth / itemWidth));
                const colHeights = Array(cols).fill(0);

                items.forEach(item => {
                    const minCol = colHeights.indexOf(Math.min(...colHeights));
                    const left = minCol * itemWidth;
                    const top = colHeights[minCol];
                    item.style.left = left + 'px';
                    item.style.top = top + 'px';
                    colHeights[minCol] += item.offsetHeight + 12;
                });
                gallery.style.height = Math.max(...colHeights) + 'px';
            }

            function relayoutOnImgLoad() {
                let loaded = 0;
                const imgs = gallery.querySelectorAll('img');
                imgs.forEach(img => {
                    if (img.complete) {
                        loaded++;
                        if (loaded === imgs.length) waterfallLayout();
                    } else {
                        img.onload = () => {
                            loaded++;
                            if (loaded === imgs.length) waterfallLayout();
                        };
                    }
                });
            }

            window.addEventListener('resize', waterfallLayout);
            relayoutOnImgLoad();
        });
});