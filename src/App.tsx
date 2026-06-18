import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./lib/theme";
import { AppRouter } from "./router";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
