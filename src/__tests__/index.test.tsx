import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EyeScrollProvider, useEyeScroll } from '../index';

const mockWebGazer = {
  begin: jest.fn().mockResolvedValue(undefined),
  end: jest.fn(),
  setGazeListener: jest.fn().mockReturnThis(),
  showVideoPreview: jest.fn().mockReturnThis(),
  showPredictionPoints: jest.fn().mockReturnThis(),
  isReady: jest.fn().mockReturnValue(true),
};

// Mock window object //
Object.defineProperty(window, 'webgazer', {
  value: mockWebGazer,
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'saveDataAcrossSessions', {
  value: true,
  writable: true,
});

// Mock DOM methods //
Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
  get: function () {
    return this._scrollTop || 0;
  },
  set: function (val) {
    this._scrollTop = val;
  },
  configurable: true,
});

Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
  get: function () {
    return this._scrollLeft || 0;
  },
  set: function (val) {
    this._scrollLeft = val;
  },
  configurable: true,
});

// Mock script loading //
const mockScriptLoad = () => {
  const originalCreateElement = document.createElement;
  document.createElement = jest.fn((tagName) => {
    if (tagName === 'script') {
      const script = originalCreateElement.call(document, tagName) as HTMLScriptElement;
      // Simulate successful script loading //
      setTimeout(() => {
        // Ensure webgazer is available //
        (window as unknown as { webgazer: typeof mockWebGazer }).webgazer = mockWebGazer;
        script.onload?.(new Event('load'));
      }, 0);
      return script;
    }
    return originalCreateElement.call(document, tagName);
  });
};

// Test component that uses the hook //
const TestComponent: React.FC = () => {
  const { isTracking, isLoading, error, start, stop } = useEyeScroll();

  return (
    <div>
      <div data-testid="tracking-status">{isTracking ? 'tracking' : 'not-tracking'}</div>
      <div data-testid="loading-status">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="error-status">{error || 'no-error'}</div>
      <button data-testid="start-button" onClick={start}>
        Start
      </button>
      <button data-testid="stop-button" onClick={stop}>
        Stop
      </button>
      <div style={{ height: '2000px' }}>Scrollable content</div>
    </div>
  );
};

