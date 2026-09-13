import { createIndexFromDirectory, saveIndex } from './ingest.js';

const directory = process.argv[2] ?? './knowledge';
const output = process.argv[3] ?? './knowledge-index.json';
const index = await createIndexFromDirectory(directory);
await saveIndex(index, output);
console.log(`Indexed ${index.length} chunks from ${directory} -> ${output}`);
