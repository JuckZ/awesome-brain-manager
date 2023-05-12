import { request } from '@/utils/request';

// 你的和风天气API密钥
const API_KEY = '<你的和风天气API密钥>';

const locationId = '';

/**
 * 天气预报接口返回数据的类型定义
 */
interface WeatherDailyResponse {
    /** 预报日期，格式为 YYYY-MM-DD */
    fxDate: string;

    /** 日出时间，以 24 小时制表示，在高纬度地区可能为空 */
    sunrise: string;

    /** 日落时间，以 24 小时制表示，在高纬度地区可能为空 */
    sunset: string;

    /** 当天月升时间，以 24 小时制表示，可能为空 */
    moonrise: string;

    /** 当天月落时间，以 24 小时制表示，可能为空 */
    moonset: string;

    /** 月相名称，如新月、满月等 */
    moonPhase: string;

    /** 月相图标代码，图标可通过天气状况和图标下载 */
    moonPhaseIcon: string;

    /** 预报当天最高温度，单位为摄氏度 */
    tempMax: number;

    /** 预报当天最低温度，单位为摄氏度 */
    tempMin: number;

    /** 预报白天天气状况的图标代码，图标可通过天气状况和图标下载 */
    iconDay: string;

    /** 预报白天天气状况文字描述，包括阴晴雨雪等天气状态的描述 */
    textDay: string;

    /** 预报夜间天气状况的图标代码，图标可通过天气状况和图标下载 */
    iconNight: string;

    /** 预报晚间天气状况文字描述，包括阴晴雨雪等天气状态的描述 */
    textNight: string;

    /** 预报白天风向360角度，取值为 0 - 360 */
    wind360Day: number;

    /** 预报白天风向，如北风、东北风等 */
    windDirDay: string;

    /** 预报白天风力等级，如微风、强风等 */
    windScaleDay: string;

    /** 预报白天风速，单位为公里/小时 */
    windSpeedDay: number;

    /** 预报夜间风向360角度，取值为 0 - 360 */
    wind360Night: number;

    /** 预报夜间当天风向，如北风、东北风等 */
    windDirNight: string;

    /** 预报夜间风力等级，如微风、强风等 */
    windScaleNight: string;

    /** 预报夜间风速，单位为公里/小时 */
    windSpeedNight: number;

    /** 预报当天总降水量，默认单位：毫米 */
    precip: number;

    /** 紫外线强度指数，取值为 0 - 11+，其中 11+ 表示极高 */
    uvIndex: number;

    /** 相对湿度，百分比数值，取值为 0 - 100 */
    humidity: number;

    /** 大气压强，默认单位：百帕 */
    pressure: number;

    /** 能见度，默认单位：公里 */
    vis: number;

    /** 云量，百分比数值，取值为 0 - 100，可能为空 */
    cloud: number;
}

/**
 * 状态码及其含义请参考API文档
 */
interface WeatherResponse {
    code: string; // API状态码
    updateTime: string; // 最近更新时间
    fxLink: string; // 当前数据的响应式页面，方便嵌入网站或应用
    daily: WeatherDailyResponse[]; // 天气预报数据
    refer: {
        sources: string[]; // 原始数据来源，可能为空
        license: string[]; // 数据许可或版权声明，可能为空
    };
}

/**
 * 用于日记的天气数据
 */
class WeatherResponseForJournal {
    /** 风速 */
    windyspeed: number;
    /** 风速描述 */
    windydesc: '微风习习' | '清风徐徐' | unknown;
    /** 温度 */
    temp: number;
    /** 天气描述 */
    text: string;
    /** 天气图标 */
    icon: string;
    /** 湿度 */
    humidity: number;
    /** 能见度 */
    vis: number;
    /** 云量 */
    cloud: number;
    /** 紫外线强度指数 */
    uvIndex: number;
    /** 月相名称 */
    moonPhase: string;
    /** 月相图标代码，图标可通过天气状况和图标下载 */
    moonPhaseIcon: string;
    /** 日出时间，在高纬度地区可能为空 */
    sunrise: string;
    /** 日落时间，在高纬度地区可能为空 */
    sunset: string;

    constructor(weather: WeatherDailyResponse) {
        this.init(weather);
    }

