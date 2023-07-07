export function isClass(v: any) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

export function failedToGetTokenErrorMessage(e: Error) {
    let error = e
    const causes: Error[] = []
    while (error) {
        causes.push(error)
        error = error.cause as Error
    }
    return causes.map((c, idx) => `${idx}. ${c.message}`).join('\n')
}
