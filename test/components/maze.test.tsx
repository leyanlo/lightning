import React from 'react';

import { Maze } from '../../components/maze';
import { act, render } from '@testing-library/react';

describe('Maze', () => {
  let frameCallbacks: Map<number, FrameRequestCallback>;
  let nextFrameId: number;

  beforeEach(() => {
    frameCallbacks = new Map();
    nextFrameId = 0;

    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    jest.spyOn(window.performance, 'now').mockReturnValue(0);
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        const frameId = ++nextFrameId;
        frameCallbacks.set(frameId, callback);
        return frameId;
      });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((frameId) => {
      frameCallbacks.delete(frameId);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('advances and cancels its animation frame on unmount', () => {
    const { container, unmount } = render(<Maze />);

    expect(container.querySelectorAll('td')).toHaveLength(64 * 128);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    const firstFrameId = nextFrameId;
    const firstFrame = frameCallbacks.get(firstFrameId);
    expect(firstFrame).toBeDefined();

    frameCallbacks.delete(firstFrameId);
    act(() => firstFrame?.(201));

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
    const activeFrameId = nextFrameId;
    expect(frameCallbacks.has(activeFrameId)).toBe(true);

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(activeFrameId);
    expect(frameCallbacks.has(activeFrameId)).toBe(false);
  });
});
