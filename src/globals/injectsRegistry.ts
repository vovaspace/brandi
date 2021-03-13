import { Token } from '../pointers';
import { UnknownCreator } from '../types';

export const injectsRegistry = new Map<UnknownCreator, Token[]>();
