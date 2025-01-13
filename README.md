# 说明

原生 js 实现红包雨插件，可支持跨框架（微信小程序除外）

# 使用方式 1（支持 import 项目）:

更改：
red-wrap-rain.js 文件将 RedWrapRain 类 export 暴露出去
`export default class RedWrapRain extends Img{}`

引入：
`import RedWrapRain from './redWrapRain/red-wrap-rain.js';`

需要调用的地方 定义关于红包雨的参数，实例化红包雨类，传入红包雨完毕后的回调处理函数
`	let params = {};
		let rwr = new RedWrapRain(params);
		rwr.start((redPacketsCount) => {
			// console.log('回调红包个数', redPacketsCount);
	});
    `

# 使用方式 2（原生写法）：

引入：
`<script src="./redWrapRain/red-wrap-rain.js"></script>`
传参并实例化及回调处理函数：
`function doRain(){
    let params ={
         duration: 15, //红包雨时长（单位：秒）
		space: 300, // 生成红包间隔（单位：毫秒）
		speedMax: 10, // 红包下落速度随机值__最大值
		speedMin: 5, // 红包下落速度随机值__最小值
		blessDie: 500, // 祝福语当前状态( 创建 | 消失 )（单位：毫秒）
		redImgSrc: './img/bag.png', // 红包图片
		redImgRatio: 1, // 红包宽高比例
		activityTheme: '福袋'
        }
    let rwr = new RedWrapRain(params);
    rwr.start((redPacketsCount) => {
        // console.log('回调红包个数', redPacketsCount);
        document.getElementById('rain-over').innerHTML=`红包雨结束，您抢到${redPacketsCount}个红包`
	});
}`

# 可传入参数说明

    #space = 300; // 生成红包间隔  最小300
    #speed_max = 5; // 红包下落速度随机值__最大值
    #speed_min = 1; // 红包下落速度随机值__最小值
    #red_img_src = ''; //红包图片
    #red_img_ratio = 1; // 红包宽高比例
    #duration = 5; // 红包雨下落时长
    #activityTheme = '红包'; // 活动主题
