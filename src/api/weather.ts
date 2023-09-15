const city = '';

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

interface QWeatherBaseResponse {
    code: string; // API状态码
    updateTime: string; // 最近更新时间
    fxLink: string; // 当前数据的响应式页面，方便嵌入网站或应用
    refer: {
        sources: string[]; // 原始数据来源，可能为空
        license: string[]; // 数据许可或版权声明，可能为空
    };
}

interface CityLocation {
    id: string;
    name: string;
    adm2: string;
    adm1: string;
    country: string;
    tz: string;
    utcOffset: string;
    lat: string;
    lon: string;
}

interface CityLocationResponse {
    code: string;
    location: CityLocation[];
    refer: {
        sources: string[];
        license: string[];
    };
}

/**
 * 状态码及其含义请参考API文档
 */
interface WeatherResponse extends QWeatherBaseResponse {
    daily: WeatherDailyResponse[]; // 天气预报数据
}

interface AirResponse {
    pubTime: string; // 数据发布时间
    aqi: string; // 空气质量指数
    level: string; // 空气质量指数等级
    category: string; // 空气质量指数级别
    primary: string; // 主要污染物
    pm10: string; // pm10
    pm2p5: string; // pm2.5
    no2: string; // 二氧化氮
    so2: string; // 二氧化硫
    co: string; // 一氧化碳
    o3: string; // 臭氧
}
interface RealTimeAirResponse extends QWeatherBaseResponse {
    now: AirResponse;
    station: Array<{
        pubTime: string; // 数据发布时间
        name: string; // 监测站名称
        id: string; // 监测站ID
        aqi: string; // 空气质量指数
        level: string; // 空气质量指数等级
        category: string; // 空气质量指数级别
        primary: string; // 主要污染物
        pm10: string; // pm10
        pm2p5: string; // pm2.5
        no2: string; // 二氧化氮
        so2: string; // 二氧化硫
        co: string; // 一氧化碳
        o3: string; // 臭氧
    }>; // 空气质量监测站点数据
}

/**
 * 用于日记的天气数据
 */
export class WeatherResponseForJournal {
    /** 风速 */
    windyspeed: number;
    /** 风速描述 */
    windydesc: '微风习习' | '清风徐徐' | unknown;
    /** 温度 */
    temp: number;
    /** 预报当天最高温度，单位为摄氏度 */
    tempMax: number;
    /** 预报当天最低温度，单位为摄氏度 */
    tempMin: number;
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
    /** 空气质量指数级别 */
    category: string;
    /** textDay */
    textDay: string;
    /** obsidian描述 */
    desc: string;

    getDesc(weather: WeatherDailyResponse, air: AirResponse) {
        this.category = air.category;
        this.tempMax = weather.tempMax;
        this.tempMin = weather.tempMin;
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
        this.icon = weather.iconDay;
        this.humidity = weather.humidity;
        this.vis = weather.vis;
        this.cloud = weather.cloud;
        this.uvIndex = weather.uvIndex;
        this.moonPhase = weather.moonPhase;
        this.moonPhaseIcon = weather.moonPhaseIcon;
        this.sunrise = weather.sunrise;
        this.sunset = weather.sunset;
        const textDay = weather.textDay;
        if (textDay.includes('雨')) {
            this.textDay = '🌧' + textDay;
        } else if (textDay.includes('云')) {
            this.textDay = '⛅' + textDay;
        } else if (textDay.includes('晴')) {
            this.textDay = '🌞' + textDay;
        } else if (textDay.includes('雪')) {
            this.textDay = '❄' + textDay;
        } else if (textDay.includes('阴')) {
            this.textDay = '🌥' + textDay;
        } else if (textDay.includes('风')) {
            this.textDay = '🍃' + textDay;
        } else if (textDay.includes('雷')) {
            this.textDay = '⛈' + textDay;
        } else if (textDay.includes('雾')) {
            this.textDay = '🌫' + textDay;
        }
        switch (weather.moonPhase) {
            case '新月':
                this.moonPhaseIcon = '🌑';
                break;
            case '峨眉月':
                this.moonPhaseIcon = '🌒';
                break;
            case '朔月':
                this.moonPhaseIcon = '🌑';
                break;
            case '娥眉月':
                this.moonPhaseIcon = '🌒';
                break;
            case '上弦月':
                this.moonPhaseIcon = '🌓';
                break;
            case '盈凸月':
                this.moonPhaseIcon = '🌔';
                break;
            case '满月':
                this.moonPhaseIcon = '🌕';
                break;
            case '亏凸月':
                this.moonPhaseIcon = '🌖';
                break;
            case '下弦月':
                this.moonPhaseIcon = '🌗';
                break;
            default:
                this.moonPhaseIcon = '🌘';
        }

        this.desc = `${this.textDay}, ${this.tempMin}~${this.tempMax}℃ ${this?.category} ${this.windydesc}${this.moonPhaseIcon}`;
        return this.desc;
    }
}

