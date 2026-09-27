/**
 * DSA Anti-Pattern Static Analyzer
 * Performs lexical, structural, and heuristic AST-like pattern detection
 * on algorithmic code in Python, JavaScript, Java, and C++.
 */

class DSAAnalyzer {
  constructor(patternsDb) {
    this.patternsDb = patternsDb || [];
  }

  /**
   * Analyze source code for common DSA anti-patterns
   * @param {string} code 
   * @param {string} language ('python' | 'javascript' | 'java' | 'cpp')
   * @returns {object} Analysis result
   */
  analyze(code, language = 'python') {
    if (!code || !code.trim()) {
      return {
        score: 100,
        flaws: [],
        cleanChecks: [],
        summary: 'No code provided to analyze.'
      };
    }

    const lines = code.split('\n');
    const flaws = [];
    const cleanChecks = [];

    // Helper to add flaw
    const addFlaw = (patternId, lineNumbers, snippet, customNote = null) => {
      const pattern = this.patternsDb.find(p => p.id === patternId);
      if (!pattern) return;

      flaws.push({
        id: pattern.id,
        name: pattern.name,
        category: pattern.category,
        severity: pattern.severity,
        lineNumbers: lineNumbers,
        codeSnippet: snippet,
        detectedComplexity: pattern.detectedComplexity,
        optimalComplexity: pattern.optimalComplexity,
        description: pattern.description,
        whyItFails: pattern.whyItFails,
        bestPractice: pattern.bestPractice,
        customNote: customNote,
        interviewRelevance: pattern.interviewRelevance,
        goodExample: pattern.goodCode[language] || pattern.goodCode.python
      });
    };

    // 1. Check for Naive Recursion (Exponential O(2^N))
    this._checkNaiveRecursion(code, lines, language, addFlaw, cleanChecks);

    // 2. Check for Queue Inefficiency (pop(0) / shift() in loops)
    this._checkQueueSimulation(code, lines, language, addFlaw, cleanChecks);

    // 3. Check for Nested Linear Lookup / Membership inside loops
    this._checkNestedLinearSearch(code, lines, language, addFlaw, cleanChecks);

    // 4. Check for BFS Missing Visited Set
    this._checkBfsMissingVisited(code, lines, language, addFlaw, cleanChecks);

    // 5. Check for Repeated String Concatenation in Loops
    this._checkStringConcatInLoop(code, lines, language, addFlaw, cleanChecks);

    // 6. Check for Binary Search Midpoint Overflow & Infinite Loop
    this._checkBinarySearchFlaws(code, lines, language, addFlaw, cleanChecks);

    // 7. Check for Subarray Brute Force O(N^2) / O(N^3)
    this._checkSubarrayBruteForce(code, lines, language, addFlaw, cleanChecks);

    // 8. Check for Modifying Collection while Iterating
    this._checkMutateWhileIterating(code, lines, language, addFlaw, cleanChecks);

    // 9. Check for Repeated Sorting inside Loop
    this._checkSortInsideLoop(code, lines, language, addFlaw, cleanChecks);

    // 10. Check for Greedy Fallacy on Coin Change
    this._checkGreedyCoinChange(code, lines, language, addFlaw, cleanChecks);

    // 11. Check for Two Pointers on Unsorted Array
    this._checkTwoPointersUnsorted(code, lines, language, addFlaw, cleanChecks);

    // Calculate Health Score
    let penalty = 0;
    flaws.forEach(f => {
      if (f.severity === 'critical') penalty += 35;
      else if (f.severity === 'major') penalty += 20;
      else penalty += 10;
    });

    const score = Math.max(0, 100 - penalty);

    // Generate high-level summary
    let summary = '';
    if (flaws.length === 0) {
      summary = 'Optimal! No common DSA anti-patterns or asymptotic bottlenecks detected.';
    } else {
      const critCount = flaws.filter(f => f.severity === 'critical').length;
      const majCount = flaws.filter(f => f.severity === 'major').length;
      summary = `Identified ${flaws.length} issue(s): ${critCount} critical, ${majCount} major. High probability of Time Limit Exceeded (TLE) or Memory Limit Exceeded (MLE) in interview evaluations.`;
    }

    return {
      score,
      flaws,
      cleanChecks,
      summary,
      totalLines: lines.length
    };
  }

  // --- Rule Checkers ---

