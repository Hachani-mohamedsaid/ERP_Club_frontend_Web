import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./lib/theme";
import { AppRouter } from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocaleProvider>
          <UserPreferencesProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </UserPreferencesProvider>
        </LocaleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
