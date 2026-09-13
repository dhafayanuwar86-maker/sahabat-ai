import { createIndexFromDirectory } from './ingest.js';
import { answerFromKnowledge } from './rag.js';

const index = await createIndexFromDirectory('./knowledge');
const question = process.argv.slice(2).join(' ') || 'Bagaimana Keiland AI menangani informasi yang tidak tersedia?';
const result = answerFromKnowledge(index, question, { topK: 5, minScore: 0.01 });
console.log(JSON.stringify({ grounded: result.grounded, answer: result.answer, citations: result.citations, prompt: result.prompt }, null, 2));
