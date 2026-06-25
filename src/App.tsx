import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./lib/theme";
import { AppRouter } from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import { LocaleProvider } from "./contexts/LocaleContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocaleProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </LocaleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
