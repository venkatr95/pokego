/**
 * @jest-environment jsdom
 */
import { track } from '../lib/analytics';

describe('analytics track', () => {
  afterEach(() => {
    delete (window as { gtag?: unknown }).gtag;
    delete (window as { plausible?: unknown }).plausible;
    delete (window as { dataLayer?: unknown }).dataLayer;
    jest.restoreAllMocks();
  });

  test('calls gtag when available and strips credential-like props', () => {
    const gtag = jest.fn();
    window.gtag = gtag;
    track('collection_import', {
      format: 'json',
      password: 'secret',
      trainerToken: 'abc',
    });
    expect(gtag).toHaveBeenCalledWith('event', 'collection_import', { format: 'json' });
  });

  test('uses plausible when gtag is absent', () => {
    const plausible = jest.fn();
    window.plausible = plausible;
    track('pokemon_go_open', { surface: 'pokedex' });
    expect(plausible).toHaveBeenCalledWith('pokemon_go_open', {
      props: { surface: 'pokedex' },
    });
  });

  test('pushes to dataLayer as last resort', () => {
    window.dataLayer = [];
    track('collection_export', { format: 'csv' });
    expect(window.dataLayer).toEqual([{ event: 'collection_export', format: 'csv' }]);
  });
});
