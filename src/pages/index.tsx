import { useSession, signIn } from 'next-auth/react';
import WebPlayback from '../components/WebPlayback';
import Login from '../components/Login';
import { useEffect } from 'react';

export default function Home() {
	const { data: session, status } = useSession();
	useEffect(() => {
		if (!!session) {
			if (session.error === 'RefreshAccessTokenError') {
				signIn(); // Force sign in to hopefully resolve error
			}
		}
	}, [session]);

	return (
		<main className="dark:bg-dark mx-auto flex flex-col items-center content-center justify-center min-h-screen min-w-full">
			{status === 'unauthenticated' ? <Login /> : <WebPlayback />}
		</main>
	);
}
