import { Token } from '../token';

export class ResolutionContext {
  public readonly instances = new Map<Token, Object>();
}
