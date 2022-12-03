import React, { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { FaBackward, FaForward, FaPlay, FaPause, FaHammer } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { setAsyncInterval, clearAsyncInterval } from '../utils/async_interval';
import { Audio } from 'react-loader-spinner';
import SlidingText from './SlidingText';

import {
   Track,
   PlaybackState,
   Artist,
   SpotifySession,
   Player,
} from '../utils/spotify_player';

const forceReconnect = (router: NextRouter) => {
   document.cookie
      .split(';')
      .filter((c) => c.includes('next-auth'))
      .forEach((c) => {
         document.cookie = c
            .replace(/^ +/, '')
            .replace(
               /=.*/,
               '=;expires=' + new Date().toUTCString() + ';path=/'
            );
      });
   router.reload();
};

const renderReconnectButton = (needReconnect: boolean, router: NextRouter) => {
   if (needReconnect) {
      return (
         <>
            <button
               className="bg-bud dark:text-light p-6 rounded-full mx-2"
               onClick={() => forceReconnect(router)}
            >
               <FaHammer />
            </button>
         </>
      );
   }
};

function WebPlayback() {
   const { data: session } = useSession();
   const [player, setPlayer] = useState({} as Player);
   const [is_paused, setPaused] = useState(false);
   const [is_active, setActive] = useState(false);
   const [ready, setReady] = useState(false);
   const [current_track, setTrack] = useState({} as Track);
   const [position, setPosition] = useState(-1);
   const [duration, setDuration] = useState(0);
   const [theme, setTheme] = useState('');
   const [needReconnect, setneedReconnect] = useState(false);
   const router = useRouter();

   const playerDiv = () => {
      if (ready) {
         return (
            <div className="text-center w-80">
               {albumCover(current_track)}
               <div className="py-4">
                  <SlidingText
                     text={current_track.name}
                     textStyles="dark:bg-[#191414] dark:text-light text-lg w-25 text-center cursor-pointer"
                     speed={25}
                  />
                  <SlidingText
                     text={artistsList(current_track.artists)}
                     textStyles="dark:bg-[#191414] dark:text-light w-25 text-center cursor-pointer"
                     speed={20}
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
                     className="bg-bud dark:text-light p-6 rounded-full mx-2"
                     onClick={() => {
                        (player as any).previousTrack();
                     }}
                  >
                     <FaBackward />
                  </button>

                  <button
                     className="bg-bud dark:text-light p-10 rounded-full mx-2"
                     onClick={() => {
                        (player as any).togglePlay();
                     }}
                  >
                     {is_paused ? <FaPlay /> : <FaPause />}
                  </button>

                  <button
                     className="bg-bud dark:text-light p-6 rounded-full mx-2"
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
      return theme === 'light' ? (
         <>
            <Audio height="80" width="80" color="black" />
            {renderReconnectButton(needReconnect, router)}
         </>
      ) : (
         <>
            <Audio height="80" width="80" color="white" />
            {renderReconnectButton(needReconnect, router)}
         </>
      );
   };

   const checkUserTheme = () => {
      const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkThemeMq.matches) {
         setTheme('dark');
      } else {
         setTheme('light');
      }
   };

   useEffect(() => {
      checkUserTheme();
      if (session) {
         addSpotifyPlayer();
         (window as any).onSpotifyWebPlaybackSDKReady = () => {
            const token = (session as SpotifySession).accesstoken;
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

            player.addListener(
               'ready',
               async ({ device_id }: { device_id: string }): Promise<void> => {
                  await connectDevice(device_id);
                  setReady(true);
               }
            );

            player.addListener(
               'initialization_error',
               ({ message }: { message: string }) => {
                  console.error(message);
               }
            );

            player.addListener(
               'authentication_error',
               ({ message }: { message: string }) => {
                  console.error(message);
                  setneedReconnect(true);
               }
            );

            player.addListener(
               'player_state_changed',
               async (state: PlaybackState) => {
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
               }
            );

            player.connect().then((success: any) => {
               if (success) {
                  console.log(
                     'The Web Playback SDK successfully connected to Spotify!'
                  );
               }
            });

            return () => {
               player.disconnect();
            };
         };
      }
   }, [session]);

   return (
      <div className="mx-auto flex flex-row items-center content-center justify-center border-2 border-dark dark:border-light p-5 rounded-xl dark:bg-[#191414] bg-white">
         {playerDiv()}
      </div>
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

const addSpotifyPlayer = () => {
   if (document.getElementById('spot-player') === null) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.id = 'spot-player';
      script.async = true;
      document.body.appendChild(script);
   }
};

export default WebPlayback;
