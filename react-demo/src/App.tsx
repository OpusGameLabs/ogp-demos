import './App.css';
import OpenGameSDK, { SDKEvents, SDKOpts } from "@opusgamelabs/game-sdk";

import { useState, useEffect } from 'react';

function App() {
  const [points, setPoints] = useState<number>(0);
  const [sdk, setSdk] = useState<OpenGameSDK | undefined>();
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    setSdk(new OpenGameSDK({ ui: { usePointsWidget: true } } as SDKOpts));
  }, []);

  useEffect(() => {
    if (sdk) sdk.init({ gameId: '3a19bc9a-a866-47a2-94df-8f93ba83c39a' });
  }, [sdk]);

  function updatePoints(): void {
    setPoints(points + 1);
    if (sdk) sdk.addPoints(1);
  }

  async function savePoints(): Promise<void> {
    if (sdk) await sdk.savePoints(points);
  }

  async function login(): Promise<void> {
    if (sdk) await sdk.login();
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
            <button onClick={login}>Demo Login</button>
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

export default App;