describe('EyeScrollProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing scripts //
    document.querySelectorAll('script[src*="webgazer"]').forEach((script) => script.remove());
    // Clear floating buttons //
    document.querySelectorAll('#eye-scroll-toggle').forEach((btn) => btn.parentElement?.remove());
    // Reset webgazer mock //
    (window as unknown as Window & { webgazer: typeof mockWebGazer }).webgazer = mockWebGazer;
    mockScriptLoad();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should render children and initialize without errors', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      expect(screen.getByText('Scrollable content')).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );
    });

    it('should show loading state initially', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');
      expect(screen.getByText('Loading Eye Tracking...')).toBeInTheDocument();
    });

    it('should handle initialization errors gracefully', async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();

      mockWebGazer.begin.mockRejectedValueOnce(new Error('WebGazer failed'));

      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('error-status')).not.toHaveTextContent('no-error');
        },
        { timeout: 3000 },
      );

      console.error = originalConsoleError;
    });
  });

  describe('Configuration Options', () => {
    it('should apply custom configuration', async () => {
      const onScrollStart = jest.fn();
      const onScrollEnd = jest.fn();

      await act(async () => {
        render(
          <EyeScrollProvider
            config={{
              sensitivity: 2,
              delayMs: 500,
              scrollAmount: 100,
              onScrollStart,
              onScrollEnd,
              showControls: false,
            }}
          >
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      // Should not show floating button when showControls is false //
      expect(document.querySelector('#eye-scroll-toggle')).not.toBeInTheDocument();
    });

    it('should show floating control button by default', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      expect(document.querySelector('#eye-scroll-toggle')).toBeInTheDocument();
    });
  });

  describe('Eye Tracking Controls', () => {
    it('should start and stop tracking via hook methods', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      // Start tracking //
      await act(async () => {
        fireEvent.click(screen.getByTestId('start-button'));
      });

      await waitFor(() => {
        expect(mockWebGazer.begin).toHaveBeenCalled();
      });

      // Stop tracking //
      await act(async () => {
        fireEvent.click(screen.getByTestId('stop-button'));
      });

      await waitFor(() => {
        expect(mockWebGazer.end).toHaveBeenCalled();
      });
    });

    it('should toggle tracking via floating button', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      const floatingButton = document.querySelector('#eye-scroll-toggle') as HTMLButtonElement;
      expect(floatingButton).toBeInTheDocument();

      // Click to start tracking //
      await act(async () => {
        fireEvent.click(floatingButton);
      });

      await waitFor(() => {
        expect(mockWebGazer.begin).toHaveBeenCalled();
      });

      // Click to stop tracking //
      await act(async () => {
        fireEvent.click(floatingButton);
      });

      expect(mockWebGazer.end).toHaveBeenCalled();
    });
  });

  describe('Visual Indicators', () => {
    it('should show scroll zones when tracking is active', async () => {
      const onScrollStart = jest.fn();

      await act(async () => {
        render(
          <EyeScrollProvider config={{ onScrollStart }}>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      // Start tracking //
      await act(async () => {
        fireEvent.click(screen.getByTestId('start-button'));
      });

      // Simulate scroll start callback //
      act(() => {
        onScrollStart('left');
      });

      // Should show visual indicators //
      const indicators = document.querySelectorAll('[style*="position: fixed"]');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should hide scroll zones when tracking is inactive', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      expect(screen.getByTestId('tracking-status')).toHaveTextContent('not-tracking');
    });
  });

  describe('Floating Button Interactions', () => {
    it('should handle button hover effects', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      const floatingButton = document.querySelector('#eye-scroll-toggle') as HTMLButtonElement;

      // Test hover in //
      fireEvent.mouseEnter(floatingButton);
      expect(floatingButton.style.transform).toBe('scale(1.1)');

      // Test hover out //
      fireEvent.mouseLeave(floatingButton);
      expect(floatingButton.style.transform).toBe('scale(1)');
    });

    it('should change button appearance when tracking state changes', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      const floatingButton = document.querySelector('#eye-scroll-toggle') as HTMLButtonElement;

      // Initial state //
      expect(floatingButton.style.background).toBe('rgb(175, 221, 255)');

      // Click to start tracking //
      await act(async () => {
        fireEvent.click(floatingButton);
      });

      await waitFor(() => {
        expect(floatingButton.style.background).toBe('rgb(255, 99, 99)');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when WebGazer fails to load', async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Mock script loading failure //
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'script') {
          const script = originalCreateElement.call(document, tagName);
          setTimeout(() => script.onerror?.(new Event('error')), 0);
          return script;
        }
        return originalCreateElement.call(document, tagName);
      });

      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByText(/Error:/)).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      document.createElement = originalCreateElement;
      console.error = originalConsoleError;
    });

    it('should handle WebGazer begin failure', async () => {
      mockWebGazer.begin.mockRejectedValueOnce(new Error('Camera access denied'));

      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      // Try to start tracking //
      await act(async () => {
        fireEvent.click(screen.getByTestId('start-button'));
      });

      // Should handle the error gracefully //
      await waitFor(() => {
        expect(screen.getByTestId('tracking-status')).toHaveTextContent('not-tracking');
      });
    });
  });

  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      const TestComponentWithoutProvider = () => {
        const context = useEyeScroll();
        return <div>{context.isTracking ? 'tracking' : 'not-tracking'}</div>;
      };

      // Suppress console.error for this test //
      const originalConsoleError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useEyeScroll must be used within an EyeScrollProvider');

      console.error = originalConsoleError;
    });

    it('should provide correct context values', async () => {
      await act(async () => {
        render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      // Initial state //
      expect(screen.getByTestId('tracking-status')).toHaveTextContent('not-tracking');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');
      expect(screen.getByTestId('error-status')).toHaveTextContent('no-error');

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on unmount', async () => {
      const { unmount } = await act(async () => {
        return render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      // Start tracking first //
      await act(async () => {
        fireEvent.click(screen.getByTestId('start-button'));
      });

      await waitFor(() => {
        expect(mockWebGazer.begin).toHaveBeenCalled();
      });

      // Unmount component //
      await act(async () => {
        unmount();
      });

      // Should have called end method //
      expect(mockWebGazer.end).toHaveBeenCalled();
    });

    it('should remove floating button on cleanup', async () => {
      const { unmount } = await act(async () => {
        return render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(document.querySelector('#eye-scroll-toggle')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      await act(async () => {
        unmount();
      });

      expect(document.querySelector('#eye-scroll-toggle')).not.toBeInTheDocument();
    });
  });
});

describe('WebGazer Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.webgazer //
    (window as unknown as { webgazer: typeof mockWebGazer }).webgazer = mockWebGazer;
    mockScriptLoad();
  });

  it('should configure WebGazer correctly', async () => {
    await act(async () => {
      render(
        <EyeScrollProvider>
          <TestComponent />
        </EyeScrollProvider>,
      );
    });

    await waitFor(
      () => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
      },
      { timeout: 3000 },
    );

    // Start tracking //
    await act(async () => {
      fireEvent.click(screen.getByTestId('start-button'));
    });

    await waitFor(() => {
      expect(mockWebGazer.setGazeListener).toHaveBeenCalled();
      expect(mockWebGazer.showVideoPreview).toHaveBeenCalledWith(false);
      expect(mockWebGazer.showPredictionPoints).toHaveBeenCalledWith(false);
    });
  });

  it('should handle missing WebGazer gracefully', async () => {
    const originalWebGazer: typeof mockWebGazer | undefined = (
      window as unknown as { webgazer?: typeof mockWebGazer }
    ).webgazer;
    delete (window as unknown as { webgazer?: typeof mockWebGazer }).webgazer;
    await act(async () => {
      render(
        <EyeScrollProvider config={{ autoInjectScript: false, webgazerCDN: false }}>
          <TestComponent />
        </EyeScrollProvider>,
      );
    });

    await waitFor(
      () => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    (window as unknown as { webgazer?: typeof mockWebGazer }).webgazer = originalWebGazer;
  });
});

