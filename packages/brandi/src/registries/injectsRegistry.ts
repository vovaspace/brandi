import { TokenValue } from '../pointers';
import { UnknownCreator } from '../types';

export const injectsRegistry = new Map<UnknownCreator, TokenValue[]>();
