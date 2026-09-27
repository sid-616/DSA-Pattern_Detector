/**
 * DSA Anti-Pattern Interactive Quiz Question Bank
 * Helps developers train their eyes to spot subtle algorithmic traps in interview code.
 */

const DSA_QUIZ_DATA = [
  {
    id: 1,
    title: 'Spot the Bottleneck: Two Sum Lookup',
    code: `def two_sum(nums, target):
    for i in range(len(nums)):
        complement = target - nums[i]
        if complement in nums and nums.index(complement) != i:
            return [i, nums.index(complement)]
    return []`,
    language: 'python',
    question: 'Why will this implementation fail or get Time Limit Exceeded (TLE) on large test inputs?',
    options: [
      { text: 'It fails because Python lists cannot store negative numbers.', isCorrect: false },
      { text: '`complement in nums` and `nums.index()` perform linear O(N) scans inside the loop, making overall time O(N^2).', isCorrect: true },
      { text: 'It causes a stack overflow error due to infinite recursion.', isCorrect: false },
      { text: 'The indices returned are 1-based instead of 0-based.', isCorrect: false }
    ],
    explanation: 'In Python, checking `x in list` scans the list element-by-element from index 0 ($O(N)$). Inside a loop running $N$ times, this degrades performance to $O(N^2)$. Replacing the list with a Hash Map (`seen = {}`) gives $O(1)$ lookups and $O(N)$ total time.',
    relatedPatternId: 'nested-linear-search'
  },
  {
    id: 2,
    title: 'The Silent Shift: BFS Queue Implementation',
    code: `function levelOrder(root) {
    if (!root) return [];
    const queue = [root];
    const levels = [];
    
    while (queue.length > 0) {
        const curr = queue.shift();
        levels.push(curr.val);
        if (curr.left) queue.push(curr.left);
        if (curr.right) queue.push(curr.right);
    }
    return levels;
}`,
    language: 'javascript',
    question: 'What is the subtle performance pitfall in this BFS traversal for a tree with 100,000 nodes?',
    options: [
      { text: 'JavaScript arrays cannot hold object references.', isCorrect: false },
      { text: '`queue.shift()` takes O(N) time to shift all remaining elements in memory, leading to O(N^2) total execution time.', isCorrect: true },
      { text: 'The BFS traverses children in right-to-left order instead of left-to-right.', isCorrect: false },
      { text: 'Memory leak because `levels.push()` does not garbage collect visited nodes.', isCorrect: false }
    ],
    explanation: 'In JavaScript (and Python `list.pop(0)`), standard arrays are backed by contiguous memory buffers. Removing the front element via `.shift()` moves all remaining elements left by one. Over $N$ nodes, total time is $O(N^2)$. Tracking an index pointer (`let head = 0`) or using a true Doubly-Linked Queue runs in $O(N)$.',
    relatedPatternId: 'inefficient-queue-simulation'
  },
  {
    id: 3,
    title: 'The Infinite Cycle: Graph Shortest Path',
    code: `def shortest_path(graph, start, target):
    queue = deque([(start, 0)])
    
    while queue:
        node, dist = queue.popleft()
        if node == target:
            return dist
            
        for neighbor in graph[node]:
            queue.append((neighbor, dist + 1))
            
    return -1`,
    language: 'python',
    question: 'What catastrophic bug occurs when this function is executed on an undirected or cyclic graph?',
    options: [
      { text: 'It will return -1 even if target is reachable.', isCorrect: false },
      { text: 'It crashes with a division by zero error.', isCorrect: false },
      { text: 'Without a `visited` set, the BFS will oscillate infinitely between adjacent nodes until Memory Limit Exceeded (MLE).', isCorrect: true },
      { text: 'Deque does not support tuples.', isCorrect: false }
    ],
    explanation: 'In an undirected graph or any graph with cycles, node A points to B and B points to A. Without checking `if neighbor not in visited`, the queue continuously re-adds previously visited nodes, creating an infinite loop and blowing out RAM.',
    relatedPatternId: 'bfs-missing-visited'
  },
  {
    id: 4,
    title: 'Off-By-One & Midpoint: Binary Search Trap',
    code: `int search(int[] nums, int target) {
    int low = 0, high = nums.length - 1;
    while (low < high) {
        int mid = (low + high) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid;
        else high = mid - 1;
    }
    return -1;
}`,
    language: 'java',
    question: 'What happens when `target` is greater than `nums[0]` in an array of two elements `[2, 5]` with target `5`?',
    options: [
      { text: 'It immediately returns index 1 correctly.', isCorrect: false },
      { text: 'It enters an infinite loop because `mid` evaluates to 0, leaving `low = mid = 0` unchanged forever.', isCorrect: true },
      { text: 'ArrayOutOfBoundsException is thrown at index 2.', isCorrect: false },
      { text: 'It returns -1 immediately.', isCorrect: false }
    ],
    explanation: 'When `low = 0` and `high = 1`, `mid = (0 + 1) / 2 = 0`. Since `nums[0] < 5`, `low` is updated to `mid` (which is 0). `low` remains 0, `high` remains 1, and the while loop repeats forever! Safe pattern: `while (low <= high)` with `low = mid + 1` and `mid = low + (high - low) / 2`.',
    relatedPatternId: 'binary-search-bugs'
  },
  {
    id: 5,
    title: 'The Greedy Illusion: Coin Change Problem',
    code: `def min_coins(coins, amount):
    # Sort coins descending: e.g. [4, 3, 1]
    coins.sort(reverse=True)
    count = 0
    for c in coins:
        count += amount // c
        amount %= c
    return count if amount == 0 else -1`,
    language: 'python',
    question: 'Given coins `[4, 3, 1]` and target amount `6`, what does this greedy code return vs the true minimum?',
    options: [
      { text: 'It returns 3 coins (4 + 1 + 1), but the optimal answer is 2 coins (3 + 3).', isCorrect: true },
      { text: 'It returns -1 because it cannot make 6.', isCorrect: false },
      { text: 'It returns 2 coins correctly.', isCorrect: false },
      { text: 'It crashes with a ZeroDivisionError.', isCorrect: false }
    ],
    explanation: 'The Greedy Choice Property fails for arbitrary coin systems. Choosing the locally largest coin (4) leaves 2, which requires two 1s (total 3 coins). But 3 + 3 uses only 2 coins! Coin Change must be solved using Dynamic Programming ($O(amount \\times N)$).',
    relatedPatternId: 'greedy-fallacy-dp'
  },
  {
    id: 6,
    title: 'String Allocation in Loops',
    code: `public String repeatWord(String word, int n) {
    String result = "";
    for (int i = 0; i < n; i++) {
        result += word;
    }
    return result;
}`,
    language: 'java',
    question: 'What is the time complexity of this string repetition method in Java?',
    options: [
      { text: 'O(N) time and O(1) space.', isCorrect: false },
      { text: 'O(N * len(word)^2) time due to repeated immutability copies.', isCorrect: false },
      { text: 'O(N^2 * len(word)) time because each `+=` creates a new String and copies all previous characters.', isCorrect: true },
      { text: 'O(log N) time with JVM string pool optimizations.', isCorrect: false }
    ],
    explanation: 'Strings in Java (and Python/JS) are immutable. On each iteration $i$, `result += word` allocates a new character array of size $i \\times \\text{len}$ and copies all existing characters. The sum of copies $1 + 2 + \\dots + N$ is $O(N^2 \\times \\text{length})$. Using `StringBuilder` achieves true $O(N \\times \\text{length})$.',
    relatedPatternId: 'string-concat-in-loop'
  },
  {
    id: 7,
    title: 'The Ghost Mutation: Modifying While Iterating',
    code: `def remove_all(nums, val):
    for x in nums:
        if x == val:
            nums.remove(x)
    return nums

# Test: remove_all([3, 2, 2, 3], 2)`,
    language: 'python',
    question: 'What is the actual output of `remove_all([3, 2, 2, 3], 2)`?',
    options: [
      { text: '`[3, 3]` — both 2s are removed correctly.', isCorrect: false },
      { text: '`[3, 2, 3]` — the second 2 is skipped because removing the first 2 shifts subsequent elements left!', isCorrect: true },
      { text: '`[]` — all elements are deleted.', isCorrect: false },
      { text: 'Raises IndexError: list index out of range.', isCorrect: false }
    ],
    explanation: 'When index 1 (`2`) is removed, the second `2` shifts from index 2 to index 1. The iterator then advances to index 2 (now containing `3`), skipping the second `2` entirely! Always use a two-pointer filter or list comprehension `[x for x in nums if x != val]`.',
    relatedPatternId: 'mutate-while-iterating'
  },
  {
    id: 8,
    title: 'Two Pointers on Unsorted Array',
    code: `def has_pair_with_sum(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return True
        elif s < target:
            left += 1
        else:
            right -= 1
    return False`,
    language: 'python',
    question: 'Why does this algorithm fail on `nums = [10, 1, 8, 4]` with `target = 9` (where 1 + 8 = 9)?',
    options: [
      { text: 'Because opposite-end two-pointers strictly requires the array to be sorted to guarantee monotonic sums.', isCorrect: true },
      { text: 'Because while left < right stops too early.', isCorrect: false },
      { text: 'Because 10 + 4 is greater than 9.', isCorrect: false },
      { text: 'Python variables cannot be swapped with two pointers.', isCorrect: false }
    ],
    explanation: 'Initially `left=0 (10)` and `right=3 (4)`. Sum is $14 > 9$, so `right` decrements to 2 (8). Next `10 + 8 = 18 > 9`, so `right` decrements to 1 (1). Next `10 + 1 = 11 > 9`, `right` decrements to 0. The loop terminates having never checked $1 + 8$! Two pointers requires sorted data.',
    relatedPatternId: 'two-pointers-unsorted'
  }
];