//wttr 天气入口
export async function getWttrWeather(city: string) {
    let result = await fetch('https://wttr.in/' + city + '?format=%l:+%c+%t+%w').then(async res => await res.text());
    result = result.replace(/:/g, '').replace(/\+/g, '').replace(', China', '');
    return result;
}

export async function getWeatherDaily(latitude: number, longitude: number, apiKey): Promise<WeatherResponse | null> {
    try {
        const url = `https://devapi.qweather.com/v7/weather/3d?location=${longitude},${latitude}&key=${apiKey}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        const data = await response.json();
        console.warn(data);
        if (data.code != '200') {
            return null;
        }
        const weather = data as WeatherResponse;
        return weather;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getWeather({ apiKey }): Promise<WeatherResponse | null> {
    try {
        const cityLocationResponse = await getCurrentLocation(apiKey);
        if (cityLocationResponse === null) {
            return null;
        }
        const cityLocation = cityLocationResponse.location[0];
        const weather = await getWeatherDaily(parseFloat(cityLocation.lat), parseFloat(cityLocation.lon), apiKey);
        return weather;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getCurrentLocation(apiKey): Promise<CityLocationResponse | null> {
    return new Promise((resolve, reject) => {
        getpos()
            .then(async position => {
                const city = position.cityCode;
                const res = await searchCity(city, apiKey);
                resolve(res);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
        // navigator.geolocation.getCurrentPosition(async position => {
        //     // position.coords.latitude, position.coords.longitude
        //     resolve(position);
        // }, reject);
    });
}

/**
 * 获取空气质量信息
 * @param locationId 地理位置ID
 * @param apiKey API Key
 * @returns
 */
export async function getAir(locationId, apiKey): Promise<RealTimeAirResponse | null> {
    const weatherUrl = `https://devapi.qweather.com/v7/air/now?location=${locationId}&key=${apiKey}`;
    const wUrl = new URL(weatherUrl);
    const res = await fetch(wUrl.href, {
        method: 'GET',
    });

    const data = await res.json();
    if (data.code != '200') {
        return null;
    }
    const air = data as RealTimeAirResponse;
    return air;
}

//查询位置
async function getpos() {
    const res = await fetch('https://whois.pconline.com.cn/ipJson.jsp?json=true', {
        method: 'GET',
    });
    const resultObj = (await res.json()) as {
        city: string;
        cityCode: string;
        ip: string;
        pro: string;
        proCode: string;
        region: string;
        regionCode: string;
        addr: string;
        regionNames: string;
        error: string;
    };
    return resultObj;
}

//查询城市ID
async function searchCity(city, apiKey) {
    const searchUrl = `https://geoapi.qweather.com/v2/city/lookup?location=${city}&key=${apiKey}&number=1`;
    const sUrl = new URL(searchUrl);
    const res = await fetch(sUrl.href, {
        method: 'GET',
    });
    const data = (await res.json()) as CityLocationResponse;
    if (data.code == '200') {
        return data;
    } else {
        return null;
    }
}

export async function weatherDesc({ apiKey, type }) {
    let locationId = '';
    let cityName = '';
    const currentLocationResponse = await getCurrentLocation(apiKey);
    const location = currentLocationResponse?.location[0];
    if (location) {
        locationId = location.id;
        cityName = location.name;
    } else {
        locationId = '101010100';
    }

    if (type === 'obsidian') {
        await Promise.all([getWeather({ apiKey }), getAir(locationId, apiKey)]).then(([weather, air]) => {
            if (weather?.daily[0] && air) {
                const jouranlResponse = new WeatherResponseForJournal();
                const desc = cityName + jouranlResponse.getDesc(weather?.daily[0], air?.now);
                return desc;
            }
        });
    }
    return '';
}
