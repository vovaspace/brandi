export function isClass(v: any) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}
