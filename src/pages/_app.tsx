import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

declare global {
	interface Window {
		Spotify: typeof Spotify;
	}
}

export default function App({ Component, pageProps }: AppProps) {
	return (
		<SessionProvider>
			<Component {...pageProps} />
		</SessionProvider>
	);
}
