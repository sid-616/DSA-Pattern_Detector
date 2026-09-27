/**
 * AlgoGuard - DSA Wrong Pattern Detector Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Analyzer with database
  const analyzer = new DSAAnalyzer(DSA_PATTERNS_DB);

  // State
  let currentLanguage = 'python';
  let activeTab = 'scanner';
  let quizIndex = 0;
  let quizScore = 0;
  let selectedOptionIdx = null;

  // DOM Elements
  const codeInput = document.getElementById('code-input');
  const lineNumbers = document.getElementById('line-numbers');
  const langSelect = document.getElementById('lang-select');
  const presetSelect = document.getElementById('preset-select');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnClear = document.getElementById('btn-clear');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnShareLink = document.getElementById('btn-share-link');
  const btnExport = document.getElementById('btn-export');
  const themeToggle = document.getElementById('theme-toggle');

  // Stats
  const statLines = document.getElementById('stat-lines');
  const statChars = document.getElementById('stat-chars');

  // Results elements
  const scoreNumber = document.getElementById('score-number');
  const scoreCircle = document.getElementById('score-circle');
  const scoreTitle = document.getElementById('score-title');
  const scoreDesc = document.getElementById('score-desc');
  const flawsContainer = document.getElementById('flaws-container');
  const passedList = document.getElementById('passed-list');
  const detectedComplexity = document.getElementById('detected-complexity');
  const optimalComplexity = document.getElementById('optimal-complexity');

  // Catalog elements
  const catalogSearch = document.getElementById('catalog-search');
  const categoryPills = document.querySelectorAll('.pill-btn');
  const catalogGrid = document.getElementById('catalog-grid');

  // Modal elements
  const modalOverlay = document.getElementById('diff-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBadCode = document.getElementById('modal-bad-code');
  const modalGoodCode = document.getElementById('modal-good-code');
  const modalClose = document.getElementById('modal-close');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Code Presets
  const PRESETS = {
    'two-sum-lookup': {
      lang: 'python',
      name: 'Two Sum (Quadratic Linear Scan in Loop)',
      code: `def two_sum(nums, target):
    # Hidden O(N^2) trap: 'in' scans the entire array on every iteration
    for i in range(len(nums)):
        diff = target - nums[i]
        if diff in nums and nums.index(diff) != i:
            return [i, nums.index(diff)]
    return []`
    },
    'fibonacci-recursion': {
      lang: 'python',
      name: 'Fibonacci (Exponential Naive Recursion)',
      code: `def fibonacci(n):
    # Recalculates overlapping subproblems -> O(2^N) time explosion
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`
    },
    'queue-pop0': {
      lang: 'python',
      name: 'Queue Simulation (List pop(0) Shift)',
      code: `def process_queue(tasks):
    # pop(0) forces O(N) memory shift per element -> Total O(N^2)
    queue = list(tasks)
    processed = []
    while queue:
        task = queue.pop(0)
        processed.append(task * 2)
    return processed`
    },
    'bfs-no-visited': {
      lang: 'python',
      name: 'Graph BFS (Missing Visited Set - Cycle Trap)',
      code: `def traverse_network(graph, start, target):
    # BUG: No visited set causes infinite loop on cyclic graphs!
    queue = [start]
    while queue:
        node = queue.pop(0)
        if node == target:
            return True
        for neighbor in graph[node]:
            queue.append(neighbor)
    return False`
    },
    'binary-search-bug': {
      lang: 'java',
      name: 'Binary Search (Midpoint Overflow & Infinite Loop)',
      code: `public int binarySearch(int[] nums, int target) {
    int low = 0, high = nums.length - 1;
    while (low < high) {
        // BUG 1: Integer overflow when low + high > 2^31 - 1
        int mid = (low + high) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) {
            low = mid; // BUG 2: Infinite loop when high = low + 1
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`
    },
    'subarray-brute': {
      lang: 'python',
      name: 'Subarray Sum Equals K (O(N^2) Brute Force)',
      code: `def subarray_sum(nums, k):
    count = 0
    # O(N^2) nested loop checking all subarray pairs
    for i in range(len(nums)):
        current_sum = 0
        for j in range(i, len(nums)):
            current_sum += nums[j]
            if current_sum == k:
                count += 1
    return count`
    },
    'string-concat-loop': {
      lang: 'python',
      name: 'String Concatenation in Loop (O(N^2) Copies)',
      code: `def format_tags(tags):
    result = ""
    # Reallocates and copies entire string on each iteration
    for t in tags:
        result += "#" + t + " "
    return result.strip()`
    },
    'coin-change-greedy': {
      lang: 'python',
      name: 'Coin Change (Greedy Fallacy Fails on [1, 3, 4])',
      code: `def coin_change(coins, amount):
    # WRONG: Greedy choice property fails for arbitrary denominations!
    coins.sort(reverse=True)
    count = 0
    for coin in coins:
        if amount == 0: break
        count += amount // coin
        amount %= coin
    return count if amount == 0 else -1`
    },
    'mutate-iterating': {
      lang: 'python',
      name: 'Modifying List While Iterating (Skipped Elements)',
      code: `def remove_target(nums, target):
    # BUG: Removing elements causes next item to shift into current index
    for x in nums:
        if x == target:
            nums.remove(x)
    return nums`
    },
    'two-pointers-unsorted': {
      lang: 'python',
      name: 'Two Pointers on Unsorted Array',
      code: `def two_sum_flawed(nums, target):
    # BUG: Two pointers requires sorted input to guarantee monotonic convergence!
    left = 0
    right = len(nums) - 1
    while left < right:
        curr = nums[left] + nums[right]
        if curr == target:
            return [left, right]
        elif curr < target:
            left += 1
        else:
            right -= 1
    return []`
    }
  };

  // Toast Helper
  function showToast(message, icon = '✓') {
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Update line numbers & stats
  function updateLineNumbers() {
    const text = codeInput.value;
    const lines = text.split('\n');
    const count = lines.length;
    let numbers = '';
    for (let i = 1; i <= count; i++) {
      numbers += i + '\n';
    }
    lineNumbers.textContent = numbers;
    statLines.textContent = `${count} lines`;
    statChars.textContent = `${text.length} chars`;
  }

  // Handle Tab indentation in textarea
  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = codeInput.selectionStart;
      const end = codeInput.selectionEnd;
      codeInput.value = codeInput.value.substring(0, start) + '    ' + codeInput.value.substring(end);
      codeInput.selectionStart = codeInput.selectionEnd = start + 4;
      updateLineNumbers();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runAnalysis();
    }
  });

  codeInput.addEventListener('input', updateLineNumbers);
  codeInput.addEventListener('scroll', () => {
    lineNumbers.scrollTop = codeInput.scrollTop;
  });

  // Language & Preset Selection
  langSelect.addEventListener('change', () => {
    currentLanguage = langSelect.value;
  });

  // Quick Preset Pills on Front Page
  const quickPills = document.querySelectorAll('.preset-pill');
  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      quickPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const presetKey = pill.getAttribute('data-preset');
      if (presetKey && PRESETS[presetKey]) {
        presetSelect.value = presetKey;
        presetSelect.dispatchEvent(new Event('change'));
      }
    });
  });

  presetSelect.addEventListener('change', () => {
    const presetKey = presetSelect.value;
    if (presetKey && PRESETS[presetKey]) {
      const p = PRESETS[presetKey];
      codeInput.value = p.code;
      currentLanguage = p.lang;
      langSelect.value = p.lang;

      // Sync active state on quick pills
      quickPills.forEach(pill => {
        if (pill.getAttribute('data-preset') === presetKey) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });

      updateLineNumbers();
      runAnalysis();
      showToast(`Loaded preset: ${p.name}`);
    }
  });

  // Run Analysis
  function runAnalysis() {
    const code = codeInput.value;
    const results = analyzer.analyze(code, currentLanguage);

    // Update Score Circle & Labels
    scoreNumber.textContent = results.score;
    scoreCircle.className = 'score-circle';

    if (results.score >= 80) {
      scoreCircle.classList.add('clean');
      scoreTitle.textContent = 'Excellent Pattern Hygiene';
    } else if (results.score >= 50) {
      scoreCircle.classList.add('warning');
      scoreTitle.textContent = 'Moderate Performance Bottlenecks';
    } else {
      scoreCircle.classList.add('danger');
      scoreTitle.textContent = 'Critical DSA Flaws Detected';
    }

    scoreDesc.textContent = results.summary;

    // Render Flaws
    flawsContainer.innerHTML = '';
    if (results.flaws.length === 0) {
      flawsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--success); background: var(--success-bg); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.3);">
          <svg style="width: 36px; height: 36px; margin-bottom: 0.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <div style="font-weight: 700; font-size: 1.05rem;">No Algorithmic Anti-Patterns Found!</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Code passed linear search, recursion caching, visited set, and queue complexity checks.</div>
        </div>
      `;
      detectedComplexity.textContent = 'O(N) or Optimal';
      optimalComplexity.textContent = 'O(N) or Optimal';
    } else {
      // Pick first flaw's complexities for comparison
      const firstFlaw = results.flaws[0];
      detectedComplexity.textContent = firstFlaw.detectedComplexity.time;
      optimalComplexity.textContent = firstFlaw.optimalComplexity.time;

      results.flaws.forEach((flaw, idx) => {
        const card = document.createElement('div');
        card.className = `flaw-card severity-${flaw.severity}`;
        card.innerHTML = `
          <div class="flaw-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'flex' : 'none'">
            <div class="flaw-title-area">
              <span class="badge-severity badge-${flaw.severity}">${flaw.severity}</span>
              <span class="flaw-title">${escapeHtml(flaw.name)}</span>
              <span class="flaw-line-badge">Line ${flaw.lineNumbers.join(', ')}</span>
            </div>
            <svg style="width: 16px; height: 16px; color: var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="flaw-body">
            <div class="flaw-snippet-box">
              <code>${escapeHtml(flaw.codeSnippet)}</code>
            </div>
            <div class="flaw-explanation">
              <strong>Impact:</strong> ${escapeHtml(flaw.customNote || flaw.description)}
            </div>
            <div class="flaw-explanation" style="color: var(--text-muted); font-size: 0.82rem;">
              <strong>Why it fails:</strong> ${escapeHtml(flaw.whyItFails)}
            </div>
            <div class="flaw-fix-box">
              <div class="flaw-fix-title">
                <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Optimal Solution Pattern (${escapeHtml(flaw.optimalComplexity.time)}):
              </div>
              <div class="flaw-fix-code">${escapeHtml(flaw.goodExample)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">Common in: <em>${escapeHtml(flaw.interviewRelevance)}</em></span>
              <button class="btn-secondary" onclick="openDiffModal('${flaw.id}')" style="padding: 3px 8px; font-size: 0.75rem;">
                View Side-by-Side Diff
              </button>
            </div>
          </div>
        `;
        flawsContainer.appendChild(card);
      });
    }

    // Render Passed Checks
    passedList.innerHTML = '';
    results.cleanChecks.forEach(check => {
      const li = document.createElement('li');
      li.className = 'passed-tag';
      li.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        ${escapeHtml(check.name)}
      `;
      passedList.appendChild(li);
    });
  }

  // Button actions
  btnAnalyze.addEventListener('click', runAnalysis);

  btnClear.addEventListener('click', () => {
    codeInput.value = '';
    updateLineNumbers();
    runAnalysis();
    showToast('Code cleared');
  });

  btnCopyCode.addEventListener('click', () => {
    if (!codeInput.value.trim()) return;
    navigator.clipboard.writeText(codeInput.value).then(() => {
      showToast('Code copied to clipboard!');
    });
  });

  // Share Link Handler: generates link with URL query param or opens current URL
  btnShareLink.addEventListener('click', () => {
    const fullUrl = window.location.href.split('?')[0];
    const shareableUrl = `${fullUrl}?lang=${encodeURIComponent(currentLanguage)}&preset=${encodeURIComponent(presetSelect.value)}`;
    navigator.clipboard.writeText(shareableUrl).then(() => {
      showToast('Website link copied to clipboard!');
    }).catch(() => {
      showToast(`Link: ${fullUrl}`);
    });
  });

  // Export Audit Report
  btnExport.addEventListener('click', () => {
    const code = codeInput.value;
    const results = analyzer.analyze(code, currentLanguage);
    let md = `# DSA Pattern Analysis Report\n`;
    md += `Generated by AlgoGuard on ${new Date().toLocaleString()}\n\n`;
    md += `### Health Score: ${results.score}/100\n`;
    md += `**Summary:** ${results.summary}\n\n`;
    md += `### Detected Bottlenecks (${results.flaws.length})\n`;

    results.flaws.forEach((f, idx) => {
      md += `#### ${idx + 1}. ${f.name} [Severity: ${f.severity.toUpperCase()}]\n`;
      md += `- **Lines flagged:** ${f.lineNumbers.join(', ')}\n`;
      md += `- **Detected Complexity:** ${f.detectedComplexity.time} time | ${f.detectedComplexity.space} space\n`;
      md += `- **Optimal Complexity:** ${f.optimalComplexity.time} time | ${f.optimalComplexity.space} space\n`;
      md += `- **Why It Fails:** ${f.whyItFails}\n`;
      md += `- **Recommended Practice:** ${f.bestPractice}\n\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      showToast('Markdown audit report copied to clipboard!');
    });
  });

  // Modal Diff Viewer
  window.openDiffModal = function(patternId) {
    const pattern = DSA_PATTERNS_DB.find(p => p.id === patternId);
    if (!pattern) return;

    modalTitle.textContent = `${pattern.name} — Diff Comparison`;
    modalBadCode.textContent = pattern.badCode[currentLanguage] || pattern.badCode.python;
    modalGoodCode.textContent = pattern.goodCode[currentLanguage] || pattern.goodCode.python;
    modalOverlay.classList.add('active');
  };

  modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  // Theme Toggler
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('dsa_theme', nextTheme);
    showToast(`Switched to ${nextTheme} theme`);
  });

  // Restore saved theme (defaults to bright white & green 'light')
  const savedTheme = localStorage.getItem('dsa_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Navigation Tabs Switching
  const navTabs = document.querySelectorAll('.tab-btn');
  const viewSections = document.querySelectorAll('.view-section');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-tab');
      navTabs.forEach(t => t.classList.remove('active'));
      viewSections.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const activeSection = document.getElementById(`view-${targetView}`);
      if (activeSection) {
        activeSection.classList.add('active');
      }

      if (targetView === 'catalog') {
        renderCatalog();
      } else if (targetView === 'quiz') {
        renderQuiz();
      }
    });
  });

  // --- Anti-Pattern Catalog Logic ---
  let selectedCategory = 'all';

  function renderCatalog() {
    const searchFilter = catalogSearch.value.toLowerCase().trim();
    catalogGrid.innerHTML = '';

    const filtered = DSA_PATTERNS_DB.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = !searchFilter || 
        p.name.toLowerCase().includes(searchFilter) ||
        p.description.toLowerCase().includes(searchFilter) ||
        p.interviewRelevance.toLowerCase().includes(searchFilter);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      catalogGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">No patterns match your search filter.</div>`;
      return;
    }

    filtered.forEach(pattern => {
      const card = document.createElement('div');
      card.className = 'catalog-card';
      card.innerHTML = `
        <div>
          <div class="card-top">
            <span class="card-category">${escapeHtml(pattern.category)}</span>
            <span class="badge-severity badge-${pattern.severity}">${pattern.severity}</span>
          </div>
          <h3>${escapeHtml(pattern.name)}</h3>
          <p style="margin-top: 0.5rem;">${escapeHtml(pattern.description)}</p>
        </div>

        <div class="card-complexity-strip">
          <div class="complexity-pill bad">
            <span>Flawed Time</span>
            <span>${escapeHtml(pattern.detectedComplexity.time)}</span>
          </div>
          <div class="complexity-pill good">
            <span>Optimal Time</span>
            <span>${escapeHtml(pattern.optimalComplexity.time)}</span>
          </div>
        </div>

        <div class="card-footer">
          <span class="relevance-tag">Target: <strong>${escapeHtml(pattern.interviewRelevance.split(',')[0])}</strong></span>
          <button class="btn-secondary" onclick="loadPatternToEditor('${pattern.id}')" style="padding: 4px 10px; font-size: 0.8rem;">
            Test in Scanner →
          </button>
        </div>
      `;
      catalogGrid.appendChild(card);
    });
  }

  catalogSearch.addEventListener('input', renderCatalog);

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedCategory = pill.getAttribute('data-cat');
      renderCatalog();
    });
  });

  window.loadPatternToEditor = function(patternId) {
    const pattern = DSA_PATTERNS_DB.find(p => p.id === patternId);
    if (!pattern) return;

    codeInput.value = pattern.badCode[currentLanguage] || pattern.badCode.python;
    updateLineNumbers();

    // Switch to scanner tab
    document.querySelector('[data-tab="scanner"]').click();
    runAnalysis();
    showToast(`Loaded "${pattern.name}" into scanner`);
  };

  // --- Quiz Engine Logic ---
  const quizTitle = document.getElementById('quiz-title');
  const quizProgress = document.getElementById('quiz-progress');
  const quizProgressFill = document.getElementById('quiz-progress-fill');
  const quizScoreDisplay = document.getElementById('quiz-score');
  const quizCode = document.getElementById('quiz-code');
  const quizOptionsList = document.getElementById('quiz-options-list');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizFeedbackTitle = document.getElementById('quiz-feedback-title');
  const quizFeedbackText = document.getElementById('quiz-feedback-text');
  const quizBtnNext = document.getElementById('quiz-btn-next');

  function renderQuiz() {
    const item = DSA_QUIZ_DATA[quizIndex];
    if (!item) {
      renderQuizFinished();
      return;
    }

    selectedOptionIdx = null;
    quizTitle.textContent = item.title;
    quizProgress.textContent = `Question ${quizIndex + 1} of ${DSA_QUIZ_DATA.length}`;
    quizProgressFill.style.width = `${((quizIndex + 1) / DSA_QUIZ_DATA.length) * 100}%`;
    quizScoreDisplay.textContent = `Score: ${quizScore}/${quizIndex}`;
    quizCode.textContent = item.code;
    quizFeedback.classList.remove('show');
    quizBtnNext.style.display = 'none';

    quizOptionsList.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    item.options.forEach((opt, idx) => {
      const optDiv = document.createElement('div');
      optDiv.className = 'quiz-option';
      optDiv.innerHTML = `
        <span class="option-marker">${letters[idx]}</span>
        <span>${escapeHtml(opt.text)}</span>
      `;
      optDiv.addEventListener('click', () => handleOptionSelect(idx, optDiv));
      quizOptionsList.appendChild(optDiv);
    });
  }

  function handleOptionSelect(idx, optDiv) {
    if (selectedOptionIdx !== null) return; // Already answered
    selectedOptionIdx = idx;

    const item = DSA_QUIZ_DATA[quizIndex];
    const isCorrect = item.options[idx].isCorrect;
    const allOptions = quizOptionsList.querySelectorAll('.quiz-option');

    allOptions.forEach((el, i) => {
      el.classList.add('disabled');
      if (item.options[i].isCorrect) {
        el.classList.add('correct');
      } else if (i === idx) {
        el.classList.add('wrong');
      }
    });

    if (isCorrect) {
      quizScore++;
      quizFeedbackTitle.innerHTML = `<span style="color: var(--success);">✓ Excellent Analysis!</span>`;
    } else {
      quizFeedbackTitle.innerHTML = `<span style="color: var(--danger);">✗ Algorithmic Trap Triggered!</span>`;
    }

    quizFeedbackText.textContent = item.explanation;
    quizFeedback.classList.add('show');
    quizScoreDisplay.textContent = `Score: ${quizScore}/${quizIndex + 1}`;
    quizBtnNext.style.display = 'inline-flex';
  }

  quizBtnNext.addEventListener('click', () => {
    quizIndex++;
    renderQuiz();
  });

  function renderQuizFinished() {
    quizProgressFill.style.width = '100%';
    quizTitle.textContent = 'Quiz Completed!';
    quizCode.style.display = 'none';
    quizFeedback.classList.remove('show');
    quizBtnNext.style.display = 'none';

    const pct = Math.round((quizScore / DSA_QUIZ_DATA.length) * 100);
    let message = '';
    if (pct >= 80) message = 'Master Class! You spot subtle algorithmic traps with surgical precision.';
    else if (pct >= 50) message = 'Solid understanding, but watch out for hidden O(N) operations in standard library methods.';
    else message = 'Great practice! Review the Anti-Pattern Catalog to master complexity invariants.';

    quizOptionsList.innerHTML = `
      <div style="text-align: center; padding: 2rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">${pct}%</div>
        <div style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">You scored ${quizScore} out of ${DSA_QUIZ_DATA.length}</div>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.5rem;">${message}</p>
        <button class="btn-primary" onclick="restartQuiz()">
          Restart Challenge
        </button>
      </div>
    `;
  }

  window.restartQuiz = function() {
    quizIndex = 0;
    quizScore = 0;
    quizCode.style.display = 'block';
    renderQuiz();
  };

  // Utility to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Load initial preset
  presetSelect.value = 'two-sum-lookup';
  presetSelect.dispatchEvent(new Event('change'));
});
