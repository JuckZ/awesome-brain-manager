import { beforeAll, describe, expect, it } from 'vitest';
import { WeatherResponseForJournal, getAir, getCurrentLocation, getWeather, getWttrWeather } from '@/api/weather';

let locationId = '';
const apiKey = 'e6d27287b8d54b5da382f19086dac223';
let cityName = '';
beforeAll(async () => {
    const currentLocationResponse = await getCurrentLocation(apiKey);
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
        await Promise.all([getWeather({ apiKey }), getAir(locationId, apiKey)]).then(([weather, air]) => {
            console.log(weather);
            expect(weather).not.null;
            expect(weather?.daily[0]?.textDay).string;
            if (weather?.daily[0] && air) {
                const jouranlResponse = new WeatherResponseForJournal();
                const desc = cityName + jouranlResponse.getDesc(weather?.daily[0], air?.now);
                console.log(desc);
            }
        });
    });
});
