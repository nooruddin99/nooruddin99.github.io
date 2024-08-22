import { TonConnectUIProvider } from '@tonconnect/ui-react';
import "./App.css";
import Home from "./Home.tsx";

function App() {
  return (
    <TonConnectUIProvider manifestUrl="https://landverseminiapp.com/tonconnect-manifest.json">
      <Home />
    </TonConnectUIProvider>
  );
}

export default App;
