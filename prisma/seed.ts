/**
 * Seeds the database with:
 * 1. Curated study plans (8-week DSA, 4-week System Design, Complete Interview Prep)
 * 2. Curated interview question bank (Java, SpringBoot, SQL, Behavioral)
 * 
 * Run: npx ts-node --project tsconfig.json -e "require('./prisma/seed.ts')"
 * OR:  npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedStudyPlans() {
  console.log("🌱 Seeding study plans...");

  const dsaPlan = await prisma.studyPlan.upsert({
    where: { id: "plan-dsa-8week" },
    update: {},
    create: {
      id: "plan-dsa-8week",
      name: "8-Week DSA Mastery",
      description: "Systematic coverage of all major DSA patterns, from arrays to graphs. Covers LeetCode patterns, blind 75, and company-specific problems.",
      durationWeeks: 8,
      phases: {
        create: [
          { order: 1, name: "Week 1-2: Arrays, Strings & Two Pointers", description: "Foundation — master linear data structures and two-pointer technique", targetProblems: 25, targetHours: 20, topics: "Arrays,Strings,Two Pointers,Sliding Window" },
          { order: 2, name: "Week 3: Linked Lists & Stacks/Queues", description: "Pointer manipulation, monotonic stacks, BFS queue patterns", targetProblems: 20, targetHours: 15, topics: "Linked List,Stack,Queue,Monotonic Stack" },
          { order: 3, name: "Week 4: Trees & Recursion", description: "Binary trees, BST, DFS/BFS, tree DP", targetProblems: 25, targetHours: 20, topics: "Binary Tree,BST,DFS,BFS,Recursion" },
          { order: 4, name: "Week 5: Graphs", description: "Graph traversal, shortest path, union-find, topological sort", targetProblems: 20, targetHours: 18, topics: "Graphs,BFS,DFS,Dijkstra,Union Find,Topological Sort" },
          { order: 5, name: "Week 6: Dynamic Programming", description: "All DP patterns: 1D, 2D, Knapsack, LCS, digit DP", targetProblems: 30, targetHours: 25, topics: "DP,Knapsack,LCS,Memoization,Tabulation" },
          { order: 6, name: "Week 7: Heaps, Backtracking & Binary Search", description: "Priority queues, combinations/permutations, binary search patterns", targetProblems: 20, targetHours: 18, topics: "Heap,Priority Queue,Backtracking,Binary Search" },
          { order: 7, name: "Week 8: Mock Interviews & Revision", description: "Full mock sessions, spaced repetition reviews, weak area focus", targetProblems: 15, targetHours: 20, topics: "Review,Mock,Spaced Repetition" },
        ],
      },
    },
  });

  const sdPlan = await prisma.studyPlan.upsert({
    where: { id: "plan-sd-4week" },
    update: {},
    create: {
      id: "plan-sd-4week",
      name: "4-Week System Design",
      description: "From fundamentals to large-scale distributed systems. Covers HLD, LLD, case studies, and common interview questions.",
      durationWeeks: 4,
      phases: {
        create: [
          { order: 1, name: "Week 1: Fundamentals", description: "Scalability, load balancing, caching, databases, CAP theorem", targetProblems: 0, targetHours: 15, topics: "Scalability,Load Balancing,Caching,SQL vs NoSQL,CAP Theorem" },
          { order: 2, name: "Week 2: Distributed Systems", description: "Microservices, message queues, consistency models, distributed databases", targetProblems: 0, targetHours: 15, topics: "Microservices,Kafka,Event-Driven,Sharding,Replication" },
          { order: 3, name: "Week 3: Case Studies (Part 1)", description: "Design URL Shortener, Instagram, YouTube, WhatsApp", targetProblems: 0, targetHours: 16, topics: "URL Shortener,Instagram,YouTube,WhatsApp,Rate Limiter" },
          { order: 4, name: "Week 4: Case Studies (Part 2) + Mock", description: "Design Uber, Notification System, Search, Mock interviews", targetProblems: 0, targetHours: 16, topics: "Uber,Notification System,Search Engine,API Gateway,Mock" },
        ],
      },
    },
  });

  const fullPlan = await prisma.studyPlan.upsert({
    where: { id: "plan-complete-interview" },
    update: {},
    create: {
      id: "plan-complete-interview",
      name: "Complete Interview Prep (12 Weeks)",
      description: "End-to-end preparation covering DSA, System Design, Java/Backend fundamentals, and behavioral. Suitable for FAANG and product company interviews.",
      durationWeeks: 12,
      phases: {
        create: [
          { order: 1, name: "Weeks 1-3: DSA Foundation", description: "Arrays, strings, linked lists, trees, basic graphs", targetProblems: 45, targetHours: 40, topics: "Arrays,Strings,Linked List,Trees,Basic Graphs" },
          { order: 2, name: "Weeks 4-6: DSA Advanced + DP", description: "Dynamic programming, advanced graphs, heaps, backtracking", targetProblems: 50, targetHours: 45, topics: "DP,Advanced Graphs,Heaps,Backtracking,Binary Search" },
          { order: 3, name: "Weeks 7-8: Java & Backend", description: "Core Java, OOP, Collections, Multithreading, SpringBoot basics", targetProblems: 0, targetHours: 25, topics: "Java Core,OOP,Collections,Multithreading,SpringBoot,SQL" },
          { order: 4, name: "Weeks 9-10: System Design", description: "HLD fundamentals and case studies", targetProblems: 0, targetHours: 30, topics: "System Design HLD,LLD,Case Studies,Architecture" },
          { order: 5, name: "Weeks 11-12: Mock & Revision", description: "Full mock interviews, behavioral prep, weak area review", targetProblems: 20, targetHours: 30, topics: "Mock Interviews,Behavioral,STAR,Review" },
        ],
      },
    },
  });

  console.log("✅ Study plans seeded:", dsaPlan.name, "|", sdPlan.name, "|", fullPlan.name);
}

async function seedInterviewQuestions() {
  console.log("🌱 Seeding interview questions...");

  const questions = [
    // ── Java Core ─────────────────────────────────────────────────────────
    { category: "Java Core", difficulty: "Easy", question: "What is the difference between `==` and `.equals()` in Java?", answer: "`==` compares object references (memory addresses). `.equals()` compares the content/value. For primitives, `==` compares values. Always use `.equals()` for String comparison.", tags: "OOP,Strings" },
    { category: "Java Core", difficulty: "Medium", question: "Explain the difference between abstract class and interface in Java.", answer: "Abstract class: can have state (fields), constructors, concrete methods, single inheritance. Interface: no state (only constants), all methods are abstract (pre-Java 8), supports multiple inheritance. Use interface for 'can-do' relationships and abstract class for 'is-a' with shared code.", tags: "OOP,Abstraction" },
    { category: "Java Core", difficulty: "Medium", question: "What is the Java Memory Model? Explain heap vs stack.", answer: "Stack: per-thread, stores method frames, local variables, references (LIFO). Heap: shared, stores objects and class instances. Primitives in stack, objects in heap with reference in stack. Stack is faster but smaller.", tags: "JVM,Memory" },
    { category: "Java Core", difficulty: "Hard", question: "What is the difference between checked and unchecked exceptions?", answer: "Checked: must be declared in method signature or caught (IOException, SQLException). Unchecked: extend RuntimeException, no mandatory handling (NullPointerException, ArrayIndexOutOfBoundsException). Errors (OutOfMemoryError) are not exceptions.", tags: "Exceptions,Error Handling" },
    { category: "Java Core", difficulty: "Medium", question: "Explain Java's `final`, `finally`, and `finalize`.", answer: "`final`: keyword for constants (variables), non-overridable (methods), non-inheritable (classes). `finally`: block that always executes after try-catch. `finalize`: deprecated method called by GC before object destruction (unreliable, avoid).", tags: "Keywords" },
    { category: "Java Core", difficulty: "Medium", question: "What is autoboxing and unboxing in Java?", answer: "Autoboxing: automatic conversion from primitive to wrapper class (int → Integer). Unboxing: reverse (Integer → int). Java compiler inserts valueOf() and intValue() calls automatically. Watch for NullPointerException on unboxing null.", tags: "Primitives,Generics" },

    // ── Collections ───────────────────────────────────────────────────────
    { category: "Collections", difficulty: "Medium", question: "Compare ArrayList vs LinkedList. When to use each?", answer: "ArrayList: O(1) random access, O(n) insert/delete middle (shift needed), better cache locality. LinkedList: O(n) access, O(1) insert/delete at known position, more memory (node pointers). Use ArrayList for most cases; LinkedList for frequent front/middle insertions.", tags: "List,Performance" },
    { category: "Collections", difficulty: "Medium", question: "How does HashMap work internally in Java?", answer: "Uses array of buckets. Key.hashCode() → index via (n-1)&hash. Collisions handled via linked list (Java 7) → treeified to red-black tree when bucket size ≥ 8 (Java 8). Default load factor 0.75, capacity doubles on resize. Keys must implement hashCode() and equals().", tags: "HashMap,Hashing" },
    { category: "Collections", difficulty: "Hard", question: "What is ConcurrentHashMap and how does it differ from Hashtable?", answer: "ConcurrentHashMap: segment-level locking (Java 7) → CAS + bucket-level locking (Java 8). Allows concurrent reads without locking. Hashtable: method-level synchronization (entire map), slower. ConcurrentHashMap allows null values?, no. Hashtable: legacy, avoid.", tags: "Concurrency,HashMap" },
    { category: "Collections", difficulty: "Easy", question: "What is the difference between Set and List?", answer: "List: ordered, allows duplicates, index-based access. Set: unordered (except LinkedHashSet/TreeSet), no duplicates, no index access. Use List for sequences, Set for unique elements.", tags: "Collections" },
    { category: "Collections", difficulty: "Medium", question: "What is the fail-fast vs fail-safe iterator?", answer: "Fail-fast: throws ConcurrentModificationException if collection is modified during iteration (ArrayList, HashMap). Fail-safe: works on copy, no exception (ConcurrentHashMap, CopyOnWriteArrayList). Fail-fast uses modCount to detect changes.", tags: "Iterator,Concurrency" },

    // ── Multithreading ────────────────────────────────────────────────────
    { category: "Multithreading", difficulty: "Medium", question: "What is the difference between `synchronized` and `ReentrantLock`?", answer: "`synchronized`: keyword, JVM-level, auto-release on exit, no timeout. `ReentrantLock`: class, explicit lock/unlock, supports tryLock(), timeout, fairness policy, interruptible locking. Use ReentrantLock for advanced control.", tags: "Locks,Concurrency" },
    { category: "Multithreading", difficulty: "Hard", question: "Explain the volatile keyword in Java.", answer: "Ensures visibility: reads/writes go directly to main memory, not CPU cache. Prevents instruction reordering around volatile access. Does NOT make compound operations (i++) atomic. Use for flags; use AtomicInteger for counters.", tags: "Concurrency,Memory Model" },
    { category: "Multithreading", difficulty: "Hard", question: "What is a deadlock? How to prevent it?", answer: "Deadlock: circular wait where thread A holds lock X waiting for Y, thread B holds Y waiting for X. Prevention: lock ordering (always acquire in same order), tryLock with timeout, avoid holding multiple locks, use higher-level constructs (BlockingQueue).", tags: "Deadlock,Concurrency" },
    { category: "Multithreading", difficulty: "Medium", question: "Explain ExecutorService and thread pools.", answer: "ExecutorService manages thread pool to avoid thread creation overhead. Types: FixedThreadPool (n threads), CachedThreadPool (grows/shrinks), ScheduledThreadPool (scheduled tasks), SingleThreadExecutor. Use Executors factory or ThreadPoolExecutor for custom config. Always shutdown().", tags: "ThreadPool,Concurrency" },

    // ── Streams ───────────────────────────────────────────────────────────
    { category: "Streams", difficulty: "Medium", question: "What are Java Streams? What's the difference between intermediate and terminal operations?", answer: "Streams: functional pipeline for processing collections. Intermediate: lazy, return Stream (filter, map, sorted, distinct, limit). Terminal: eager, trigger pipeline, return result (collect, count, reduce, forEach, findAny). Once a terminal op runs, stream is consumed.", tags: "Functional,Java 8" },
    { category: "Streams", difficulty: "Medium", question: "Explain `map` vs `flatMap` in Java Streams.", answer: "map: 1-to-1 transformation. flatMap: 1-to-many, flattens nested collections. Example: list of lists → flatMap → single list. Use flatMap when each element maps to a Stream.", tags: "Functional,Streams" },
    { category: "Streams", difficulty: "Hard", question: "When should you use parallel streams? What are the pitfalls?", answer: "Use for CPU-bound, stateless, large datasets (>10k elements typically). Pitfalls: overhead for small datasets, non-thread-safe collectors, ordering issues, deadlock with synchronized code, shared mutable state. Test with profiling; don't assume faster.", tags: "Parallel,Performance" },

    // ── SpringBoot ────────────────────────────────────────────────────────
    { category: "SpringBoot", difficulty: "Medium", question: "What is Spring Boot auto-configuration?", answer: "Spring Boot automatically configures beans based on classpath. @EnableAutoConfiguration scans for META-INF/spring.factories. ConditionalOn* annotations control which beans are created (e.g., @ConditionalOnClass, @ConditionalOnMissingBean). Override via application.properties.", tags: "Spring,Autoconfiguration" },
    { category: "SpringBoot", difficulty: "Medium", question: "Explain Spring's bean scopes.", answer: "Singleton (default): one instance per container. Prototype: new instance per injection. Request: per HTTP request. Session: per HTTP session. Application: per ServletContext. Use @Scope annotation. Singleton is thread-shared — avoid mutable state.", tags: "Spring,Beans,DI" },
    { category: "SpringBoot", difficulty: "Hard", question: "What is Spring Security and how does JWT work with it?", answer: "Spring Security intercepts requests via FilterChain. JWT: client gets signed token on login, sends as Bearer in Authorization header. Security filter validates signature + expiry, sets Authentication in SecurityContext. Stateless — no server session needed.", tags: "Security,JWT,Authentication" },
    { category: "SpringBoot", difficulty: "Medium", question: "Explain @Transactional in Spring. What are propagation levels?", answer: "REQUIRED (default): use existing or create new. REQUIRES_NEW: always new transaction, suspend existing. NESTED: savepoint. SUPPORTS: use existing if present. NOT_SUPPORTED: suspend existing, run non-transactionally. NEVER: fail if transaction exists. MANDATORY: fail if no transaction.", tags: "Transactions,JPA" },
    { category: "SpringBoot", difficulty: "Hard", question: "What is the N+1 problem in JPA and how do you fix it?", answer: "N+1: fetching N parent entities then N individual queries for each child collection. Fix: EAGER fetching with JOIN FETCH, @EntityGraph, @BatchSize, or DTO projections with JPQL. Monitor with Hibernate statistics or P6Spy.", tags: "JPA,Hibernate,Performance" },

    // ── SQL ───────────────────────────────────────────────────────────────
    { category: "SQL", difficulty: "Medium", question: "What are the ACID properties of a database transaction?", answer: "Atomicity: all or nothing. Consistency: valid state before and after. Isolation: concurrent transactions don't interfere. Durability: committed changes survive crashes. Relational DBs guarantee ACID; NoSQL often sacrifices C or I for availability.", tags: "Transactions,Database" },
    { category: "SQL", difficulty: "Medium", question: "Explain different types of JOINs in SQL.", answer: "INNER JOIN: only matching rows. LEFT JOIN: all left rows + matching right (NULLs for no match). RIGHT JOIN: vice versa. FULL OUTER JOIN: all rows from both. CROSS JOIN: Cartesian product. SELF JOIN: table joined with itself.", tags: "SQL,Joins" },
    { category: "SQL", difficulty: "Hard", question: "How does a database index work? When should you add/avoid them?", answer: "B-tree index: balanced tree, O(log n) lookup. Add for: WHERE columns, JOIN keys, ORDER BY columns, high-selectivity columns. Avoid for: small tables, low-selectivity columns (boolean), frequently updated columns (index maintenance cost), too many indexes slow writes.", tags: "Indexing,Performance" },
    { category: "SQL", difficulty: "Medium", question: "What is the difference between DELETE, TRUNCATE, and DROP?", answer: "DELETE: DML, can have WHERE clause, logged row-by-row, triggers fire, can rollback. TRUNCATE: DDL, removes all rows, minimal logging, resets identity, cannot rollback in most DBs. DROP: removes table entirely including structure.", tags: "SQL,DDL,DML" },

    // ── Behavioral ────────────────────────────────────────────────────────
    { category: "Behavioral", difficulty: "Medium", question: "Tell me about a time you had a conflict with a team member. How did you resolve it?", answer: "Use STAR: Situation, Task, Action, Result. Focus on listening, understanding their perspective, finding common ground. Show empathy and outcome orientation.", tags: "STAR,Teamwork,Conflict" },
    { category: "Behavioral", difficulty: "Medium", question: "Describe a time you had to learn a new technology quickly.", answer: "STAR: What was the tech, why urgent, how you approached learning (docs, tutorials, side projects), result delivered. Shows learning agility.", tags: "STAR,Learning,Adaptability" },
    { category: "Behavioral", difficulty: "Medium", question: "Give an example of when you had to make a decision with incomplete information.", answer: "STAR: what info was missing, how you gathered what was available, how you managed risk, what you decided, outcome. Shows ownership and pragmatism.", tags: "STAR,Decision Making" },
    { category: "Behavioral", difficulty: "Easy", question: "Why do you want to switch companies?", answer: "Focus on growth opportunity, new challenges, alignment with your goals. Avoid negativity about current employer.", tags: "General,Career" },
  ];

  // Only seed questions that don't already exist (check by question text for a known user)
  // For bank questions, we use a sentinel userId "BANK"
  const BANK_USER = "BANK";
  
  // Ensure BANK user exists
  await prisma.user.upsert({
    where: { id: BANK_USER },
    update: {},
    create: { id: BANK_USER, email: "bank@system.internal", name: "Question Bank" },
  });

  let created = 0;
  for (const q of questions) {
    const exists = await prisma.interviewQuestion.findFirst({ where: { userId: BANK_USER, question: q.question } });
    if (!exists) {
      await prisma.interviewQuestion.create({ data: { ...q, userId: BANK_USER, isFromBank: true, source: "Built-in Question Bank" } });
      created++;
    }
  }

  console.log(`✅ Interview questions seeded: ${created} new (${questions.length - created} already existed)`);
}

async function main() {
  try {
    await seedStudyPlans();
    await seedInterviewQuestions();
    console.log("✅ All seeds complete!");
  } catch (e) {
    console.error("❌ Seed error:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
