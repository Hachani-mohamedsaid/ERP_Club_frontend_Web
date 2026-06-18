import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./lib/theme";
import { AppRouter } from "./router";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
