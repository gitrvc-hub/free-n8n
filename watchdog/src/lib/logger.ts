export function info(module: string, message: string, ctx?: Record<string, unknown>): void {
	console.log(
		JSON.stringify({ level: 'info', module, message, ...ctx, ts: new Date().toISOString() })
	);
}

export function error(module: string, message: string, ctx?: Record<string, unknown>): void {
	console.error(
		JSON.stringify({ level: 'error', module, message, ...ctx, ts: new Date().toISOString() })
	);
}

export function warn(module: string, message: string, ctx?: Record<string, unknown>): void {
	console.warn(
		JSON.stringify({ level: 'warn', module, message, ...ctx, ts: new Date().toISOString() })
	);
}