describe('Performance and Memory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as unknown as { webgazer: typeof mockWebGazer }).webgazer = mockWebGazer;
    mockScriptLoad();
  });

  it('should not create memory leaks with multiple mounts/unmounts', async () => {
    for (let i = 0; i < 3; i++) {
      const { unmount } = await act(async () => {
        return render(
          <EyeScrollProvider>
            <TestComponent />
          </EyeScrollProvider>,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 },
      );

      await act(async () => {
        unmount();
      });
    }

    // Should not have accumulated floating buttons //
    expect(document.querySelectorAll('#eye-scroll-toggle')).toHaveLength(0);
  });

  it('should handle rapid start/stop calls', async () => {
    await act(async () => {
      render(
        <EyeScrollProvider>
          <TestComponent />
        </EyeScrollProvider>,
      );
    });

    await waitFor(
      () => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
      },
      { timeout: 3000 },
    );

    // Rapid start/stop calls //
    const startButton = screen.getByTestId('start-button');
    const stopButton = screen.getByTestId('stop-button');

    await act(async () => {
      for (let i = 0; i < 5; i++) {
        fireEvent.click(startButton);
        fireEvent.click(stopButton);
      }
    });

    // Should handle gracefully without errors //
    expect(screen.getByTestId('error-status')).toHaveTextContent('no-error');
  });
});
