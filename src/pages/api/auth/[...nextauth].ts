import { Session } from 'inspector';
import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { SpotifySession } from '../../../utils/spotify_player';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_AUTHORIZATION_URL =
	'https://accounts.spotify.com/authorize?' +
	new URLSearchParams({
		response_type: 'code',
		client_id: client_id,
		scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming',
		redirect_uri: 'http://localhost:3000/api/auth/callback/spotify',
		grant_type: 'authorization_code',
	} as Record<string, string>);

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: { refreshToken: any }) {
	try {
		const url =
			'https://accounts.spotify.com/api/token' +
			new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: token.refreshToken,
			});

		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization:
					'Basic ' +
					Buffer.from(client_id + ':' + client_secret).toString('base64'),
			},
			method: 'POST',
		});

		const refreshedTokens = await response.json();

		if (!response.ok) {
			throw refreshedTokens;
		}

		return {
			...token,
			accessToken: refreshedTokens.access_token,
			accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
			refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
		};
	} catch (error) {
		console.log(error);

		return {
			...token,
			error: 'RefreshAccessTokenError',
		};
	}
}

export const authOptions = {
	// Configure one or more authentication providers
	providers: [
		SpotifyProvider({
			clientId: client_id,
			clientSecret: client_secret,
			authorization: SPOTIFY_AUTHORIZATION_URL,
		} as { clientId: string; clientSecret: string }),
	],
	callbacks: {
		async jwt({
			token,
			user,
			account,
		}: {
			token: any;
			user: any;
			account: any;
		}) {
			// Initial sign in
			if (account && user) {
				return {
					accessToken: account.access_token,
					accessTokenExpires: Date.now() + account.expires_at * 1000,
					refreshToken: account.refresh_token,
					user,
				};
			}

			// Return previous token if the access token has not expired yet
			if (Date.now() < token.accessTokenExpires) {
				return token;
			}

			// Access token has expired, try to update it
			return refreshAccessToken(token);
		},
		async session({
			session,
			token,
		}: {
			session: SpotifySession;
			token: any;
		}) {
			session.user = token.user;
			session.accesstoken = token.accessToken;
			session.error = token.error;

			return session;
		},
	},
} as any;

export default NextAuth(authOptions);
