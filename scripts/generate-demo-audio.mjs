import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const context = {window:{}};
vm.runInNewContext(await fs.readFile(new URL('audio/demo-cues.js',root),'utf8'),context);
let key = process.env.OPENAI_API_KEY;
if (!key) {
  const env = await fs.readFile(new URL('.env.local',root),'utf8');
  key = env.match(/^OPENAI_API_KEY\s*=\s*(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g,'');
}
if (!key) throw Error('Missing local API key.');
const selected = process.argv[process.argv.indexOf('--cue') + 1];
const oneCue = process.argv.includes('--cue');
if (oneCue && !context.window.FILMING_CUES.some(c => c.id === selected)) throw Error('Unknown filming cue.');
if (oneCue) vm.runInNewContext(await fs.readFile(new URL('audio/demo-clips.js',root),'utf8'),context);
const clips = oneCue ? {...context.window.FILMING_AUDIO} : {};
for (const cue of context.window.FILMING_CUES.filter(c => !oneCue || c.id === selected)) {
  const horror = ['horror','payoff'].includes(cue.id);
  const instructions = cue.delivery || (horror
    ? 'Perform as a terrifying horror-film voice: very deep, dark, gravelly and ominous, with controlled cold menace and an unsettling whispered edge. Clearly articulate every word. Deliver it as a sinister prophecy. Compact delivery, no long dramatic pauses, no shouting, no added words or sound effects. Read only the supplied text.'
    : 'Perform as a sharp, funny woman delivering a cutting sarcastic comeback. Natural conversational American English, dry amused contempt, confident comic timing, crisp consonants and expressive emphasis. Very brisk, punchy delivery with minimal pauses; every word must remain clear. No drawn-out syllables, no added words or laughter. Read only the supplied text.');
  const payload = {model:'gpt-4o-mini-tts',voice:horror?'onyx':'coral',input:cue.speechText || cue.text,instructions,speed:cue.speed || (horror?1.1:1.3),response_format:'mp3'};
  const id = createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0,24);
  const path = `audio/demo-${id}.mp3`;
  const file = new URL(path,root);
  if (!(await fs.stat(file).catch(()=>null))?.size) {
    const response = await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(120000)});
    if (!response.ok) throw Error(`Audio generation failed (${response.status}); rerun to resume.`);
    const audio = Buffer.from(await response.arrayBuffer());
    if (!audio.length) throw Error('Empty audio.');
    await fs.writeFile(file,audio);
  }
  clips[cue.id] = path;
  console.log(`${cue.id}: ${payload.voice}, speed ${payload.speed}`);
}
await fs.writeFile(new URL('audio/demo-clips.js',root),'window.FILMING_AUDIO = '+JSON.stringify(clips,null,2)+';\n');
