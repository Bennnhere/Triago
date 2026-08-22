/* Triago application routes: a public product narrative and an interactive command center share one visual system. */
import { Route, Switch } from "wouter";
import { RequireAuth } from "./components/RequireAuth";
import Landing from "./pages/Landing";
import CommandCenter from "./pages/CommandCenter";
import Login from "./pages/Login";

export default function App() {
  return <Switch><Route path="/login" component={Login} /><Route path="/app"><RequireAuth><CommandCenter /></RequireAuth></Route><Route path="/" component={Landing} /><Route component={Landing} /></Switch>;
}
