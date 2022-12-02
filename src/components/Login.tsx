import { useSession, signIn, signOut } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

function Login() {
   const { data: session, status } = useSession();

   const popupCenter = (url: string, title: string) => {
      const dualScreenLeft = window.screenLeft ?? window.screenX;
      const dualScreenTop = window.screenTop ?? window.screenY;
      const width =
         window.innerWidth ??
         document.documentElement.clientWidth ??
         screen.width;

      const height =
         window.innerHeight ??
         document.documentElement.clientHeight ??
         screen.height;

      const systemZoom = width / window.screen.availWidth;

      const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
      const top = (height - 550) / 2 / systemZoom + dualScreenTop;

      const newWindow = window.open(
         url,
         title,
         `width=${500 / systemZoom},height=${
            550 / systemZoom
         },top=${top},left=${left}`
      );

      newWindow?.focus();
   };

   if (status === 'authenticated') {
      return (
         <div className="dark:bg-bud dark:text-light p-6 rounded mx-4">
            <h2> Welcome {(session as any).user.email} 😀</h2>
            <button onClick={() => signOut()}>Sign out</button>
         </div>
      );
   } else if (status === 'unauthenticated') {
      return (
         <div className="dark:text-light">
            <button
               className="dark:bg-bud dark:text-light p-6 rounded mx-4"
               onClick={() => popupCenter('/signin', 'Sign into Spotify')}
            >
               Sign In with Spotify
            </button>
         </div>
      );
   }

   return (
      <div>
         <h1>Loading...</h1>
      </div>
   );
}

export default Login;
