import { describe, expect, it } from 'vitest';
import { getWeather } from '@/api/weather';

const apiKey = 'e6d27287b8d54b5da382f19086dac223';
describe('weather', () => {
    it('getWeather', async () => {
        const weather = await getWeather({ apiKey });
        console.log(weather);
        expect(weather).not.null;
        expect(weather?.daily[0]?.textDay).string;
    });
});
