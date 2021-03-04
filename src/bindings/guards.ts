import { Binding, Scope, Type } from './Binding';
import { ContainerScopedInstanceBinding } from './ContainerScopedInstanceBinding';
import { FactoryBinding } from './FactoryBinding';
import { InstanceBinding } from './InstanceBinding';
import { ResolutionScopedInstanceBinding } from './ResolutionScopedInstanceBinding';
import { SingletonScopedInstanceBinding } from './SingletonScopedInstanceBinding';

export const isInstanceBinding = (
  binding: Binding,
): binding is InstanceBinding => binding.type === Type.Instance;

export const isContainerScopedInstanceBinding = (
  binding: InstanceBinding,
): binding is ContainerScopedInstanceBinding =>
  binding.scope === Scope.Container;

export const isResolutionScopedInstanceBinding = (
  binding: InstanceBinding,
): binding is ResolutionScopedInstanceBinding =>
  binding.scope === Scope.Resolution;

export const isSingletonScopedInstanceBinding = (
  binding: InstanceBinding,
): binding is SingletonScopedInstanceBinding =>
  binding.scope === Scope.Singleton;

export const isFactoryBinding = (binding: Binding): binding is FactoryBinding =>
  binding.type === Type.Factory;
