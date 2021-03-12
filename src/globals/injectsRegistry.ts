import { Creator } from '../types';
import { Token } from '../pointers';

export const injectsRegistry = new Map<Creator, Token[]>();