    async init(weather: WeatherDailyResponse) {
        this.windyspeed = Math.max(weather.windSpeedDay, weather.windSpeedNight);
        if (this.windyspeed < 12) {
            this.windydesc = '微风习习';
        } else if (this.windyspeed < 39) {
            //小风
            this.windydesc = '清风徐徐';
        } else {
            this.windydesc = '有' + weather.windDirDay + '风出没，风力' + weather.windScaleDay + '级';
        }
        this.temp = weather.tempMax;
        this.text = weather.textDay;
        const air = await getair(locationId, API_KEY);
        this.desc = `${city} ${weather.textDay}, ${weather.tempMin}~${weather.tempMax}℃ ${air.category} ${
            this.windydesc
        }${weather.moonPhase.replace(/[\u4e00-\u9fa5]/g, '')}`;
        this.icon = weather.iconDay;
        this.humidity = weather.humidity;
        this.vis = weather.vis;
        this.cloud = weather.cloud;
        this.uvIndex = weather.uvIndex;
        this.moonPhase = weather.moonPhase;
        this.moonPhaseIcon = weather.moonPhaseIcon;
        this.sunrise = weather.sunrise;
        this.sunset = weather.sunset;
        //添加表情
        const textDay = weather.textDay;
        const moon = weather.moonPhase;
        if (textDay.includes('雨')) {
            weather.textDay = '🌧' + textDay;
        } else if (textDay.includes('云')) {
            weather.textDay = '⛅' + textDay;
        } else if (textDay.includes('晴')) {
            weather.textDay = '🌞' + textDay;
        } else if (textDay.includes('雪')) {
            weather.textDay = '❄' + textDay;
        } else if (textDay.includes('阴')) {
            weather.textDay = '🌥' + textDay;
        } else if (textDay.includes('风')) {
            weather.textDay = '🍃' + textDay;
        } else if (textDay.includes('雷')) {
            weather.textDay = '⛈' + textDay;
        } else if (textDay.includes('雾')) {
            weather.textDay = '🌫' + textDay;
        }
        switch (moon) {
            case '新月':
                weather.moonPhase = '🌑' + moon;
                break;
            case '峨眉月':
                weather.moonPhase = '🌒' + moon;
                break;
            case '朔月':
                weather.moonPhase = '🌑' + moon;
                break;
            case '娥眉月':
                weather.moonPhase = '🌒' + moon;
                break;
            case '上弦月':
                weather.moonPhase = '🌓' + moon;
                break;
            case '盈凸月':
                weather.moonPhase = '🌔' + moon;
                break;
            case '满月':
                weather.moonPhase = '🌕' + moon;
                break;
            case '亏凸月':
                weather.moonPhase = '🌖' + moon;
                break;
            case '下弦月':
                weather.moonPhase = '🌗' + moon;
                break;
            default:
                weather.moonPhase = '🌘' + moon;
        }
    }
}

//wttr 天气入口
async function getWWeather(city) {
    if (city === undefined) {
        city = '';
    }
    let result = await fetch('https://wttr.in/' + city + '?format=%l:+%c+%t+%w').then(async res => await res.text());
    result = result.replace(/:/g, '').replace(/\+/g, '').replace(', China', '');
    return result;
}

export async function getWeather(latitude: number, longitude: number): Promise<WeatherResponse | null> {
    try {
        const response = await request({
            url: `https://devapi.qweather.com/v7/weather/now?location=${longitude},${latitude}&key=${API_KEY}`,
            method: 'GET',
        });
        const data = JSON.parse(response);
        if (data.code != '200') {
            return null;
        }
        const weather = data.daily[0] as WeatherResponse;
        return weather;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async position => {
            // position.coords.latitude, position.coords.longitude
            resolve(position);
        }, reject);
    });
}

// 获取空气质量信息
async function getair(locationId, key) {
    const weatherUrl = `https://devapi.qweather.com/v7/air/now?location=${locationId}&key=${key}`;
    const wUrl = new URL(weatherUrl);
    const res = await request({
        url: wUrl.href,
        method: 'GET',
    });

    const data = JSON.parse(res);
    if (data.code != '200') {
        return -1;
    }
    const air = data.now;
    return air;
}

//查询位置
async function urlGet(url) {
    const finalURL = new URL(url);
    const res = await request({
        url: finalURL.href,
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json;charset=gb2312',
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.100.4758.11 Safari/537.36',
        },
    });

    return res;
}

async function getpos(key) {
    const resultStr = await urlGet('http://whois.pconline.com.cn/ipJson.jsp?json=true');
    const resultObj = JSON.parse(resultStr) as { city: string; cityCode: string };
    const city = resultObj.cityCode;
    return await searchCity(city, key);
}

//查询城市ID
async function searchCity(city, key) {
    const searchUrl = `https://geoapi.qweather.com/v2/city/lookup?location=${city}&key=${key}&number=1`;
    const sUrl = new URL(searchUrl);
    const res = await request({
        url: sUrl.href,
        method: 'GET',
    });
    const data = JSON.parse(res);
    if (data.code == '200') {
        return data.location[0];
    }
    return -1;
}
