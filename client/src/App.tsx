/* Signal Gate Design: keep the shell direct, dark, and evidence-first—never a chat or marketing surface. */
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

export default function App() {
  return (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  );
}
