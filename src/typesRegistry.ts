import { Constructor } from './types';
import { Token } from './token';

export const typesRegistry = new Map<Constructor, Token[]>();
