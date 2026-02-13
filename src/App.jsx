import useStore from './store/useStore';
import HomePage from './components/HomePage';
import ConversationView from './components/ConversationView';
import ResultsScreen from './components/ResultsScreen';
import ProfilePage from './components/ProfilePage';
import EnvDebug from './components/EnvDebug';

export default function App() {
  const screen = useStore((s) => s.screen);

  return (
    <>
      {/* Temporary debug - remove after fixing */}
      <EnvDebug />
      {screen === 'home' && <HomePage />}
      {screen === 'profile' && <ProfilePage />}
      {screen === 'results' && <ResultsScreen />}
      {screen !== 'home' && screen !== 'profile' && screen !== 'results' && <ConversationView />}
    </>
  );
}
