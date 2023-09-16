import { beforeAll, describe, expect, it } from 'vitest';
import { getAir, getCurrentLocation, getWeather, getWeatherDescription, getWttrWeather } from '@/api/weather';

let locationId = '';
const apiKey = process.env.VITE_QWEATHER_APIKEY;
const amapKey = process.env.VITE_AMAP_APIKEY;
let cityName = '';
beforeAll(async () => {
    const currentLocationResponse = await getCurrentLocation(apiKey, amapKey);
    const location = currentLocationResponse?.location[0];
    if (location) {
        locationId = location.id;
        cityName = location.name;
    } else {
        locationId = '101010100';
    }
});
describe('weather', () => {
    it.skip('getWttrWeather', async () => {
        const weather = await getWttrWeather('');
        expect(weather).not.null;
    });

    it('getWeather', async () => {
        await Promise.all([getWeather({ apiKey, amapKey }), getAir(locationId, apiKey)]).then(([weather, air]) => {
            if (weather?.daily[0] && air) {
                const desc = cityName + getWeatherDescription(weather?.daily[0], air?.now).desc;
                expect(desc).not.null;
                return desc;
            }
        });
    });
});
