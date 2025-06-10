import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// Types //
interface EyeScrollConfig {
  sensitivity?: number;
  delayMs?: number;
  scrollAmount?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  zones?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    middle?: number;
  };
  onScrollStart?: (direction: string) => void;
  onScrollEnd?: (direction: string) => void;
  showControls?: boolean;
  autoStart?: boolean;
  webgazerCDN?: boolean;
  autoInjectScript?: boolean;
}

interface GazeData {
  x: number;
  y: number;
}

interface WebGazerInstance {
  begin(): Promise<void>;
  end(): void;
  setGazeListener(callback: (data: GazeData | null, timestamp: number) => void): WebGazerInstance;
  showVideoPreview(show: boolean): WebGazerInstance;
  showPredictionPoints(show: boolean): WebGazerInstance;
}

declare global {
  interface Window {
    webgazer: WebGazerInstance;
    saveDataAcrossSessions: boolean;
    eyeUXScriptInjected?: boolean;
  }
}

// Context //
interface EyeScrollContextType {
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  updateConfig: (config: Partial<EyeScrollConfig>) => void;
}

const EyeScrollContext = createContext<EyeScrollContextType | null>(null);

// WebGazer Loader //
class WebGazerLoader {
  private static instance: WebGazerLoader;
  private loadPromise: Promise<WebGazerInstance> | null = null;
  private isLoaded = false;

  static getInstance(): WebGazerLoader {
    if (!WebGazerLoader.instance) {
      WebGazerLoader.instance = new WebGazerLoader();
    }
    return WebGazerLoader.instance;
  }

  async loadWebGazer(forceReload = false): Promise<WebGazerInstance> {
    if (window.webgazer && this.isLoaded && !forceReload) {
      return window.webgazer;
    }

    if (this.loadPromise && !forceReload) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<WebGazerInstance>((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="webgazer"]');
      if (existingScript && window.webgazer && !forceReload) {
        this.isLoaded = true;
        resolve(window.webgazer);
        return;
      }

      if (forceReload && existingScript) {
        existingScript.remove();
        delete (window as Partial<Window>).webgazer;
      }

      const script = document.createElement('script');
      script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setTimeout(() => {
          if (window.webgazer) {
            this.isLoaded = true;
            window.eyeUXScriptInjected = true;
            resolve(window.webgazer);
          } else {
            reject(new Error('WebGazer failed to initialize'));
          }
        }, 100);
      };

      script.onerror = () => {
        reject(new Error('Failed to load WebGazer from CDN'));
      };

      const head = document.head || document.getElementsByTagName('head')[0];
      head.appendChild(script);
    });

    return this.loadPromise;
  }

  isWebGazerLoaded(): boolean {
    return this.isLoaded && !!window.webgazer;
  }
}

// EyeScroll Class //
class EyeScroll {
  private config: Required<EyeScrollConfig>;
  private isActive = false;
  private startTime = Number.POSITIVE_INFINITY;
  private currentDirection: string | null = null;
  private floatingButton: HTMLElement | null = null;
  private webgazer: WebGazerInstance | null = null;
  private targetElement: HTMLElement;
  private scrollInterval: number | null = null;
  private loader: WebGazerLoader;
  private gazeListener: (data: GazeData | null, timestamp: number) => void;

  constructor(targetElement: HTMLElement, config: EyeScrollConfig = {}) {
    this.targetElement = targetElement;

    this.config = {
      sensitivity: 1,
      delayMs: 1000,
      scrollAmount: 50,
      direction: 'both',
      zones: {
        left: window.innerWidth * 0.25,
        right: window.innerWidth * 0.75,
        top: window.innerHeight * 0.25,
        bottom: window.innerHeight * 0.75,
        middle: 100,
      },
      onScrollStart: () => {},
      onScrollEnd: () => {},
      showControls: true,
      autoStart: false,
      webgazerCDN: true,
      autoInjectScript: true,
      ...config,
    };

    this.loader = WebGazerLoader.getInstance();
    this.gazeListener = this.handleGazeData.bind(this);
  }

