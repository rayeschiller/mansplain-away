import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const names = ['COMEBACKS', 'DARK_COMEBACKS', 'DARKER_COMEBACKS'];
const instructions = 'Speak as a witty woman delivering a sarcastic comeback in natural conversational American English. Use expressive emphasis, brisk, punchy pacing and minimal pauses. Dry, amused, confident delivery; darker lines are exaggerated deadpan comedy, not shouted. Read only the supplied words.';
const voice = 'coral';
const speed = 1.25;
const model = 'gpt-4o-mini-tts';
let lines = names.flatMap(name => {
  const match = html.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`));
  if (!match) throw new Error(`Missing ${name}`);
  return vm.runInNewContext(match[1]);
});
if (process.argv.includes('--check')) {
  console.log(`${lines.length} comebacks ready for generation with ${voice}.`);
  process.exit(0);
}
const textArg = process.argv.indexOf('--text');
if (textArg !== -1) {
  const selected = process.argv[textArg + 1];
  if (!lines.includes(selected)) throw new Error('The selected text must match an existing comeback.');
  lines = [selected];
}
const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error('Set OPENAI_API_KEY in your local environment first. Never commit the key.');
await mkdir(new URL('audio/', root), { recursive: true });
const clips = textArg === -1 ? {} : vm.runInNewContext(
  await readFile(new URL('audio/clips.js', root), 'utf8') + ';window.COMEBACK_AUDIO',
  {window: {}}
);
for (const text of lines) {
  const id = createHash('sha256').update(JSON.stringify({text, voice, model, instructions, speed})).digest('hex').slice(0, 24);
  const path = `audio/${id}.mp3`;
  const file = new URL(path, root);
  const existing = await stat(file).catch(() => null);
  if (!existing?.size) {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({model, voice, input: text, instructions, speed, response_format: 'mp3'}),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok) throw new Error(`Speech generation failed (${response.status}); rerun to resume.`);
    const audio = Buffer.from(await response.arrayBuffer());
    if (!audio.length) throw new Error('Speech generation returned empty audio.');
    await writeFile(file, audio);
  }
  clips[text] = path;
  console.log(`Generated clip: ${path}`);
}
// Publish the manifest only after every clip has been generated successfully.
await writeFile(new URL('audio/clips.js', root), `window.COMEBACK_AUDIO = ${JSON.stringify(clips, null, 2)};\n`);
console.log('Selected clips generated. Listen before publishing.');
