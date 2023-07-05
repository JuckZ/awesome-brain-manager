import { describe, expect, it } from 'vitest';
import { getWeather } from '@/api/weather';

const utils = {
    getWeather: apiKey => {
        return getWeather({
            apiKey: apiKey || 'e6d27287b8d54b5da382f19086dac223',
        });
    },
};
describe('weather', () => {
    it('getWeather', () => {
        const weather = utils.getWeather(null);
        console.log(weather);
        expect(weather).not.null;
    });
});
