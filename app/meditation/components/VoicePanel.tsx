'use client';

import { FormEvent, useState } from 'react';
import { generator, GeneratorError, Job, Voice, VoiceCatalog, waitForJob } from '../../../lib/models/meditation/generator';

interface Props {
  catalog: VoiceCatalog | null;
  online: boolean;
  selectedId: string;
  onSelect: (voice: Voice) => void;
  onCatalogChange: () => void;
  onPreview: () => void;
  previewing: boolean;
  previewUrl: string | null;
}

function voiceMeta(voice: Voice): string {
  if (voice.kind === 'cloned') {
    if (voice.status === 'PROCESSING') return 'Training…';
    if (voice.status === 'FAILED') return voice.error || 'Training failed';
    return [voice.gender !== 'Unspecified' ? voice.gender : null, voice.referenceSeconds ? `${voice.referenceSeconds}s reference` : null,
      voice.mode === 'icl' ? 'transcript-matched' : null].filter(Boolean).join(' · ');
  }
  return [voice.gender, voice.description, voice.native && voice.native !== 'English' ? `${voice.native} native` : null]
    .filter(Boolean).join(' · ');
}

export default function VoicePanel({ catalog, online, selectedId, onSelect, onCatalogChange, onPreview, previewing, previewUrl }: Props) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Female');
  const [transcript, setTranscript] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [training, setTraining] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const trainVoice = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const form = new FormData();
    form.append('name', name.trim());
    form.append('gender', gender);
    form.append('transcript', transcript.trim());
    files.forEach((file) => form.append('files', file, file.name));
    try {
      const { voice, job } = await generator.createVoice(form);
      setTraining(job);
      onCatalogChange();
      const done = await waitForJob(job.id, setTraining);
      onCatalogChange();
      if (done.status === 'FAILED') {
        setError(done.error || 'Training failed');
        return;
      }
      setName('');
      setTranscript('');
      setFiles([]);
      setFormKey((k) => k + 1);
      onSelect({ ...voice, status: 'READY' });
    } catch (err) {
      setError(err instanceof GeneratorError ? err.message : String(err));
    } finally {
      setTraining(null);
    }
  };

  const removeVoice = async (voice: Voice) => {
    if (!window.confirm(`Delete the voice "${voice.name}" from the generator? Saved meditations keep their audio.`)) return;
    try {
      await generator.deleteVoice(voice.id);
      onCatalogChange();
    } catch (err) {
      setError(String(err));
    }
  };

  const renderVoice = (voice: Voice) => (
    <div key={voice.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <button
        type="button"
        className="med-voice"
        aria-pressed={voice.id === selectedId}
        disabled={voice.status !== 'READY'}
        onClick={() => onSelect(voice)}
      >
        <span className="med-voice-body">
          <span className="med-voice-name">{voice.name}</span>
          <br />
          <span className="med-voice-meta">{voiceMeta(voice)}</span>
        </span>
      </button>
      {voice.kind === 'cloned' && (
        <button type="button" className="med-btn med-btn--ghost med-btn--small med-btn--danger" onClick={() => removeVoice(voice)}
          aria-label={`Delete ${voice.name}`}>
          ✕
        </button>
      )}
    </div>
  );

  return (
    <section className="med-card" aria-labelledby="med-voice-heading">
      <div className="med-card-head">
        <h2 id="med-voice-heading">Voice</h2>
        <button type="button" className="med-btn med-btn--small" onClick={onPreview} disabled={!online || !selectedId || previewing}>
          {previewing ? 'Rendering preview…' : 'Preview voice'}
        </button>
      </div>
      {previewUrl && <audio className="med-audio" src={previewUrl} controls autoPlay />}

      {catalog ? (
        <div className="med-voices">
          {catalog.cloned.length > 0 && <div className="med-voice-group">Your voices</div>}
          {catalog.cloned.map(renderVoice)}
          <div className="med-voice-group">Open-source voices (Qwen3-TTS)</div>
          {catalog.presets.map(renderVoice)}
        </div>
      ) : (
        <p className="med-hint">{online ? 'Loading voices…' : 'Voices load once the generator is running.'}</p>
      )}

      <details className="med-details">
        <summary>＋ Add a voice from recordings</summary>
        <form key={formKey} onSubmit={trainVoice} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="med-hint">
            Upload clean recordings of one speaker (WAV or MP3, a minute or more is plenty). The generator extracts the
            clearest 15 seconds and learns a reusable voice profile from it. Only use voices you have permission to clone.
          </p>
          <div className="med-field-row">
            <label className="med-field">
              Name
              <input className="med-input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={64} />
            </label>
            <label className="med-field">
              Gender
              <select className="med-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>Female</option>
                <option>Male</option>
                <option>Unspecified</option>
              </select>
            </label>
          </div>
          <label className="med-field">
            Recordings
            <input className="med-input" type="file" accept="audio/*" multiple required
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          </label>
          <label className="med-field">
            Transcript (optional)
            <textarea className="med-textarea" style={{ minHeight: 70 }} value={transcript} onChange={(e) => setTranscript(e.target.value)}
              placeholder="Exact words of the first recording (under 30s). Improves likeness; leave empty for multi-file uploads." />
          </label>
          {training && (
            <div>
              <div className="med-progress"><span style={{ width: `${Math.round(training.progress * 100)}%` }} /></div>
              <p className="med-hint" style={{ marginTop: 6 }}>{training.message}</p>
            </div>
          )}
          {error && <div className="med-alert" role="alert">{error}</div>}
          <div className="med-actions">
            <button type="submit" className="med-btn med-btn--primary" disabled={!online || !!training || !name.trim() || !files.length}>
              {training ? 'Training…' : 'Train voice'}
            </button>
          </div>
        </form>
      </details>
    </section>
  );
}
