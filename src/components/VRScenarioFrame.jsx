import useStore from '../store/useStore';

export default function VRScenarioFrame({ sceneId, title, prompt, hint }) {
  const exitToResults = useStore((s) => s.exitToResults);

  const handleFinish = () => {
    exitToResults({
      score: 85,
      newWordsCount: 5,
      pronunciationGrade: 'B+',
      fluencyFeedback: 'Great job!',
    });
  };

  return (
    <div className={`scene scene-${sceneId}`} data-scene={sceneId}>
      <div className="vr-frame">
        <h2 className="vr-frame__title">{title}</h2>
        <p className="vr-frame__desc">AI character stands in front of you.</p>
        <p className="vr-frame__prompt">Speak: &ldquo;{prompt}&rdquo;</p>

        <div className="vr-frame__feedback">
          <p className="vr-frame__feedback-item vr-frame__feedback--success">✅ Great pronunciation!</p>
          <p className="vr-frame__feedback-item vr-frame__feedback--tip">💡 Try: &ldquo;{hint}&rdquo;</p>
        </div>

        <p className="vr-frame__continue">Conversation continues…</p>

        <button type="button" className="vr-frame__finish" onClick={handleFinish}>
          Finish & see results
        </button>
      </div>
    </div>
  );
}