  async init(): Promise<void> {
    try {
      await this.loadWebGazer();
      this.setupWebGazer();

      if (this.config.showControls) {
        this.createFloatingButton();
      }

      if (this.config.autoStart) {
        await this.start();
      }
    } catch (error) {
      console.error('EyeUX initialization failed:', error);
      throw error;
    }
  }

  private async loadWebGazer(): Promise<void> {
    try {
      if (this.config.autoInjectScript || this.config.webgazerCDN) {
        this.webgazer = await this.loader.loadWebGazer();
      } else {
        if (window.webgazer) {
          this.webgazer = window.webgazer;
        } else {
          throw new Error(
            'WebGazer not found. Please include the WebGazer script or enable autoInjectScript.',
          );
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load WebGazer: ${errorMessage}`);
    }
  }

  private setupWebGazer(): void {
    if (!this.webgazer) return;
    window.saveDataAcrossSessions = true;
    this.webgazer.setGazeListener(this.gazeListener);
  }

  private handleGazeData(data: GazeData | null, timestamp: number): void {
    if (!data || !this.isActive) return;

    const direction = this.getGazeDirection(data);

    if (direction && direction !== this.currentDirection) {
      this.startTime = timestamp;
      this.currentDirection = direction;
    } else if (!direction) {
      this.stopScrolling();
    }

    if (this.currentDirection && this.startTime + this.config.delayMs < timestamp) {
      this.startScrolling(this.currentDirection);
    }
  }

  private getGazeDirection(data: GazeData): string | null {
    const { zones, direction } = this.config;
    const { x, y } = data;

    if (direction === 'horizontal' || direction === 'both') {
      if (x < zones.left!) return 'left';
      if (x > zones.right!) return 'right';
    }

    if (direction === 'vertical' || direction === 'both') {
      if (y < zones.top!) return 'up';
      if (y > zones.bottom!) return 'down';
    }

    return null;
  }

  private startScrolling(direction: string): void {
    if (this.scrollInterval) return;

    this.config.onScrollStart(direction);

    this.scrollInterval = window.setInterval(() => {
      this.performScroll(direction);
    }, 16);
  }

  private stopScrolling(): void {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;

      if (this.currentDirection) {
        this.config.onScrollEnd(this.currentDirection);
      }
    }

    this.startTime = Number.POSITIVE_INFINITY;
    this.currentDirection = null;
  }

  private performScroll(direction: string): void {
    const scrollAmount = this.config.scrollAmount * this.config.sensitivity;

    switch (direction) {
      case 'left':
        this.targetElement.scrollLeft -= scrollAmount;
        break;
      case 'right':
        this.targetElement.scrollLeft += scrollAmount;
        break;
      case 'up':
        this.targetElement.scrollTop -= scrollAmount;
        break;
      case 'down':
        this.targetElement.scrollTop += scrollAmount;
        break;
    }
  }

  // Button //
  private createFloatingButton(): void {
    this.floatingButton = document.createElement('div');
    this.floatingButton.innerHTML = `
      <button id="eye-scroll-toggle" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        background: #AFDDFF;
        color: white;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        cursor: pointer;
        box-shadow: rgba(3, 102, 214, 0.3) 0px 0px 0px 3px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img src="https://i.postimg.cc/s25fKz5c/logo.png" alt="Eye Tracking" style="width: 52px; height: 52px;" />
      </button>
    `;

    document.body.appendChild(this.floatingButton);

    const button = this.floatingButton.querySelector('#eye-scroll-toggle') as HTMLButtonElement;

    button.addEventListener('click', async () => {
      if (this.isActive) {
        this.stop();
        button.innerHTML =
          '<img src="https://i.postimg.cc/s25fKz5c/logo.png" alt="Eye Tracking" style="width: 52px; height: 52px;" />';
        button.style.background = '#AFDDFF';
      } else {
        await this.start();
        button.innerHTML =
          '<img src="https://i.postimg.cc/s25fKz5c/logo.png" alt="Stop Tracking" style="width: 52px; height: 52px;" />';
        button.style.background = '#FF6363';
      }
    });

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
  }

  public async start(): Promise<void> {
    if (!this.webgazer) {
      throw new Error('WebGazer not loaded');
    }

    try {
      await this.webgazer.begin();
      this.webgazer.showVideoPreview(false).showPredictionPoints(false);
      setTimeout(() => {
        if (this.webgazer) {
          this.webgazer.showVideoPreview(false).showPredictionPoints(false);
        }
      }, 10000);

      this.isActive = true;
    } catch (error) {
      console.error('Failed to start eye tracking:', error);
      throw error;
    }
  }

  public stop(): void {
    this.isActive = false;
    this.stopScrolling();

    if (this.webgazer) {
      this.webgazer.end();
    }
  }

  public updateConfig(newConfig: Partial<EyeScrollConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public destroy(): void {
    this.stop();

    if (this.floatingButton) {
      this.floatingButton.remove();
    }

    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  public isTracking(): boolean {
    return this.isActive;
  }
}

// Provider Component //
interface EyeScrollProviderProps {
  children: ReactNode;
  config?: EyeScrollConfig;
}

export const EyeScrollProvider: React.FC<EyeScrollProviderProps> = ({ children, config = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeScroll, setEyeScroll] = useState<EyeScroll | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeEyeScroll = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const instance = new EyeScroll(containerRef.current, {
          ...config,
          onScrollStart: (direction) => {
            config.onScrollStart?.(direction);
            setIsTracking(true);
          },
          onScrollEnd: (direction) => {
            config.onScrollEnd?.(direction);
            setIsTracking(false);
          },
        });

        await instance.init();
        setEyeScroll(instance);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize EyeScroll');
        setIsLoading(false);
      }
    };

    initializeEyeScroll();

    return () => {
      if (eyeScroll) {
        eyeScroll.destroy();
      }
    };
  }, []);

  const contextValue: EyeScrollContextType = {
    isTracking,
    isLoading,
    error,
    start: async () => {
      if (eyeScroll) {
        await eyeScroll.start();
        setIsTracking(true);
      }
    },
    stop: () => {
      if (eyeScroll) {
        eyeScroll.stop();
        setIsTracking(false);
      }
    },
    updateConfig: (newConfig: Partial<EyeScrollConfig>) => {
      if (eyeScroll) {
        eyeScroll.updateConfig(newConfig);
      }
    },
  };

  return (
    <EyeScrollContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {children}

        {/* Visual indicators when tracking is active */}
        {isTracking && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 500,
            }}
          >
            {/* Scroll zones visualization */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${window.innerWidth * 0.25}px`,
                height: '100%',
                background: 'linear-gradient(to right, rgba(255,0,0,0.1), transparent)',
                borderRight: '2px dashed rgba(255,0,0,0.3)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: `${window.innerWidth * 0.25}px`,
                height: '100%',
                background: 'linear-gradient(to left, rgba(0,255,0,0.1), transparent)',
                borderLeft: '2px dashed rgba(0,255,0,0.3)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: `${window.innerHeight * 0.25}px`,
                background: 'linear-gradient(to bottom, rgba(0,0,255,0.1), transparent)',
                borderBottom: '2px dashed rgba(0,0,255,0.3)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                height: `${window.innerHeight * 0.25}px`,
                background: 'linear-gradient(to top, rgba(255,255,0,0.1), transparent)',
                borderTop: '2px dashed rgba(255,255,0,0.3)',
              }}
            />
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '5px',
              zIndex: 1000,
            }}
          >
            Loading Eye Tracking...
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              background: 'rgba(255,0,0,0.9)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '5px',
              zIndex: 1000,
            }}
          >
            Error: {error}
          </div>
        )}
      </div>
    </EyeScrollContext.Provider>
  );
};

// Hook to use EyeScroll context //
export const useEyeScroll = (): EyeScrollContextType => {
  const context = useContext(EyeScrollContext);
  if (!context) {
    throw new Error('useEyeScroll must be used within an EyeScrollProvider');
  }
  return context;
};
