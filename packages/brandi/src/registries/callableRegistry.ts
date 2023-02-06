import { UnknownCreator } from '../types';

export const callableRegistry = new WeakMap<UnknownCreator, boolean>();
