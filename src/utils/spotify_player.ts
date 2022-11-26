import { Session } from 'next-auth';

export interface Track {
	name: string;
	album: {
		name: string;
		images: { url: string }[];
	};
	artists: Artist[];
	duration_ms: number;
}

export interface Artist {
	name: string;
}

export interface PlaybackState {
	context: { uri: string; metadata: any };
	disallows: {
		pausing: boolean;
		peeking_next: boolean;
		peeking_prev: boolean;
		resuming: boolean;
		seeking: boolean;
		skipping_next: boolean;
		skipping_prev: boolean;
	};
	paused: boolean;
	position: number;
	repeat_mode: number;
	shuffle: boolean;
	track_window: {
		current_track: Track;
		previous_tracks: Track[];
		next_tracks: Track[];
	};
}

export interface SpotifySession extends Session {
	accesstoken: string;
	error: string;
}
