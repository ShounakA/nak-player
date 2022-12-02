import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

const SignInPage = () => {
   const { data: session, status } = useSession();

   useEffect(() => {
      if (!(status === 'loading') && !session) void signIn('spotify');
      if (session) window.close();
   }, [session, status]);

   return <div className="min-h-screen min-w-full absolute left-0 top-0"></div>;
};

export default SignInPage;
