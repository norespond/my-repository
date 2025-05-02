document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById('image-gallery');
    let page = 1;  // 用于记录当前页面
    const perPage = 10;  // 每次加载10张图片

    // 假设这是你从批量复制得到的图片链接数组
    const imageLinks = [
        "https://norespond.github.io/picx-images-hosting/20250324/img_1.4qrhlbho6q.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_10.8s3gzplrqv.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_11.5mnz0rrcu4.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_12.sz44n6nsm.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_13.7p3rotpxxj.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_14.102c02st9l.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_15.7zqlhz5642.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_17.9dd4m0g88b.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_18.m8mwq286.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_19.icabhrftt.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_2.6t7a9dg99e.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_20.361qlukh6l.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_21.2ks2zjq0wi.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_22.9rjkcvoj6g.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_23.b92g25ah3.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_24.4g4ns62gkc.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_25.icabhrfyz.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_26.2rvauzc6gv.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_27.83a7foy95c.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_28.1hsdonu76l.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_29.2ks2zjq130.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_3.7pgicc7b5.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_30.8ojv1zspif.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_31.7i0jte3sy4.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_32.3gokezzpmd.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_33.102c02stri.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_34.73u42ivi6a.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_35.1e8rqy14nt.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_36.esodrydis.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_37.1zifd8vl0c.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_38.175jviezbt.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_39.45htz0n8tq.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_4.4xupgr3tow.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_40.lvw97kj32.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_41.41y81au672.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_43.99tioan69x.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_44.45htz0n927.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_45.51ebegwxj6.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_46.1ovlk3gd7f.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_47.9rjkcvojxp.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_48.1hsdonu7tz.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_49.102c02su9t.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_5.8ojv1zsox0.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_50.51ebegwxnj.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_51.3d4yha6nhz.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_52.5j4d31yb9p.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_53.8z6ov57ycf.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_54.9nzyf5vheu.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_55.1lbzmdnapk.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_56.64e0pcsrny.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_57.lvw97kjkx.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_59.6ikgg812nq.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_6.5fkr5c57be.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_60.45ukmj64l.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_61.7p3rotpzaj.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_62.58hj9wj3eu.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_63.5fkr5c58ur.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_64.3yem3l144r.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_65.1sf7ht9ge4.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_66.86ttdercyc.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_67.6ikgg812s7.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_68.7axbxyhoj7.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_69.39lcjkdl6l.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_7.5j4d31ya23.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_70.8dx18udigi.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_71.9dd4m0g9my.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_72.83a7foyac7.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_73.7pgicc92y.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_74.9kgchg2f4e.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_75.67xmn2lut8.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_76.13lxxslxll.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_77.3rbe85eyz6.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_78.lvw97kk2w.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_79.7w6zk9c53y.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_8.5c157mc4nl.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_80.13lxxslxql.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_81.9kgchg2fc1.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_82.6f0uii80fz.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_83.8adfb4kg2n.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_84.2h8h1twzut.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_85.3k86cpstqk.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_86.m8mwq3ys.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_87.5mnz0rrese.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_88.2obox9j5b9.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_89.6pnobnn8oh.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_9.58hj9wj1xz.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_90.3rbe85ez7e.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_91.92qasv11vs.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_92.13lxxslxw7.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_93.6bh8ksexut.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_94.2dov443x7t.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_95.5fkr5c59f1.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_96.3d4yha6oe1.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_97.1sf7ht9gxo.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_98.41y81au7f0.webp",
        "https://norespond.github.io/picx-images-hosting/20250324/img_99.8vn2xfewih.webp"
        // 继续填充所有图片链接
    ];

    // 获取图片列表的函数
    function fetchImageURLs(page = 1, perPage = 10) {
        // 从链接数组中获取当前页面需要显示的图片
        const startIndex = (page - 1) * perPage;
        return imageLinks.slice(startIndex, startIndex + perPage);
    }

    // 动态加载图片并添加到页面
    function loadImages(page = 1, perPage = 10) {
        const imageURLs = fetchImageURLs(page, perPage);

        imageURLs.forEach(url => {
            const div = document.createElement('div');
            div.classList.add('image-item');

            const img = document.createElement('img');
            img.setAttribute('data-src', url);  // 延迟加载的图片 URL
            img.setAttribute('src', '');  // 先放置空白图片
            img.classList.add('lazy');  // 添加 lazy 类以便懒加载

            // 图片加载完成后，添加 loaded 类
            img.onload = () => img.classList.add('loaded');

            div.appendChild(img);
            gallery.appendChild(div);
        });
    }

    // 初始化加载图片
    loadImages(page);

    // 懒加载：监听滚动事件，加载更多图片
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
            page++;  // 增加页面
            loadImages(page);  // 加载更多图片
        }
    });

    // 懒加载图片函数：检查图片是否进入视口
    function lazyLoadImages() {
        const images = document.querySelectorAll('img.lazy');
        images.forEach(image => {
            if (image.getBoundingClientRect().top < window.innerHeight) {
                const src = image.getAttribute('data-src');
                if (src) {
                    image.setAttribute('src', src);
                }
            }
        });
    }

    // 监听滚动，触发懒加载
    window.addEventListener('scroll', lazyLoadImages);
    lazyLoadImages();  // 页面初始加载时也触发一次
});
