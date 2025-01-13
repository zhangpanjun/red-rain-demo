class Img {
	constructor() {
		this.Src = '../img/bag.png';
	}
}

// RAF
class downInterval {
	#timerId = null;
	#loop = null;
	#count = 0;
	#timer = Date.now();
	#return = false;
	// 构造器
	constructor(cb, time = 0, rain_over) {
		if (typeof (time * 1) !== 'number') {
			cb(new Error('抱歉! 您的时间参数必须为 数字类型 或者 字符串数字类型'));
			return;
		}

		this.#loop = () => {
			if (Date.now() > this.#timer + time * (this.#count + 1)) {
				cb(this.#count);
				this.#count++;
			}
			if (this.#return || rain_over) return; // 如果标识为true 就是停止定时器
			this.#timerId = requestAnimationFrame(this.#loop);
		};
		this.#timerId = requestAnimationFrame(this.#loop);
	}

	// 清除定时器
	clear() {
		this.#return = true; // 改变标识为 true
		cancelAnimationFrame(this.#timerId); // 清除 requestAnimationFrame
	}
}
// RAF
class Interval {
	#timerId = null;
	#loop = null;
	#redCount = 0;
	#timer = Date.now();
	#secondCount = 0;
	#return = false;
	// 构造器
	constructor(cb, space = 0) {
		if (typeof (space * 1) !== 'number') {
			cb(new Error('抱歉! 您的时间参数必须为 数字类型 或者 字符串数字类型'));
			return;
		}
		this.#loop = () => {
			if (Date.now() > this.#timer + space * (this.#redCount + 1)) {
				if (Date.now() > this.#timer + 1000 * (this.#secondCount + 1)) {
					this.#secondCount++;
				}
				cb(this.#redCount, this.#secondCount);
				this.#redCount++;
			}

			if (this.#return) return; // 如果标识为true 就是停止定时器
			this.#timerId = requestAnimationFrame(this.#loop);
		};
		this.#timerId = requestAnimationFrame(this.#loop);
	}

	// 清除定时器
	clear() {
		this.#return = true; // 改变标识为 true
		cancelAnimationFrame(this.#timerId); // 清除 requestAnimationFrame
	}
}
// 红包雨
 class RedWrapRain extends Img {
	#rain_over = false; // 红包雨是否执行完毕
	#Fragment = null; // 文档碎片
	#RWR_wrap = null; // 红包雨容器
	#Body = document.body;
	#timer = null; // 创建红包的定时器
	#click_arr = []; // 每个红包绑定的点击事件
	#red_clicked_count = 0; // 点击到的红包个数

	#space = 300; // 生成红包间隔  最小300 加判断了
	#speed_max = 5; // 红包下落速度随机值__最大值
	#speed_min = 1; // 红包下落速度随机值__最小值
	#red_img_src = ''; //红包图片
	#red_img_ratio = 1; // 红包宽高比例
	#duration = 5; // 红包雨下落时长
	#activityTheme = '红包'; // 活动主题
	#rainOverCallbackFun = () => {}; // 红包雨结束后回调
	constructor(params) {
		super();
		let T = this;
		T.#initDownParams(T, params);
	}

	// 初始化红包下落状态参数
	#initDownParams = (T, params) => {
		T.#space = params.space ? (params.space <= 300 ? 300 : params.space) : T.#space;
		T.#speed_max = params.speedMax ? params.speedMax : T.#speed_max;
		T.#speed_min = params.speedMin ? params.speedMin : T.#speed_min;
		T.#red_img_src = params.redImgSrc ? params.redImgSrc : T.Src;
		T.#red_img_ratio = params.redImgRatio ? params.redImgRatio : T.#red_img_ratio;
		T.#duration = params.duration ? params.duration : T.#duration;
		T.#activityTheme = params.activityTheme ? params.activityTheme : T.#activityTheme;
	};

	// 创建红包容器
	#createRWR_wrap = (T) => {
		T.#Fragment = document.createDocumentFragment();
		T.#RWR_wrap = document.createElement('div');
		T.#RWR_wrap.id = 'rwr-wrap';
		T.#RWR_wrap.style.cssText = `pointer-events: none;position:fixed;left: 0;top: 0;z-index: 9999;width: 100vw;height: 100vh;background: transparent;`;
		T.#createRWR_slider_wrap(T);
		T.#Fragment.appendChild(T.#RWR_wrap);
	};
	// 创建滑块及已抢到的红包文案显示
	#createRWR_slider_wrap = (T) => {
		// 定义CSS样式字符串
		const cssStyles = `
            .red-rain-countdown-container {
                width: 100%;
                height: 100px;
                padding: 46px 32px 0 32px;
                box-sizing: border-box;
                z-index: 9999;
                position:absolute;
            }

            #red-rain-countdown-slider {
                width: 100%;
                height: 22px;
                background: #fe4a23;
                border-radius: 11px;
                position: relative;
                overflow: hidden;
            }
            #red-rain-countdown-text {
                width: 70px;
                height: 70px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                z-index: 100;
                border-radius: 50%;
                left: 0;
                top: 26px;
                background-image: url("../img/slider-bg.png");
                background-size: cover;
                font-family: Bebas;
                font-weight: 400;
                color: #ffffff;
                text-shadow: 0px 2px 4px #ff0e0e;
                font-size: 25px;
            }
            #red-rain-countdown-number {
                font-size: 30px;
                height: 42px;
                display: flex;
            }
            .red-rain-countdown-unit {
                height: 34px;
                display: flex;
            }
            .red-rain-get-reward {
                font-family: Source Han Sans CN;
                font-weight: 800;
                font-size: 31px;
                color: #ffffff;
                font-style: italic;
                background: linear-gradient(180deg, #ffffe9 0.146484375%, #fee055 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center;
                margin-top:10px;
            }
            #red-rain-get-reward-count {
                font-size: 48px;
            }
            `;

		// 创建一个style元素并设置其innerHTML为CSS样式字符串
		const styleElement = document.createElement('style');
		styleElement.innerHTML = cssStyles;
		styleElement.id = 'red-rain-custom-box';
		// 将style元素添加到head中
		document.head.appendChild(styleElement);

		// 创建red-rain-countdown-container元素
		const countdownContainer = document.createElement('div');
		countdownContainer.className = 'red-rain-countdown-container';

		// 创建red-rain-countdown-slider元素
		const countdownSlider = document.createElement('div');
		countdownSlider.id = 'red-rain-countdown-slider';
		countdownContainer.appendChild(countdownSlider);

		// 创建red-rain-countdown-text元素及其子元素
		const countdownText = document.createElement('div');
		countdownText.id = 'red-rain-countdown-text';

		const countdownNumber = document.createElement('span');
		countdownNumber.id = 'red-rain-countdown-number';
		countdownNumber.textContent = T.#duration; // 倒计时还剩多少秒

		const countdownUnit = document.createElement('span');
		countdownUnit.className = 'red-rain-countdown-unit';
		countdownUnit.textContent = 's';

		countdownText.appendChild(countdownNumber);
		countdownText.appendChild(countdownUnit);
		countdownContainer.appendChild(countdownText);

		// 创建包含“已抢红包”文本的<div>元素
		var getRewardDiv = document.createElement('div');
		getRewardDiv.className = 'red-rain-get-reward';
		getRewardDiv.textContent = `已抢${T.#activityTheme}：`; // 设置基础文本内容

		// 创建<span>元素用于显示红包数量，并设置其内容
		var getRewardCountSpan = document.createElement('span');
		getRewardCountSpan.id = 'red-rain-get-reward-count';
		getRewardCountSpan.textContent = T.#red_clicked_count; // 抢到的红包个数
		getRewardDiv.appendChild(getRewardCountSpan);
		let textNode = document.createTextNode('个');
		getRewardDiv.appendChild(textNode);

		countdownContainer.appendChild(getRewardDiv);
		// 将red-rain-countdown-container元素添加到 T.#RWR_wrap 中
		T.#RWR_wrap.appendChild(countdownContainer);
	};
	// 已划过的进度更改颜色
	#appendSliderAfterDom = (width) => {
		document.querySelector(
			'#red-rain-custom-box'
		).innerHTML += `#red-rain-countdown-slider::after {  content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: ${width}px;
        background: #ffe6cb;
        border-radius: 5px;}`;
	};
	// 计算滑块向右滑动距离及倒计时描述
	#startCountdown = (T, secondCount, transDisplay, transNumberDisplay) => {
		let currentDuration = T.#duration - secondCount; // 剩余可滑动时长
		let count = secondCount; //已滑动时长
		const second = T.#duration; // 可滑动秒数
		const clientWidth = document.body.clientWidth; // 动态获取屏幕跨端
		const canSlideWidth = clientWidth - 32 - 32 - 6; // 圆球可滑动的长度（屏幕宽 - padding左右 - 不超出屏幕容错值）
		const stepLength = Math.floor(canSlideWidth / second); //移动步长
		transDisplay.style.left = stepLength * count + 'px';
		transNumberDisplay.textContent = `${currentDuration}`;
		this.#appendSliderAfterDom(stepLength * count);
	};
	// 执行滑块滑动
	#doSliding = (T, secondCount) => {
		let transDisplay = document.querySelector('#red-rain-countdown-text'), // 圆球元素
			transNumberDisplay = document.querySelector('#red-rain-countdown-number'); // 倒计时文字元素
		T.#startCountdown(T, secondCount, transDisplay, transNumberDisplay);
	};
	// 渲染到页面
	#renderTo_page = (T) => {
		T.#Body.appendChild(T.#Fragment);
	};
	// 从页面中移除红包元素
	#removeFrom_page = () => {
		this.#Body.removeChild(this.#RWR_wrap);
	};
	// 红包雨弹窗从视觉中消除
	#hideFrom_page = () => {
		document.getElementById('rwr-wrap').style.visibility = 'hidden';
	};
	// 开始下红包
	start = (callback) => {
		if (this.#rain_over) return;
		this.#rainOverCallbackFun = callback ? callback : this.#rainOverCallbackFun;
		this.#createRWR_wrap(this);
		this.#renderTo_page(this);
		this.#create_RW(this);
	};
	// 红包雨结束后回调
	end = () => {
		this.#hideFrom_page();
		this.#rainOverCallbackFun(this.#red_clicked_count);
	};
	remove = () => {
		this.#removeFrom_page();
	};
	// 创建红包
	#create_RW = (T) => {
		T.#timer = new Interval((redCount, secondCount) => {
			let img = document.createElement('img');
			img.src = T.#red_img_src;
			img.draggable = false;
			img.id = redCount + 1;
			let random_height = Math.floor(Math.random() * 80) + 100;
			let random_width = random_height * T.#red_img_ratio;
			let rotateZ_F =
				Math.floor(Math.random() * 10) % 2 == 0
					? -Math.floor(Math.random() * 25)
					: Math.floor(Math.random() * 25);
			img.style.cssText = `pointer-events: auto;position: absolute;left: ${Math.floor(
				Math.random() * (document.body.clientWidth - 180)
			)}px; top: -250px; width: ${random_width}px; height:${random_height}px; transform: rotate(${rotateZ_F}deg); cursor: pointer; user-select:none;`;
			T.#doSliding(T, secondCount);
			if (secondCount >= T.#duration) {
				T.#rain_over = true;
				T.#timer.clear();
				T.#click_arr = [];
				T.end();
			} else {
				T.#RWR_wrap.appendChild(img);
				T.#RW_click(T, img);
				T.#down(T, img, secondCount);
			}
		}, T.#space);
	};

	// 下落方法
	#down = (T, img) => {
		let stp = Math.random() * T.#speed_max + T.#speed_min;
		let timer = new downInterval(
			() => {
				img.style.top = img.style.top.split('px')[0] * 1 + stp + 'px';
				if (img.getBoundingClientRect().top > document.body.clientHeight) {
					timer.clear();
					T.#RWR_wrap.removeChild(img);
					T.#find_RW(T, img.getAttribute('id') * 1);
					if (T.#RWR_wrap.children.length <= 1) {
						// 如果红包都到屏幕下方，看不见了，则把红包容器删掉
						T.remove();
					}
				}
			},
			10,
			T.#rain_over
		);
	};

	// 红包点击事件
	#RW_click = (T, img) => {
		let obj = {
			id: img.getAttribute('id') * 1,
			el: img,
			event: function () {
				T.#find_RW(T, img.getAttribute('id') * 1);
				T.#red_clicked_count += 1;
				document.getElementById('red-rain-get-reward-count').textContent =
					T.#red_clicked_count;
			},
		};
		img.addEventListener('click', obj.event);
		T.#click_arr.push(obj);
	};

	// 找到被销毁的红包，解除他的点击事件
	#find_RW = (T, id) => {
		let fd = T.#click_arr.find((item) => item.id === id); // 找到这个消失的红包
		if (fd) {
			fd.el.removeEventListener('click', fd.event); // 解绑点击事件
			T.#click_arr = T.#click_arr.filter((item) => item.id !== id); // 删除这个对象
		}
	};
}
