import React, { useState } from 'react';
import { FaBackward, FaForward, FaPlay, FaPause } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { setAsyncInterval, clearAsyncInterval } from '../utils/async_interval';
import { Audio } from 'react-loader-spinner';
import SlidingText from './SlidingText';
import Script from 'next/script';

interface Track {
	name: string;
	album: {
		name: string;
		images: { url: string }[];
	};
	artists: Artist[];
}

interface Artist {
	name: string;
}

interface Player {
	previousTrack: () => void;
	togglePlay: () => void;
	nextTrack: () => void;
	addListener: (
		event: string,
		cb: (arg0: any) => void
	) => void | Promise<void>;
	connect: () => void;
	getCurrentState: () => Promise<any>;
}

function WebPlayback() {
	const { data: session } = useSession();
	const [player, setPlayer] = useState({} as Player);
	const [is_paused, setPaused] = useState(false);
	const [is_active, setActive] = useState(false);
	const [ready, setReady] = useState(false);
	const [current_track, setTrack] = useState({} as Track);
	const [position, setPosition] = useState(-1);
	const [duration, setDuration] = useState(0);

	const playerDiv = () => {
		if (ready) {
			return (
				<div className="text-center w-80">
					{albumCover(current_track)}
					<div className="py-4">
						<SlidingText
							className="dark:text-light text-lg"
							text={current_track.name}
							textStyles="dark:bg-[#191414] dark:text-light text-lg w-25 overflow-x-scroll focus:outline-0 text-center"
						/>
						<SlidingText
							text={artistsList(current_track.artists)}
							textStyles="dark:bg-[#191414] dark:text-light w-25 overflow-x-scroll focus:outline-0 text-center"
						/>
					</div>
					<div className="py-2">
						<input
							type="range"
							className="min-w-full"
							max={duration}
							value={position}
							readOnly
						/>
					</div>
					<div className="mx-auto flex flex-row items-center content-center justify-center py-4">
						<button
							className="dark:bg-bud dark:text-light p-6 rounded-full mx-2"
							onClick={() => {
								(player as any).previousTrack();
							}}
						>
							<FaBackward />
						</button>

						<button
							className="dark:bg-bud dark:text-light p-10 rounded-full mx-2"
							onClick={() => {
								(player as any).togglePlay();
							}}
						>
							{is_paused ? <FaPlay /> : <FaPause />}
						</button>

						<button
							className="dark:bg-bud dark:text-light p-6 rounded-full mx-2"
							onClick={() => {
								(player as any).nextTrack();
							}}
						>
							<FaForward />
						</button>
					</div>
				</div>
			);
		}
		return <Audio height="80" width="80" color="white" />;
	};

	const onReady = () => {
		if (!!session) {
			const token = (session as any).accessToken;
			const player = new (window as any).Spotify.Player({
				name: 'nak-player',
				getOAuthToken: (cb: (arg0: any) => void) => {
					cb(token);
				},
				volume: 0.5,
			});

			setPlayer(player); // for play pause control buttons

			const connectDevice = async (device_id: string) => {
				await fetch('https://api.spotify.com/v1/me/player', {
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						device_ids: [device_id],
					}),
				});
			};

			const positionInterval = () =>
				setAsyncInterval(async () => {
					const state = await player.getCurrentState();
					setPosition(state?.position);
				}, 300);

			player.addListener('ready', async ({ device_id }): Promise<void> => {
				await connectDevice(device_id);
				setReady(true);
			});

			player.addListener('player_state_changed', async (state) => {
				if (!state) {
					return;
				}

				setTrack(state.track_window.current_track);
				setDuration(state.track_window.current_track.duration_ms);
				setPaused(state.paused);

				const curr_state = await player.getCurrentState();
				if (curr_state) {
					setActive(true);
					positionInterval();
				} else {
					setActive(false);
					clearAsyncInterval(0);
					setPosition(0);
				}
			});

			player.connect();
		}
	};

	return (
		<>
			<Script
				src="https://sdk.scdn.co/spotify-player.js"
				id="spot-player"
				onReady={onReady}
				async={true}
				strategy="lazyOnload"
			></Script>
			<div className="mx-auto flex flex-row items-center content-center justify-center border-2 border-light p-5 rounded-xl dark:bg-[#191414]">
				{playerDiv()}
			</div>
		</>
	);
}

const albumCover = (current_track: Track) => {
	if (current_track && current_track.album) {
		return (
			<Image
				src={current_track.album.images[0].url}
				width={300}
				height={300}
				className="mx-auto"
				alt={current_track.album.name}
				placeholder="blur"
				blurDataURL="./default_album_cover.png"
				priority
			/>
		);
	}
};

const artistsList = (artists: Artist[] | undefined) => {
	if (artists) {
		const len = artists.length;
		const list = artists.map((artist, index) =>
			index === len - 1 ? `${artist.name}` : `${artist.name},`
		);
		return list.join(' ');
	}
	return '';
};

export default WebPlayback;