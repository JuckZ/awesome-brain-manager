/* eslint-disable */
// @ts-nocheck
export async function getWeather(city) {
    return '';
    const key = 'dc0f31ac6f37484f88e3e7d45b84e403'; //尽量换成自己申请的key以免接口失效https://console.qweather.com
    let locationId = '';
    let windydesc = '';
    if (city) {
        const location = await searchCity(city, key);
        locationId = location.id;
    } else {
        const location = await getpos(key);
        locationId = location.id;
        city = location.name;
    }
    const weather = await getQWeather(locationId, key);
    if (weather == '-1') {
        return await getWWeather(city);
    } else {
        const air = await getair(locationId, key);
        const windyspeed = Math.max(weather[0].windSpeedDay, weather[0].windSpeedNight);
        if (windyspeed < 12) {
            //小风
            windydesc = '微风习习';
        } else if (windyspeed < 39) {
            //小风
            windydesc = '清风徐徐';
        } else windydesc = '有' + today.windDirDay + '风出没，风力' + today.windScaleDay + '级';
        const today = weather[0];
        const desc = `${city} ${today.textDay}，${today.tempMin}~${today.tempMax}℃ ${
            air.category
        } ${windydesc}${today.moonPhase.replace(/[\u4e00-\u9fa5]/g, '')}`;
        return desc;
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
// 和风天气入口获取天气信息
async function getQWeather(locationId, key) {
    days = 1;
    const weatherUrl = `https://devapi.qweather.com/v7/weather/3d?location=${locationId}&key=${key}`;
    const wUrl = new URL(weatherUrl);
    const res = await request({
        url: wUrl.href,
        method: 'GET',
    });

    const data = JSON.parse(res);
    if (data.code != '200') {
        return -1;
    }
    const weather = data.daily.slice(0, 1);

    //添加表情
    for (let i = 0; i < days; i++) {
        const textDay = weather[i].textDay;
        const moon = weather[i].moonPhase;
        if (textDay.includes('雨')) {
            weather[i].textDay = '🌧' + textDay;
        } else if (textDay.includes('云')) {
            weather[i].textDay = '⛅' + textDay;
        } else if (textDay.includes('晴')) {
            weather[i].textDay = '🌞' + textDay;
        } else if (textDay.includes('雪')) {
            weather[i].textDay = '❄' + textDay;
        } else if (textDay.includes('阴')) {
            weather[i].textDay = '🌥' + textDay;
        } else if (textDay.includes('风')) {
            weather[i].textDay = '🍃' + textDay;
        } else if (textDay.includes('雷')) {
            weather[i].textDay = '⛈' + textDay;
        } else if (textDay.includes('雾')) {
            weather[i].textDay = '🌫' + textDay;
        }
        switch (moon) {
            case '新月':
                weather[i].moonPhase = '🌑' + moon;
                break;
            case '峨眉月':
                weather[i].moonPhase = '🌒' + moon;
                break;
            case '朔月':
                weather[i].moonPhase = '🌑' + moon;
                break;
            case '娥眉月':
                weather[i].moonPhase = '🌒' + moon;
                break;
            case '上弦月':
                weather[i].moonPhase = '🌓' + moon;
                break;
            case '盈凸月':
                weather[i].moonPhase = '🌔' + moon;
                break;
            case '满月':
                weather[i].moonPhase = '🌕' + moon;
                break;
            case '亏凸月':
                weather[i].moonPhase = '🌖' + moon;
                break;
            case '下弦月':
                weather[i].moonPhase = '🌗' + moon;
                break;
            default:
                weather[i].moonPhase = '🌘' + moon;
        }
    }
    return weather;
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
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json;charset=gb2312',
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.100.4758.11 Safari/537.36',
        },
    });

    return res;
}
async function getpos(key) {
    let result = await urlGet('http://whois.pconline.com.cn/ipJson.jsp?json=true');
    result = JSON.parse(result);
    const city = result.cityCode;
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
