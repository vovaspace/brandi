import { UnknownCreator } from '../types';

export const entitiesRegistry = new Map<symbol, Map<UnknownCreator, unknown>>();
