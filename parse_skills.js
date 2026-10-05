const fs = require('fs');

const content = fs.readFileSync('public/skillprint-portal-redesign/js/skillprint.js', 'utf8');

// We'll extract everything between `const PORTAL_SKILLS = {` and the corresponding `};`
const startIndex = content.indexOf('const PORTAL_SKILLS = {');
let braces = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < content.length; i++) {
  if (content[i] === '{') {
    braces++;
    started = true;
  } else if (content[i] === '}') {
    braces--;
  }
  
  if (started && braces === 0) {
    endIndex = i;
    break;
  }
}

const portalSkillsStr = content.substring(startIndex + 'const PORTAL_SKILLS = '.length, endIndex + 1);

// We need to parse it. Since it contains comments, we can evaluate it if we strip them, or just use `eval`.
// Let's create a temporary module to export it
const moduleStr = `module.exports = ${portalSkillsStr};`;
fs.writeFileSync('temp_skills.js', moduleStr);

try {
  const skills = require('./temp_skills.js');
  const cleanSkills = {};
  for (const [key, val] of Object.entries(skills)) {
    cleanSkills[key] = {
      name: val.name,
      pillar: val.pillar,
    };
  }
  
  const output = `export interface PortalSkill {\n  slug: string;\n  name: string;\n  pillar: 'mood' | 'cognition' | 'personality';\n}\n\nexport const PORTAL_SKILLS: Record<string, PortalSkill> = ` + JSON.stringify(cleanSkills, null, 2) + `;\n`;
  
  fs.writeFileSync('app/config/skillsTaxonomy.ts', output);
  console.log('Successfully wrote to app/config/skillsTaxonomy.ts');
} catch(e) {
  console.error("Error evaluating:", e);
}
