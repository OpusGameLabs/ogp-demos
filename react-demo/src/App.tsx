import './App.css';
import OpenGameSDK, { SDKOpts } from "@opusgamelabs/game-sdk";

import { useState, useEffect } from 'react';

function App() {
  const [points, setPoints] = useState<number>(0);
  const [sdk, setSdk] = useState<OpenGameSDK | undefined>();

  useEffect(() => {
    setSdk(new OpenGameSDK({ ui: { usePointsWidget: true }} as SDKOpts));
  }, []);

  useEffect(() => {
    if(sdk) sdk.init({ gameId: 'insert-game-id-here' });
  }, [sdk]);

  function updatePoints(): void {
    setPoints(points + 1);
    if (sdk) sdk.addPoints(1);
  }

  async function savePoints(): Promise<void> {
    if (sdk) await sdk.savePoints(points);
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Points: {points}
        </p>
        <button onClick={updatePoints}>
          Add point
        </button>
        <button onClick={savePoints}>
          Save score
        </button>
      </header>
    </div>
  );
}

export default App;