  _checkNaiveRecursion(code, lines, lang, addFlaw, cleanChecks) {
    // Detect function definition
    let funcName = null;
    let funcLineIdx = -1;
    let isMemoized = false;

    // Check for memoization annotations or containers
    if (/@(lru_cache|cache)/.test(code) || /memo\s*=\s*(\{\}|\[\]|new Map)/.test(code) || /unordered_map|HashMap|dp\[/.test(code)) {
      isMemoized = true;
    }

    lines.forEach((line, idx) => {
      let match = null;
      if (lang === 'python') {
        match = line.match(/^\s*def\s+([a-zA-Z_0-9]+)\s*\(/);
      } else {
        match = line.match(/(?:function|int|void|boolean|bool|long|double|auto)\s+([a-zA-Z_0-9]+)\s*\(/);
      }

      if (match && !funcName) {
        funcName = match[1];
        funcLineIdx = idx;
      }
    });

    if (funcName) {
      // Count recursive calls
      const callRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
      const matches = code.match(callRegex) || [];
      // 1 for definition, 2+ for recursive branching
      if (matches.length >= 3 && !isMemoized) {
        const offendingLines = [];
        lines.forEach((line, idx) => {
          if (idx !== funcLineIdx && callRegex.test(line)) {
            offendingLines.push(idx + 1);
          }
        });

        addFlaw('naive-recursion', offendingLines, lines[offendingLines[0] - 1]?.trim() || `${funcName}(...)`, 
          `Multiple recursive calls to '${funcName}' without caching or memoization detected. Recalculates overlapping subproblems exponentially.`);
        return;
      }
    }

    cleanChecks.push({ id: 'naive-recursion', name: 'Memoization & Recursion Safety' });
  }

  _checkQueueSimulation(code, lines, lang, addFlaw, cleanChecks) {
    const queuePopPatterns = [
      /\b([a-zA-Z0-9_]+)\.pop\s*\(\s*0\s*\)/, // Python / JS
      /\b([a-zA-Z0-9_]+)\.shift\s*\(\s*\)/,    // JS
      /\b([a-zA-Z0-9_]+)\.remove\s*\(\s*0\s*\)/, // Java
      /\b([a-zA-Z0-9_]+)\.erase\s*\(\s*\1\.begin\s*\(\s*\)\s*\)/ // C++
    ];

    let found = false;
    lines.forEach((line, idx) => {
      for (const pat of queuePopPatterns) {
        const match = line.match(pat);
        if (match) {
          // Check if inside a loop
          const hasLoop = /while|for\s*\(|for\s+[a-zA-Z0-9_]+\s+in/.test(code);
          if (hasLoop) {
            found = true;
            addFlaw('inefficient-queue-simulation', [idx + 1], line.trim(),
              `Array dequeue operation '${match[0]}' inside a loop incurs O(N) memory shift on each dequeue.`);
            break;
          }
        }
      }
    });

    if (!found) {
      cleanChecks.push({ id: 'inefficient-queue-simulation', name: 'Optimal O(1) Queue Operations' });
    }
  }

  _checkNestedLinearSearch(code, lines, lang, addFlaw, cleanChecks) {
    let found = false;
    let inLoop = false;
    let loopLine = -1;

    lines.forEach((line, idx) => {
      const isLoop = /^\s*(for|while)\b/.test(line);
      if (isLoop) {
        inLoop = true;
        loopLine = idx + 1;
      }

      // Check linear search within loop
      const linearPatterns = [
        /\b(?:if\s+)?([a-zA-Z0-9_]+)\s+in\s+([a-zA-Z0-9_]+)\b/, // Python `if x in nums:`
        /\.indexOf\s*\(/,                                        // JS / Java
        /\.includes\s*\(/,                                       // JS
        /\.contains\s*\(/,                                       // Java ArrayList
        /std::find\s*\(/                                         // C++
      ];

      for (const pat of linearPatterns) {
        const match = line.match(pat);
        if (match && inLoop) {
          // Avoid flagging dict/map lookup if easily identifiable
          if (line.includes('seen') || line.includes('map') || line.includes('set') || line.includes('visited')) {
            continue;
          }
          found = true;
          addFlaw('nested-linear-search', [idx + 1], line.trim(),
            `Linear search '${match[0]}' inside loop creates accidental O(N^2) quadratic time bottleneck.`);
          break;
        }
      }
    });

    if (!found) {
      cleanChecks.push({ id: 'nested-linear-search', name: 'Constant-Time Lookup Verification' });
    }
  }

  _checkBfsMissingVisited(code, lines, lang, addFlaw, cleanChecks) {
    const hasQueue = /queue|deque|ArrayDeque|\bq\b/i.test(code);
    const hasBfsLoop = /while\s*\(?\s*(?:queue|q)\b/i.test(code) || /while\s+queue\b/i.test(code);
    const hasNeighbors = /for\s+.*(?:neighbor|adj|graph|next|edges)/i.test(code);

    if (hasQueue && hasBfsLoop && hasNeighbors) {
      const hasVisited = /visited|seen|marked|is_visited/i.test(code);
      if (!hasVisited) {
        let loopLine = 1;
        lines.forEach((l, idx) => {
          if (/while.*(?:queue|q)/i.test(l)) loopLine = idx + 1;
        });

        addFlaw('bfs-missing-visited', [loopLine], lines[loopLine - 1]?.trim() || 'while queue:',
          'Graph traversal queue explores neighbors without checking or recording a `visited` set. Leads to infinite oscillation and Memory Limit Exceeded on cyclic graphs.');
        return;
      }
    }

    cleanChecks.push({ id: 'bfs-missing-visited', name: 'Cycle Prevention / Visited Set Check' });
  }

  _checkStringConcatInLoop(code, lines, lang, addFlaw, cleanChecks) {
    let found = false;
    let loopNesting = 0;

    lines.forEach((line, idx) => {
      if (/^\s*(for|while)\b/.test(line)) {
        loopNesting++;
      }

      // Check string concatenation: `s += ...` or `res = res + ...`
      const concatMatch = line.match(/([a-zA-Z0-9_]+)\s*\+=\s*([^;]+)/) ||
                          line.match(/([a-zA-Z0-9_]+)\s*=\s*\1\s*\+\s*([^;]+)/);

      if (concatMatch && loopNesting > 0) {
        const varName = concatMatch[1];
        // Heuristic: check if variable was declared or initialized as string `""` or `''`
        const initRegex = new RegExp(`(?:let|var|const|String|str)?\\s*${varName}\\s*=\\s*["']`);
        if (initRegex.test(code) || /str|res|sentence|ans|text|word/i.test(varName)) {
          // Exclude numeric accumulations like count += 1, sum += x
          if (!/count|sum|total|idx|len|ans_num|i\b|j\b|acc/i.test(varName) &&
              !/\d+$/.test(concatMatch[2].trim())) {
            found = true;
            addFlaw('string-concat-in-loop', [idx + 1], line.trim(),
              `Repeated string concatenation on '${varName}' re-allocates memory and copies all characters on every iteration -> O(N^2).`);
          }
        }
      }
    });

    if (!found) {
      cleanChecks.push({ id: 'string-concat-in-loop', name: 'Optimal String Memory Allocation' });
    }
  }

  _checkBinarySearchFlaws(code, lines, lang, addFlaw, cleanChecks) {
    let found = false;

    // Check 1: Midpoint overflow: (low + high) / 2
    const overflowPat = /(?:mid|m)\s*=\s*\(?\s*([a-zA-Z0-9_]+)\s*\+\s*([a-zA-Z0-9_]+)\s*\)?\s*(?:\/\/|\/)\s*2/;
    lines.forEach((line, idx) => {
      const m = line.match(overflowPat);
      if (m && (lang === 'java' || lang === 'cpp')) {
        found = true;
        addFlaw('binary-search-bugs', [idx + 1], line.trim(),
          `Integer overflow: '${line.trim()}' overflows 32-bit signed integer when low + high > 2^31 - 1. Use 'low + (high - low) / 2'.`);
      }
    });

    // Check 2: Infinite loop condition: while (low < high) with low = mid
    if (/while\s*\(?\s*([a-zA-Z0-9_]+)\s*<\s*([a-zA-Z0-9_]+)\s*\)?/.test(code)) {
      lines.forEach((line, idx) => {
        if (/^\s*(?:low|left|l)\s*=\s*(?:mid|m)\s*;?\s*$/.test(line)) {
          found = true;
          addFlaw('binary-search-bugs', [idx + 1], line.trim(),
            `Infinite loop trap: Assigning 'low = mid' with 'while (low < high)' will loop infinitely when high = low + 1 due to downward integer truncation.`);
        }
      });
    }

    if (!found) {
      cleanChecks.push({ id: 'binary-search-bugs', name: 'Binary Search Boundary & Overflow Safety' });
    }
  }

  _checkSubarrayBruteForce(code, lines, lang, addFlaw, cleanChecks) {
    // Detect nested loops over same array indices: for i in range(len(nums)): for j in range(i, len(nums)):
    let nestedLoopCount = 0;
    let loopLines = [];

    lines.forEach((line, idx) => {
      if (/for\s*\([^;]+;[^;]+;[^)]+\)|for\s+[a-zA-Z0-9_]+\s+in\s+range/.test(line)) {
        nestedLoopCount++;
        loopLines.push(idx + 1);
      }
    });

    if (nestedLoopCount >= 2 && /sum|subarray|target|count\s*\+=/i.test(code)) {
      if (!/prefix|HashMap|Map|defaultdict|sliding|seen/i.test(code)) {
        addFlaw('subarray-brute-force', loopLines.slice(0, 2), lines[loopLines[0] - 1]?.trim() || 'Nested subarray loop',
          'Nested loops calculating contiguous subarray properties brute force all O(N^2) pairs without Prefix Sum or Sliding Window.');
        return;
      }
    }

    cleanChecks.push({ id: 'subarray-brute-force', name: 'Subarray Prefix / Window Optimization' });
  }

  _checkMutateWhileIterating(code, lines, lang, addFlaw, cleanChecks) {
    let found = false;

    lines.forEach((line, idx) => {
      // Python: `for x in arr:` followed by `arr.remove(x)` or `del arr[...]`
      if (lang === 'python') {
        if (/\.remove\s*\(|del\s+[a-zA-Z0-9_]+\[/.test(line)) {
          found = true;
          addFlaw('mutate-while-iterating', [idx + 1], line.trim(),
            'Modifying a collection during iteration causes subsequent elements to shift left, skipping elements silently.');
        }
      } else if (lang === 'javascript') {
        if (/\.splice\s*\(/.test(line)) {
          found = true;
          addFlaw('mutate-while-iterating', [idx + 1], line.trim(),
            'Using `splice()` inside an index-incrementing loop skips the element directly following the deleted index.');
        }
      }
    });

    if (!found) {
      cleanChecks.push({ id: 'mutate-while-iterating', name: 'Iteration Integrity / Mutation Safety' });
    }
  }

  _checkSortInsideLoop(code, lines, lang, addFlaw, cleanChecks) {
    let insideLoop = false;
    let found = false;

    lines.forEach((line, idx) => {
      if (/^\s*(for|while)\b/.test(line)) {
        insideLoop = true;
      }
      if (insideLoop && (/\.sort\s*\(|Arrays\.sort|Collections\.sort|std::sort/.test(line))) {
        found = true;
        addFlaw('sort-inside-loop', [idx + 1], line.trim(),
          'Calling sort inside a loop re-sorts the entire array on every iteration -> O(N^2 log N). Use a Heap / PriorityQueue.');
      }
    });

    if (!found) {
      cleanChecks.push({ id: 'sort-inside-loop', name: 'PriorityQueue / Heap Invariant Maintenance' });
    }
  }

  _checkGreedyCoinChange(code, lines, lang, addFlaw, cleanChecks) {
    const isCoinProblem = /coin|amount|denominations/i.test(code);
    const usesGreedyDivision = /\/\/\s*coin|%\s*coin|amount\s*\/=\s*coin|amount\s*-\s*coin/i.test(code);
    const usesSortReverse = /sort.*reverse|rbegin|sort\(\s*\)\.reverse/i.test(code);

    if (isCoinProblem && (usesGreedyDivision || usesSortReverse) && !/dp\s*=|memo|Array\s*\(amount/i.test(code)) {
      let problemLine = 1;
      lines.forEach((l, idx) => {
        if (/amount\s*%|count\s*\+=/i.test(l)) problemLine = idx + 1;
      });

      addFlaw('greedy-fallacy-dp', [problemLine], lines[problemLine - 1]?.trim() || 'amount %= coin',
        'Greedy coin selection (largest first) fails for general coin systems without the canonical exchange property. Yields incorrect suboptimal solutions.');
      return;
    }

    cleanChecks.push({ id: 'greedy-fallacy-dp', name: 'Dynamic Programming vs Greedy Verifier' });
  }

  _checkTwoPointersUnsorted(code, lines, lang, addFlaw, cleanChecks) {
    const hasTwoPointers = /left\s*<\s*right|l\s*<\s*r/i.test(code);
    const pointerMove = /(?:left\s*\+\+|l\s*\+=|left\s*\+=)\s*.*(?:right\s*--|r\s*-=|right\s*-=)/s.test(code) ||
                        (/left\s*\+\+|l\s*\+=|left\s*\+=/.test(code) && /right\s*--|r\s*-=|right\s*-=/.test(code));

    if (hasTwoPointers && pointerMove) {
      const hasSort = /\.sort|sorted\(|Arrays\.sort|std::sort/i.test(code);
      const isExplicitlySorted = /is_sorted|sorted_arr|sorted/i.test(code);
      if (!hasSort && !isExplicitlySorted) {
        let lineIdx = 1;
        lines.forEach((l, idx) => {
          if (/while.*(?:left|l).*(?:right|r)/i.test(l)) lineIdx = idx + 1;
        });

        addFlaw('two-pointers-unsorted', [lineIdx], lines[lineIdx - 1]?.trim() || 'while left < right:',
          'Opposite-end two pointers requires monotonic (sorted) data. On unsorted inputs, moving pointers discards valid solutions unpredictably.');
        return;
      }
    }

    cleanChecks.push({ id: 'two-pointers-unsorted', name: 'Monotonicity & Two-Pointer Invariant' });
  }
}
