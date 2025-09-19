import './App.css';
import OpenGameSDK, { SDKEvents, SDKOpts } from "@opusgamelabs/game-sdk";

import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { app } from './firebase';


interface GameAuthProps {
  ogp: OpenGameSDK;
}

const GameAuth = ({ ogp }: GameAuthProps) => {
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      if (user && ogp) {
        user.getIdToken().then(token => {
          console.log("auth token: ", token)
          ogp.setCustomAuthToken(token);
        });
      }
    });
    return () => unsubscribe();
  }, [auth, ogp]);

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (user) {
    return (
      <div>
        <p>Welcome, {user.displayName}!</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  return <button onClick={signIn}>Sign in with Google</button>;
};


function AppCustomAuth() {
  const [points, setPoints] = useState<number>(0);
  const [sdk, setSdk] = useState<OpenGameSDK | undefined>();
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    setSdk(new OpenGameSDK({ ui: { usePointsWidget: true }, useCustomAuth: true } as SDKOpts));
  }, []);

  useEffect(() => {
    if (sdk) sdk.init({ gameId: '08a17f31-977f-4404-aa47-32d986e66419' });
    if (sdk) sdk.startCustomAuth();
  }, [sdk]);

  function updatePoints(): void {
    setPoints(points + 1);
    if (sdk) sdk.addPoints(1);
  }

  async function savePoints(): Promise<void> {
    if (sdk) await sdk.savePoints(points);
  }

  sdk?.on(SDKEvents.OnReady, () => {
    console.log('🚀 OpenGameSDK is ready');
    setSdkReady(true);
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Points: {points}
        </p>
        {sdkReady ?
          <>
            {sdk &&
              <GameAuth ogp={sdk} />
            }
            <button onClick={updatePoints}>
              Add point
            </button>
            <button onClick={savePoints}>
              Save score
            </button>
          </> :
          <>
            <p>Loading...</p>
          </>
        }
      </header>
    </div>
  );
}

export default AppCustomAuth;
