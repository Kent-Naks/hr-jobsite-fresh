// tools/enrich-jobs.mjs
import fs from "fs";
import path from "path";

const DATA_DIR = "./frontend/src/app/data";
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));

// pools for randomisation
const salaryBands = [
  [145000, 180000],
  [180001, 220000],
  [220001, 260000],
  [260001, 310000],
  [310001, 370000],
];
const extraBenefits = [
  "Life insurance",
  "Gym membership",
  "Learning stipend",
  "Flexible hours",
  "Interest-free staff loan",
  "On-site meals",
  "Work-from-home allowance"
];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

for (const file of files) {
  const fullPath = path.join(DATA_DIR, file);
  const jobs = JSON.parse(fs.readFileSync(fullPath, "utf8"));

  const enriched = jobs.map(j => {
    // skip if already enriched
    if (j.salaryKES && j.benefits) return j;

    // salary
    const [low, high] = pick(salaryBands);
    const salaryKES = `KSh ${low.toLocaleString()} – KSh ${high.toLocaleString()}`;

    // mandatory + 1-3 random extras
    const benefits = [
      "Comprehensive medical cover",
      "Dental cover",
      "Optical cover",
      ...Array.from({ length: randInt(1, 3) }, () => pick(extraBenefits))
        .filter((v, i, a) => a.indexOf(v) === i) // dedupe
    ];

    return { ...j, salaryKES, benefits };
  });

  fs.writeFileSync(fullPath, JSON.stringify(enriched, null, 2));
  console.log(`✔️  Updated ${file}`);
}

console.log("All job JSON files enriched successfully!");
