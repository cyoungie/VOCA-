/**
 * Debug component: shows what env vars are actually loaded.
 * Add this temporarily to see if VITE_GEMINI_API_KEY is being read.
 */
export default function EnvDebug() {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const allEnv = import.meta.env;

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md z-50">
      <h3 className="font-bold mb-2">Env Debug:</h3>
      <div className="space-y-1">
        <div>
          <strong>VITE_GEMINI_API_KEY:</strong>{' '}
          {geminiKey ? (
            <span className="text-green-400">
              ✓ Found ({geminiKey.substring(0, 10)}...)
            </span>
          ) : (
            <span className="text-red-400">✗ NOT FOUND</span>
          )}
        </div>
        <div>
          <strong>VITE_ELEVENLABS_API_KEY:</strong>{' '}
          {elevenLabsKey ? (
            <span className="text-green-400">
              ✓ Found ({elevenLabsKey.substring(0, 10)}...)
            </span>
          ) : (
            <span className="text-yellow-400">⚠ Not set (using browser TTS)</span>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600">
          <strong>All VITE_ vars:</strong>
          <pre className="text-[10px] overflow-auto max-h-32 mt-1">
            {JSON.stringify(
              Object.keys(allEnv)
                .filter((k) => k.startsWith('VITE_'))
                .reduce((acc, k) => {
                  acc[k] = allEnv[k]?.substring(0, 15) + '...';
                  return acc;
                }, {}),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
