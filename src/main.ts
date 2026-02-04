import { Game } from './core/Game';

async function main(): Promise<void> {
  const browserCanvas = document.getElementById('browser-canvas') as HTMLCanvasElement;
  const topologyCanvas = document.getElementById('topology-canvas') as HTMLCanvasElement;
  const physicalCanvas = document.getElementById('physical-canvas') as HTMLCanvasElement;
  if (!browserCanvas || !topologyCanvas || !physicalCanvas) {
    throw new Error('Canvas elements not found');
  }

  const game = new Game();
  await game.init(browserCanvas, topologyCanvas, physicalCanvas);

  // Expose for debugging
  (window as unknown as Record<string, unknown>).game = game;
}

main().catch(console.error);
