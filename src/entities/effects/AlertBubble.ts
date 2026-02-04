import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class AlertBubble {
  public container: Container;
  public alive = true;
  private elapsed = 0;
  private duration: number;

  constructor(x: number, y: number, message: string, duration = 3.0) {
    this.duration = duration;
    this.container = new Container();
    this.container.x = x;
    this.container.y = y - 20;

    const text = new Text({
      text: message,
      style: new TextStyle({
        fontSize: 11,
        fill: 0xffffff,
        fontFamily: 'Courier New',
      }),
      resolution: Math.max(2, window.devicePixelRatio || 1),
    });
    text.anchor.set(0.5);

    const padding = 6;
    const bg = new Graphics();
    bg.roundRect(
      -text.width / 2 - padding,
      -text.height / 2 - padding,
      text.width + padding * 2,
      text.height + padding * 2,
      4,
    ).fill({ color: 0x0c1018, alpha: 0.85 });
    bg.roundRect(
      -text.width / 2 - padding,
      -text.height / 2 - padding,
      text.width + padding * 2,
      text.height + padding * 2,
      4,
    ).stroke({ color: 0xe06468, width: 1, alpha: 0.6 });

    this.container.addChild(bg);
    this.container.addChild(text);
  }

  update(delta: number): void {
    this.elapsed += delta;
    // Float upward
    this.container.y -= delta * 8;
    // Fade out
    if (this.elapsed > this.duration * 0.6) {
      this.container.alpha = 1 - (this.elapsed - this.duration * 0.6) / (this.duration * 0.4);
    }
    if (this.elapsed >= this.duration) {
      this.alive = false;
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
