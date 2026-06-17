import { ThemeProvider } from "./lib/theme";
import { Dashboard } from "./components/dashboard/Dashboard";

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
