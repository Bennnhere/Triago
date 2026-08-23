/* Triago application routes: a public product narrative and an interactive command center share one visual system. */
import { Route, Switch } from "wouter";
import Landing from "./pages/Landing";
import CommandCenter from "./pages/CommandCenter";

export default function App() {
  return <Switch><Route path="/app" component={CommandCenter} /><Route path="/" component={Landing} /><Route component={Landing} /></Switch>;
}
