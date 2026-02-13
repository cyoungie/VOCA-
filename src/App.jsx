import useStore from './store/useStore';
import HomePage from './components/HomePage';
import ConversationView from './components/ConversationView';
import ResultsScreen from './components/ResultsScreen';

export default function App() {
  const screen = useStore((s) => s.screen);

  if (screen === 'home') return <HomePage />;
  if (screen === 'results') return <ResultsScreen />;
  return <ConversationView />;
}
