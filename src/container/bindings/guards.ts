import { Binding, Scope, Type } from './Binding';
import {
  ConstructorCreatorBinding,
  CreatorBinding,
  CreatorContainerScopedBinding,
  CreatorResolutionScopedBinding,
  CreatorSingletonScopedBinding,
} from './CreatorBinding';
import { FactoryBinding } from './FactoryBinding';

export const isCreatorBinding = (binding: Binding): binding is CreatorBinding =>
  binding.type === Type.Creator;

export const isConstructorCreatorBinding = (
  binding: CreatorBinding,
): binding is ConstructorCreatorBinding => binding.isConstructor;

export const isCreatorContainerScopedBinding = (
  binding: CreatorBinding,
): binding is CreatorContainerScopedBinding =>
  binding.scope === Scope.Container;

export const isCreatorResolutionScopedBinding = (
  binding: CreatorBinding,
): binding is CreatorResolutionScopedBinding =>
  binding.scope === Scope.Resolution;

export const isCreatorSingletonScopedBinding = (
  binding: CreatorBinding,
): binding is CreatorSingletonScopedBinding =>
  binding.scope === Scope.Singleton;

export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === Type.Factory;
