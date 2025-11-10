
import * as utils from '../src/utils.ts';
import {id, init} from '../src/app.ts'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { mockCanvas } from './setup.ts';


describe('Block Acess', () => {

    beforeEach(async () => {
        vi.useFakeTimers()
        mockCanvas();

        document.body.innerHTML = '<div id="root"></div>';
        window.history.pushState({}, '', '/');

        // Simulate not logged in
        id.username = '';

        init();
    });

    it('BLOCK NAVIGATETO /intra', async () => {
        utils.navigateTo('/intra');

        // Expect redirected to /
        expect(window.location.pathname).toBe('/');

        // Expect alert "You must be logged in to access this page." to be preset
        expect(document.body.innerHTML).toContain('You must be logged in to access this page.');

    });

    it('BLOCK NAVIGATETO /match', async () => {
        utils.navigateTo('/match');

        // Expect redirected to /
        expect(window.location.pathname).toBe('/');

        // Expect alert "You must be logged in to access this page." to be preset
        expect(document.body.innerHTML).toContain('You must be logged in to access this page.');

    });
});
