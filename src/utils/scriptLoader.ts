import { SCRIPT_CONFIG } from '../config/scripts';

interface ScriptState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

class ScriptLoader {
  private scripts: Map<string, ScriptState> = new Map();
  private callbacks: Map<string, Set<() => void>> = new Map();

  loadScript(id: string, src: string): Promise<void> {
    // Return existing state if script is already loaded
    if (this.scripts.get(id)?.loaded) {
      return Promise.resolve();
    }

    // Return existing promise if script is loading
    if (this.scripts.get(id)?.loading) {
      return new Promise((resolve, reject) => {
        const callbacks = this.callbacks.get(id) || new Set();
        callbacks.add(() => {
          const state = this.scripts.get(id);
          state?.error ? reject(new Error(state.error)) : resolve();
        });
        this.callbacks.set(id, callbacks);
      });
    }

    // Start new script load
    this.scripts.set(id, { loading: true, loaded: false, error: null });

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;

      const timeoutId = setTimeout(() => {
        this.handleScriptError(id, 'Script load timed out');
        reject(new Error('Script load timed out'));
      }, SCRIPT_CONFIG.timeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        this.handleScriptSuccess(id);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        const error = 'Failed to load script';
        this.handleScriptError(id, error);
        reject(new Error(error));
      };

      document.head.appendChild(script);
    });
  }

  private handleScriptSuccess(id: string): void {
    this.scripts.set(id, { loading: false, loaded: true, error: null });
    this.executeCallbacks(id);
  }

  private handleScriptError(id: string, error: string): void {
    this.scripts.set(id, { loading: false, loaded: false, error });
    this.executeCallbacks(id);
  }

  private executeCallbacks(id: string): void {
    const callbacks = this.callbacks.get(id);
    if (callbacks) {
      callbacks.forEach(callback => callback());
      this.callbacks.delete(id);
    }
  }

  isLoaded(id: string): boolean {
    return this.scripts.get(id)?.loaded || false;
  }

  getError(id: string): string | null {
    return this.scripts.get(id)?.error || null;
  }
}

export const scriptLoader = new ScriptLoader();