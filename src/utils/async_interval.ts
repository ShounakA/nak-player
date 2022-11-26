const asyncIntervals: boolean[] = [];

const runAsyncInterval = async (
	cb: () => any,
	interval: number | undefined,
	intervalIndex: number
) => {
	await cb();
	if (asyncIntervals[intervalIndex]) {
		setTimeout(() => runAsyncInterval(cb, interval, intervalIndex), interval);
	}
};

export const setAsyncInterval = (
	cb: () => any,
	interval: number | undefined
) => {
	if (cb && typeof cb === 'function') {
		const intervalIndex = asyncIntervals.length;
		asyncIntervals.push(true);
		runAsyncInterval(cb, interval, intervalIndex);
		return intervalIndex;
	} else {
		throw new Error('Callback must be a function');
	}
};

export const clearAsyncInterval = (intervalIndex: number) => {
	if (asyncIntervals[intervalIndex]) {
		asyncIntervals[intervalIndex] = false;
	}
};

export function msToTime(duration: number): string {
	let milliseconds: number = Math.floor((duration % 1000) / 100),
		seconds: number = Math.floor((duration / 1000) % 60),
		minutes: number = Math.floor((duration / (1000 * 60)) % 60),
		hours: number = Math.floor((duration / (1000 * 60 * 60)) % 24);

	return `${hours < 10 ? '0' + hours : hours}:${
		minutes < 10 ? '0' + minutes : minutes
	}:${seconds < 10 ? '0' + seconds : seconds}`;
}
