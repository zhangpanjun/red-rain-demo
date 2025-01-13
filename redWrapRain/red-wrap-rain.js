class Img {
	constructor() {
		this.Src = '../img/bag.png';// 定义一个默认图片
	}
}

// 红包下落方法类（每个红包会循环调用下落函数，只有当  当前红包超出屏幕/红包雨时长结束  才会停止对应红包的定时器）
class downInterval {
	#timerId = null;// 每个红包 下落定时器
	#loop = null;//loop函数（下落执行函数）
	#count = 0; // 计数
	#timer = Date.now();// 当前时间
	#return = false; // 定时器是否停止flag
	// 构造器
    /**
     *
     * @param {*} cb 回调函数
     * @param {*} time 下降速度
     * @param {*} rain_over 红包雨是否结束标识
     * @returns
     */
	constructor(cb, time = 0, rain_over) {
		if (typeof (time * 1) !== 'number') {
			cb(new Error('抱歉! 您的时间参数必须为 数字类型 或者 字符串数字类型'));
			return;
		}

		this.#loop = () => {
			if (Date.now() > this.#timer + time * (this.#count + 1)) {
				cb();
				this.#count++;
			}
			if (this.#return || rain_over) return; // 如果标识为true 就是停止定时器
			this.#timerId = requestAnimationFrame(this.#loop);// 创建定时器
		};
		this.#timerId = requestAnimationFrame(this.#loop);
	}

	// 清除定时器
	clear() {
		this.#return = true; // 改变标识为 true
		cancelAnimationFrame(this.#timerId); // 清除 requestAnimationFrame
	}
}
// 红包方法类（每创建一个红包就会调用函数来实现  红包数量及红包雨已执行时长++ 当执行时长>=设定的红包雨时长，才会停止生成红包定时器）
class Interval {
	#timerId = null; // 定时器
	#loop = null; // 红包定时执行函数
	#redCount = 0;//红包数量
	#timer = Date.now();// 当前时间
	#secondCount = 0;// 已执行红包雨时长
	#return = false;// 红包雨结束标识
	// 构造器
    /**
     *
     * @param {*} cb 回调函数
     * @param {*} space 间隔多久生成下一个红包
     * @returns
     */
	constructor(cb, space = 0) {
		if (typeof (space * 1) !== 'number') {
			cb(new Error('抱歉! 您的时间参数必须为 数字类型 或者 字符串数字类型'));
			return;
		}
		this.#loop = () => {
			if (Date.now() > this.#timer + space * (this.#redCount + 1)) {
                //每生成一个红包，红包数量+1
				if (Date.now() > this.#timer + 1000 * (this.#secondCount + 1)) {
                    // 每过1000毫秒，已执行红包雨时长+1
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
// 实现红包雨方法类
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

	// 接收外部传入的红包雨参数
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
	// 将红包容器渲染到页面
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
	// 开启红包雨
	start = (callback) => {
		if (this.#rain_over) return;
		this.#rainOverCallbackFun = callback ? callback : this.#rainOverCallbackFun;
		this.#createRWR_wrap(this);// 先创建红包雨dom容器
		this.#renderTo_page(this);//渲染到页面
		this.#create_RW(this);//开启定时器创建红包
	};
	// 红包雨结束后回调
	end = () => {
        // 将红包雨容器移除视线
		this.#hideFrom_page();
        // 将戳中的红包数包裹返回
		this.#rainOverCallbackFun(this.#red_clicked_count);
	};
    // 将红包容器彻底从page中移除
	remove = () => {
		this.#removeFrom_page();
	};
	// 创建红包
	#create_RW = (T) => {
		T.#timer = new Interval((redCount, secondCount) => {
			let img = document.createElement('img');
			img.src = T.#red_img_src;
			img.draggable = false;
			img.id = redCount + 1;// 给每个红包一个唯一id
			let random_height = Math.floor(Math.random() * 80) + 100;// 随机生成红包高度
			let random_width = random_height * T.#red_img_ratio; // 按照传入的红包图片宽高比例得到随机生成的红包的宽度，防止变形
			let rotateZ_F =
				Math.floor(Math.random() * 10) % 2 == 0
					? -Math.floor(Math.random() * 25)
					: Math.floor(Math.random() * 25);// 图片随机翻转角度
			img.style.cssText = `pointer-events: auto;position: absolute;left: ${Math.floor(
				Math.random() * (document.body.clientWidth - 180)
			)}px; top: -250px; width: ${random_width}px; height:${random_height}px; transform: rotate(${rotateZ_F}deg); cursor: pointer; user-select:none;`;
			T.#doSliding(T, secondCount);// 创建红包的同时，执行红包雨时长倒计时动画展示效果
			if (secondCount >= T.#duration) { // 若红包雨时长>=设定的红包雨时长则终止红包雨定时器，清空红包点击事件list,并将红包雨容器隐藏
				T.#rain_over = true;
				T.#timer.clear();
				T.#click_arr = [];
				T.end();
			} else {
                // 否则生成红包，给每个红包绑定点击事件，执行下落定时器
				T.#RWR_wrap.appendChild(img);
				T.#RW_click(T, img);
				T.#down(T, img, secondCount);
			}
		}, T.#space);
	};

	// 下落方法
    /**
     *
     * @param {*} T 类this指向
     * @param {*} img 当前下落红包
     */
	#down = (T, img) => {
		let stp = Math.random() * T.#speed_max + T.#speed_min;// 随机生成当前img距离顶部高度，根据传入的下落速度最小最大值来控制下落速度
		let timer = new downInterval(
			() => {
				img.style.top = img.style.top.split('px')[0] * 1 + stp + 'px';
				if (img.getBoundingClientRect().top > document.body.clientHeight) { // 当前红包超出屏幕高度则，
					timer.clear(); //清除此红包下落定时器
					T.#RWR_wrap.removeChild(img); // 从红包容器中移除元素
					T.#find_RW(T, img.getAttribute('id') * 1);// 从红包点击事件中移除对应事件
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
				T.#find_RW(T, img.getAttribute('id') * 1);// 戳中一次后就不能再次戳中了
				T.#red_clicked_count += 1;//戳中则抢到的数量+1
				document.getElementById('red-rain-get-reward-count').textContent =
					T.#red_clicked_count; // 动态更新视图 已抢红包数量
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
