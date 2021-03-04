import { Constructor } from '../types';
import { Token } from '../pointers';

export class InjectsRegistry extends Map<Constructor, Token[]> {}
