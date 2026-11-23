import { describe, it, expect } from 'vitest';
import { analyzeSkyLuminanceData } from '../optical-haze';

describe('Zero-Hardware Sky Optical Turbidity Estimator', () => {
  it('correctly identifies clean Rayleigh sky from higher blue/red luminance ratio', () => {
    const width = 100;
    const height = 100;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 40;     // Red
      data[i + 1] = 90; // Green
      data[i + 2] = 230; // High Blue (Rayleigh)
      data[i + 3] = 255;
    }
    const mockImageData = {
      data,
      width,
      height,
      colorSpace: 'srgb' as PredefinedColorSpace,
    };

    const result = analyzeSkyLuminanceData(mockImageData);
    expect(result.estimatedAOD).toBeLessThan(0.4);
    expect(result.inferredPm25).toBeLessThan(45);
    expect(result.blueToRedRatio).toBeGreaterThan(1.8);
    expect(result.hazeClass).toBe('Pristine Rayleigh');
  });

  it('correctly classifies severe smog brownish/gray haze from Mie scattering', () => {
    const width = 100;
    const height = 100;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 165;    // High Brown/Red
      data[i + 1] = 135; // Green
      data[i + 2] = 110; // Low Blue
      data[i + 3] = 255;
    }
    const mockImageData = {
      data,
      width,
      height,
      colorSpace: 'srgb' as PredefinedColorSpace,
    };

    const result = analyzeSkyLuminanceData(mockImageData);
    expect(result.estimatedAOD).toBeGreaterThan(0.9);
    expect(result.inferredPm25).toBeGreaterThan(150);
    expect(result.hazeClass).toBe('Severe Particulate Plume');
  });
});
