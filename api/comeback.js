const COMEBACKS = [
  "Wow, I had no idea you were an expert on literally everything - when did you get that degree?",
  "Oh wow, I never would have figured that out without a man to explain it to me.",
  "Oh wow, I never would have thought of that obvious solution myself, thank you so much for enlightening me.",
  "That's so interesting, I actually have a PhD in this but please, go on.",
  "Thank you for simplifying that. I was really struggling with the concept of existing.",
  "I'm sorry, I must have left my 'please explain this to me' sign on by accident.",
  "Oh I see, so THAT'S what words mean. Thank you.",
  "You must be exhausted carrying around all that unsolicited expertise.",
  "Bold of you to assume I've never encountered a fact before.",
  "Sorry, I zoned out — were you still explaining, or did you just finish saving my life?",
  "Fascinating. My therapist is going to love hearing about this moment.",
  "Wow. You're like Wikipedia but way more confident and way less accurate.",
  "I genuinely cannot tell if you're being helpful or if this is a bit.",
  "Please, keep going. I'm writing a book called 'Things I Did Not Ask For.'",
  "Thank you. I'll file that under 'information that was not requested.'",
  "Do you do this for everyone or am I just lucky?",
  "The confidence! The range! The complete lack of being asked!",
  "I have a masters degree in this but sure, what were you saying?",
  "Oh thank god you were here. I was just about to figure it out myself.",
  "Wow, you're so brave for explaining this to someone who didn't ask.",
];

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  // Pick randomly but never repeat the last one
  const last = req.body?.last ?? -1;
  let idx;
  do { idx = Math.floor(Math.random() * COMEBACKS.length); } while (idx === last && COMEBACKS.length > 1);

  return res.status(200).json({ text: COMEBACKS[idx], idx });
}
