export class GridCell {
  public walkable = true;
  public entityId: string | null = null;
  public zone: string = 'floor';

  constructor(
    public readonly col: number,
    public readonly row: number,
  ) {}

  get occupied(): boolean {
    return this.entityId !== null;
  }
}
