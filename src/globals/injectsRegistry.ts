import { Constructor } from '../types';
import { Token } from '../pointers';

export const injectsRegistry = new Map<Constructor, Token[]>();
