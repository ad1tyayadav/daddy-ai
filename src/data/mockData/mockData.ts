export const mockQuestion = [
  {
    type: "technical",
    difficulty: "Medium",
    question: "Can you walk me through how you would optimize a slow database query in a production environment?",
    modelAnswer: "In my previous role at TechCorp, I optimized a slow product search query that was taking 2+ seconds. First, I used EXPLAIN ANALYZE to identify a full table scan. I added appropriate indexes on the frequently searched columns like product_name and category. Then I refactored the query to eliminate unnecessary joins and applied pagination. This reduced the query time to under 200ms and decreased database CPU usage by 40% during peak hours.",
    tips: [
      "Focus on your systematic approach to debugging performance issues",
      "Mention specific tools you've used (EXPLAIN, monitoring tools)",
      "Quantify the impact of your optimization"
    ],
    followUps: [
      "How would you handle a situation where adding indexes isn't enough?",
      "What monitoring tools have you used to identify performance bottlenecks?"
    ],
    preparationResources: [
      "Database indexing strategies",
      "Query optimization techniques in [specific DB technology]",
      "Performance monitoring tools like New Relic or Datadog"
    ],
    redFlags: [
      "Vague answers without specific examples",
      "Not considering trade-offs of indexing (write performance impact)",
      "Not mentioning monitoring or measurement of results"
    ]
  },
  {
    type: "behavioral",
    difficulty: "Medium",
    question: "Describe a time you had to work with a difficult team member on a critical project.",
    modelAnswer: "On the X project, I worked with a senior developer who was resistant to adopting our new CI/CD pipeline. I scheduled a one-on-one to understand his concerns, which were mainly about stability. I proposed a phased rollout where we'd run the old and new systems in parallel for two weeks. I also created detailed documentation and offered pair programming sessions. Eventually, he became one of our biggest advocates for the new system after seeing a 60% reduction in deployment failures.",
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Show empathy and understanding of different perspectives",
      "Highlight how you turned a challenging situation into a positive outcome"
    ],
    followUps: [
      "What would you do if your approach hadn't worked?",
      "How did you measure the success of your solution?"
    ],
    preparationResources: [
      "STAR method for behavioral questions",
      "Conflict resolution techniques",
      "Influencing without authority"
    ],
    redFlags: [
      "Blaming the other person entirely",
      "Not showing what you learned from the experience",
      "Vague descriptions without specific actions taken"
    ]
  }
];


export const mockFeedback = {
  score: 7,
  tldr: "Solid technical background but lacks quantifiable achievements and specific keywords from the job description.",
  suggestions: [
    "Add metrics to quantify achievements (e.g., 'improved performance by 25%')",
    "Incorporate more keywords from the job description",
    "Highlight leadership experience more prominently",
    "Add a projects section to showcase specific work",
  ],
  keywords: [
    "cloud architecture",
    "Agile methodology",
    "CI/CD",
    "containerization",
  ],
  exampleBullets: [
    "Reduced API response time by 40% through optimization techniques",
    "Led a team of 5 developers to deliver a project 2 weeks ahead of schedule",
    "Implemented CI/CD pipeline that reduced deployment time by 60%",
  ],
};