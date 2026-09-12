import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'dsa_parsed_excel.json');

// Leetcode API endpoint
const LEETCODE_API = 'https://leetcode.com/graphql';

async function searchLeetCode(title: string) {
  // Clean title (remove (easy), (medium), etc.)
  const cleanTitle = title.replace(/\(.*?\)/g, '').trim();
  
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        data {
          title
          titleSlug
        }
      }
    }
  `;

  try {
    const res = await fetch(LEETCODE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          categorySlug: "",
          skip: 0,
          limit: 5,
          filters: { searchKeyword: cleanTitle }
        }
      })
    });
    
    const json = await res.json();
    const questions = json.data?.problemsetQuestionList?.data;
    
    if (questions && questions.length > 0) {
      // Find exact or closest match
      const exact = questions.find((q: any) => q.title.toLowerCase() === cleanTitle.toLowerCase());
      const match = exact || questions[0];
      return `https://leetcode.com/problems/${match.titleSlug}`;
    }
  } catch (error) {
    console.error(`Error searching LeetCode for ${title}:`, error);
  }
  return null;
}

async function main() {
  console.log("Starting LeetCode enrichment for DSA problems...");
  const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
  let enriched = 0;
  
  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    console.log(`Processing batch ${i/batchSize + 1}/${Math.ceil(data.length/batchSize)}...`);
    
    await Promise.all(batch.map(async (problem: any) => {
      if (!problem.problemUrl) {
        const url = await searchLeetCode(problem.title);
        if (url) {
          problem.problemUrl = url;
          problem.leetcodeUrl = url;
          enriched++;
        }
      }
    }));
    
    // small delay
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Enriched ${enriched} problems with LeetCode URLs.`);
}

main();
