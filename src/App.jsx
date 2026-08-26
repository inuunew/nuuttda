import { useState } from 'react';

function App() {
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSpam = async () => {
    if (!phone) return;
    setLoading(true);
    setResults(null);
    try {
      const [res1, res2, res3] = await Promise.all([
        fetch('/api/spam-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, batch: 1 })
        }).then(r => r.json()),
        fetch('/api/spam-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, batch: 2 })
        }).then(r => r.json()),
        fetch('/api/spam-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, batch: 3 })
        }).then(r => r.json()),
      ]);

      const total = res1.total + res2.total + res3.total;
      const success = res1.success + res2.success + res3.success;
      const failed = res1.failed + res2.failed + res3.failed;
      const elapsed = (
        parseFloat(res1.elapsed) + parseFloat(res2.elapsed) + parseFloat(res3.elapsed)
      ).toFixed(1);

      setResults({ total, success, failed, elapsed, phone: res1.phone });
    } catch (err) {
      setResults({ error: 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', textAlign: 'center', padding: 20 }}>
      <h1>📡 CYBER-SPAM OTP 👨🏼‍💻</h1>
      <input
        type="text"
        placeholder="08xxxxxxxxxx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ padding: 10, fontSize: 16, width: '80%' }}
      />
      <br /><br />
      <button
        onClick={handleSpam}
        disabled={loading}
        style={{
          padding: '12px 30px',
          fontSize: 18,
          background: '#0f0',
          color: '#000',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'MENGIRIM...' : 'SPAM OTP'}
      </button>

      {results && (
        <div style={{ marginTop: 30, background: '#000', padding: 20, borderRadius: 8 }}>
          {results.error ? (
            <p style={{ color: 'red' }}>{results.error}</p>
          ) : (
            <>
              <p>✅ Success: {results.success}/{results.total}</p>
              <p>❌ Failed: {results.failed}/{results.total}</p>
              <p>⏱️ Total time: {results.elapsed}s</p>
              <p style={{ color: '#ff0' }}>{results.phone}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;