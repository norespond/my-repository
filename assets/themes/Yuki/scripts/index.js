console.log("%c[I]%c " + `yuki 主题的基本脚本 index.js 加载成功!`, "background-color: #00896c;", "");

var flag = autoInitObject();
var eventListener = autoInitObject();

// 获取 DOM 元素
var element = {
    pageHead: document.querySelector(".page-head"),
};

// 页首点击展开效果
flag.pageHead.click = true;
eventListener.pageHead.click = () => {
    if (flag.pageHead.click) {
        element.pageHead.classList.add("expand");
    } else {
        element.pageHead.classList.remove("expand");
    }

    flag.pageHead.click = !flag.pageHead.click;
}
element.pageHead.addEventListener("click", eventListener.pageHead.click);

// 雪花飘落效果
(function () {
const image = ["./assets/themes/Yuki/assets/images/page-head/yuki_01.png"];
    let stop;
    // 随机选择一张图片
    function getRandomImage() {
        const randomIndex = Math.floor(Math.random() * image.length);
        const img = new Image();
        img.src = image[randomIndex];
        return img;
    }

    function Sakura(x, y, s, r, fn) {
        this.x = x;
        this.y = y;
        this.s = s;
        this.r = r;
        this.fn = fn;
        this.img = getRandomImage(); // 初始化时随机选择图片
    }

    Sakura.prototype.draw = function (cxt) {
        cxt.save();
        const xc = 40 * this.s / 4;
        cxt.translate(this.x, this.y);
        cxt.rotate(this.r);
        cxt.drawImage(this.img, 0, 0, 40 * this.s, 40 * this.s)
        cxt.restore();
    }

    Sakura.prototype.update = function () {
        this.x = this.fn.x(this.x, this.y);
        this.y = this.fn.y(this.y, this.y);
        this.r = this.fn.r(this.r);
        if (this.x > window.innerWidth || this.x < 0 || this.y > window.innerHeight || this.y < 0) {
            this.r = getRandom('fnr');
            if (Math.random() > 0.4) {
                this.x = getRandom('x');
                this.y = 0;
                this.s = getRandom('s');
                this.r = getRandom('r');
            } else {
                this.x = window.innerWidth;
                this.y = getRandom('y');
                this.s = getRandom('s');
                this.r = getRandom('r');
            }
        }
    }

    SakuraList = function () {
        this.list = [];
    }

    SakuraList.prototype.push = function (sakura) {
        this.list.push(sakura);
    }

    SakuraList.prototype.update = function () {
        let i = 0, len = this.list.length;
        for (; i < len; i++) {
            this.list[i].update();
        }
    }

    SakuraList.prototype.draw = function (cxt) {
        let i = 0, len = this.list.length;
        for (; i < len; i++) {
            this.list[i].draw(cxt);
        }
    }

    SakuraList.prototype.get = function (i) {
        return this.list[i];
    }

    SakuraList.prototype.size = function () {
        return this.list.length;
    }

    function getRandom(option) {
        let ret, random;
        switch (option) {
            case 'x':
                ret = Math.random() * window.innerWidth;
                break;
            case 'y':
                ret = Math.random() * window.innerHeight;
                break;
            case 's':
                ret = Math.random();
                break;
            case 'r':
                ret = Math.random() * 6;
                break;
            case 'fnx':
                random = -0.5 + Math.random();
                ret = function (x, y) {
                    return x + 0.5 * random - 1.7;
                };
                break;
            case 'fny':
                random = 1.5 + Math.random() * 0.7
                ret = function (x, y) {
                    return y + random;
                };
                break;
            case 'fnr':
                random = Math.random() * 0.03;
                ret = function (r) {
                    return r + random;
                };
                break;
        }
        return ret;
    }

    function startSakura() {
        stopp()
        requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame;
        let canvas = document.createElement('canvas'),
            cxt;
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        canvas.setAttribute('style', 'position: fixed;left: 0;top: 0;pointer-events: none;');
        canvas.setAttribute('id', 'canvas_sakura');
        document.getElementsByTagName('body')[0].appendChild(canvas);
        cxt = canvas.getContext('2d');
        const sakuraList = new SakuraList();
        for (let i = 0; i < 50; i++) {
            let sakura, randomX, randomY, randomS, randomR, randomFnx, randomFny, randomFnR;
            randomX = getRandom('x');
            randomY = getRandom('y');
            randomR = getRandom('r');
            randomS = getRandom('s');
            randomFnx = getRandom('fnx');
            randomFny = getRandom('fny');
            randomFnR = getRandom('fnr');
            sakura = new Sakura(randomX, randomY, randomS, randomR, {
                x: randomFnx,
                y: randomFny,
                r: randomFnR
            });
            sakura.draw(cxt);
            sakuraList.push(sakura);
        }
        stop = requestAnimationFrame(function () {
            cxt.clearRect(0, 0, canvas.width, canvas.height);
            sakuraList.update();
            sakuraList.draw(cxt);
            stop = requestAnimationFrame(arguments.callee);
        })
    }

    window.onresize = function () {
        const canvasSnow = document.getElementById('canvas_sakura');
        if (canvasSnow) {
            canvasSnow.width = window.innerWidth;
            canvasSnow.height = window.innerHeight;
        }
    };


    // 启动动画
    window.onload = function () {
        startSakura();
    }

    function stopp() {
        let child = document.getElementById("canvas_sakura");
        if (child) {
            child.parentNode.removeChild(child);
            window.cancelAnimationFrame(stop);
        }
    }


})();
