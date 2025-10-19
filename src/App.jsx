import "./App.css";
import { useAuth } from "./hooks/useAuth";

import { Login } from "./Login";
import { ControlPanel } from "./ControlPanel";

function App() {
  const { isLoggedIn, login, logout, getToken } = useAuth();

  return (
    <>
      {isLoggedIn ? (
        <ControlPanel
          isLoggedIn={isLoggedIn}
          logout={logout}
          getToken={getToken}
        ></ControlPanel>
      ) : (
        <Login login={login}></Login>
      )}
    </>
  );
}

export default App;
