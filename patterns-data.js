/**
 * Comprehensive Database of DSA Anti-Patterns
 * Each pattern includes:
 * - id: unique identifier
 * - name: descriptive title
 * - category: algorithmic domain
 * - severity: 'critical' | 'major' | 'warning'
 * - detectedComplexity: Time / Space of flawed pattern
 * - optimalComplexity: Time / Space of corrected pattern
 * - description: Detailed explanation of the flaw
 * - whyItFails: Technical reason for performance or logical failure
 * - bestPractice: Recommended design pattern
 * - badCode: Code snippets exhibiting the pattern (by language)
 * - goodCode: Corrected optimal implementation (by language)
 * - interviewRelevance: Which LeetCode/interview problems this often traps
 */

const DSA_PATTERNS_DB = [
  {
    id: 'naive-recursion',
    name: 'Naive Recursion without Memoization',
    category: 'Dynamic Programming & Recursion',
    severity: 'critical',
    detectedComplexity: { time: 'O(2^N)', space: 'O(N) call stack' },
    optimalComplexity: { time: 'O(N)', space: 'O(N) or O(1)' },
    description: 'Solving overlapping subproblems with pure recursion recalculates identical subtrees repeatedly, causing an exponential time explosion.',
    whyItFails: 'In problems like Fibonacci, Climbing Stairs, or 0/1 Knapsack, the recursion tree branches 2 or more times per node. For N=40, pure recursion performs ~1.1 trillion operations and times out (TLE).',
    bestPractice: 'Use Top-Down Dynamic Programming with Memoization (Hash Map / Array cache or `@lru_cache`) or Bottom-Up Tabulation.',
    interviewRelevance: 'Fibonacci, Climbing Stairs, House Robber, Coin Change, Word Break, Target Sum',
    badCode: {
      python: `def fib(n):
    if n <= 1:
        return n
    # Recalculates fib(n-1) and fib(n-2) without memoization
    return fib(n - 1) + fib(n - 2)`,
      javascript: `function fib(n) {
    if (n <= 1) return n;
    // O(2^N) exponential calls
    return fib(n - 1) + fib(n - 2);
}`,
      java: `public int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2); // Exponential O(2^N)
}`,
      cpp: `int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2); // Exponential O(2^N)
}`
    },
    goodCode: {
      python: `from functools import lru_cache

# Top-Down with Memoization -> O(N) Time, O(N) Space
@lru_cache(maxsize=None)
def fib_memo(n):
    if n <= 1:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)

# Bottom-Up Iterative -> O(N) Time, O(1) Space
def fib_iter(n):
    if n <= 1: return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr`,
      javascript: `// Top-Down with Memo Map -> O(N) Time
function fibMemo(n, memo = {}) {
    if (n <= 1) return n;
    if (memo[n] !== undefined) return memo[n];
    return memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
}

// Bottom-Up Space-Optimized -> O(1) Space
function fibIter(n) {
    if (n <= 1) return n;
    let prev = 0, curr = 1;
    for (let i = 2; i <= n; i++) {
        [prev, curr] = [curr, prev + curr];
    }
    return curr;
}`,
      java: `// Bottom-Up Space-Optimized -> O(N) Time, O(1) Space
public int fib(int n) {
    if (n <= 1) return n;
    int prev = 0, curr = 1;
    for (int i = 2; i <= n; i++) {
        int next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}`,
      cpp: `// Bottom-Up Space-Optimized -> O(N) Time, O(1) Space
int fib(int n) {
    if (n <= 1) return n;
    int prev = 0, curr = 1;
    for (int i = 2; i <= n; i++) {
        int next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}`
    }
  },
  {
    id: 'nested-linear-search',
    name: 'Nested Linear Search / Membership Check',
    category: 'Arrays & Hashing',
    severity: 'critical',
    detectedComplexity: { time: 'O(N^2)', space: 'O(1)' },
    optimalComplexity: { time: 'O(N)', space: 'O(N)' },
    description: 'Calling `in list`, `list.indexOf()`, or `list.contains()` inside a loop performs a hidden nested loop, turning an O(N) pass into an accidental O(N^2) quadratic algorithm.',
    whyItFails: 'Array lookup requires scanning elements sequentially from index 0. Running an O(N) lookup across N iterations equals O(N * N) = O(N^2). For N=100,000, this takes hours instead of milliseconds.',
    bestPractice: 'Pre-index elements into a Hash Set or Hash Map to get average O(1) constant time lookups.',
    interviewRelevance: 'Two Sum, Contains Duplicate, Longest Consecutive Sequence, Intersection of Two Arrays',
    badCode: {
      python: `def two_sum(nums, target):
    for i in range(len(nums)):
        diff = target - nums[i]
        # Inefficient: 'diff in nums' scans the whole array -> O(N^2)
        if diff in nums and nums.index(diff) != i:
            return [i, nums.index(diff)]
    return []`,
      javascript: `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        // Inefficient: indexOf scans the entire array -> O(N^2)
        const idx = nums.indexOf(diff);
        if (idx !== -1 && idx !== i) {
            return [i, idx];
        }
    }
    return [];
}`,
      java: `public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) { // O(N^2) brute force
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j};
            }
        }
    }
    return new int[]{};
}`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    for (int i = 0; i < nums.size(); i++) {
        for (int j = i + 1; j < nums.size(); j++) { // O(N^2)
            if (nums[i] + nums[j] == target) return {i, j};
        }
    }
    return {};
}`
    },
    goodCode: {
      python: `def two_sum(nums, target):
    seen = {} # value -> index
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen: # O(1) hash table lookup!
            return [seen[diff], i]
        seen[num] = i
    return []`,
      javascript: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen.has(diff)) { // O(1) Map lookup!
            return [seen.get(diff), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
      java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int diff = target - nums[i];
        if (seen.containsKey(diff)) { // O(1) HashMap lookup!
            return new int[]{seen.get(diff), i};
        }
        seen.put(nums[i], i);
    }
    return new int[]{};
}`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (seen.find(diff) != seen.end()) { // O(1) Hash Map lookup!
            return {seen[diff], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`
    }
  },
  {
    id: 'inefficient-queue-simulation',
    name: 'Array `pop(0)` / `shift()` for Queue Simulation',
    category: 'Queues & BFS',
    severity: 'major',
    detectedComplexity: { time: 'O(N^2)', space: 'O(N)' },
    optimalComplexity: { time: 'O(N)', space: 'O(N)' },
    description: 'Using standard dynamic arrays (Python `list.pop(0)`, JavaScript `array.shift()`) as a FIFO queue forces an O(N) memory shift on every dequeue.',
    whyItFails: 'Dynamic arrays store contiguous memory. Removing the 0-th element requires moving all remaining N-1 elements left by 1 position. Dequeueing N elements results in N * O(N) = O(N^2) work.',
    bestPractice: 'Use double-ended queues with O(1) pop operations: Python `collections.deque.popleft()`, Java `ArrayDeque`, C++ `std::queue` or `std::deque`, or index-pointer tracking.',
    interviewRelevance: 'Level Order Traversal, Rotten Oranges, Word Ladder, Sliding Window Maximum',
    badCode: {
      python: `def bfs(root):
    if not root: return []
    queue = [root] # Plain Python list
    result = []
    while queue:
        # Inefficient: pop(0) takes O(K) time where K is queue length
        node = queue.pop(0) 
        result.append(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
    return result`,
      javascript: `function bfs(root) {
    if (!root) return [];
    const queue = [root];
    const result = [];
    while (queue.length > 0) {
        // Inefficient: array.shift() shifts all elements -> O(K)
        const node = queue.shift();
        result.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return result;
}`,
      java: `// Using ArrayList.remove(0) instead of Queue
List<TreeNode> queue = new ArrayList<>();
queue.add(root);
while (!queue.isEmpty()) {
    TreeNode curr = queue.remove(0); // O(N) element shift!
}`,
      cpp: `// Using std::vector.erase(v.begin()) instead of std::queue
vector<int> q = {root};
while (!q.empty()) {
    int val = q.front();
    q.erase(q.begin()); // O(N) shift per iteration!
}`
    },
    goodCode: {
      python: `from collections import deque

def bfs(root):
    if not root: return []
    queue = deque([root]) # True double-ended queue
    result = []
    while queue:
        node = queue.popleft() # O(1) amortized time!
        result.append(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
    return result`,
      javascript: `// Using pointer index to avoid O(N) shifts
function bfs(root) {
    if (!root) return [];
    const queue = [root];
    const result = [];
    let head = 0;
    while (head < queue.length) {
        const node = queue[head++]; // O(1) pointer advance!
        result.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return result;
}`,
      java: `// Using ArrayDeque for O(1) poll operations
Queue<TreeNode> queue = new ArrayDeque<>();
queue.offer(root);
while (!queue.isEmpty()) {
    TreeNode curr = queue.poll(); // O(1) operation!
    if (curr.left != null) queue.offer(curr.left);
    if (curr.right != null) queue.offer(curr.right);
}`,
      cpp: `// Using std::queue for O(1) pop
queue<TreeNode*> q;
q.push(root);
while (!q.empty()) {
    TreeNode* curr = q.front();
    q.pop(); // O(1) operation!
    if (curr->left) q.push(curr->left);
    if (curr->right) q.push(curr->right);
}`
    }
  },
  {
    id: 'bfs-missing-visited',
    name: 'Graph Traversal Missing `visited` Set',
    category: 'Trees & Graphs',
    severity: 'critical',
    detectedComplexity: { time: 'Infinite or O(V!)', space: 'Memory Limit Exceeded' },
    optimalComplexity: { time: 'O(V + E)', space: 'O(V)' },
    description: 'Performing BFS or DFS on general graphs (or cyclic grids) without marking and checking visited nodes causes infinite loops or exponential re-visits.',
    whyItFails: 'If node A connects to B and B connects to A, without a visited tracker the algorithm oscillates forever between A and B, filling the queue until memory exhaustion (MLE).',
    bestPractice: 'Always mark nodes as visited immediately upon enqueueing or exploring, checking `if neighbor in visited` before adding.',
    interviewRelevance: 'Number of Islands, Clone Graph, Course Schedule, Word Ladder, Pacific Atlantic Water Flow',
    badCode: {
      python: `def shortest_path(graph, start, end):
    queue = [(start, 0)]
    # BUG: No visited set! Will get stuck in cycles
    while queue:
        node, dist = queue.pop(0)
        if node == end:
            return dist
        for neighbor in graph[node]:
            queue.append((neighbor, dist + 1)) # Re-adds previously seen nodes!
    return -1`,
      javascript: `function shortestPath(graph, start, end) {
    const queue = [[start, 0]];
    // BUG: Missing visited Set!
    while (queue.length > 0) {
        const [node, dist] = queue.shift();
        if (node === end) return dist;
        for (const neighbor of graph[node]) {
            queue.push([neighbor, dist + 1]); // Infinite loop on cycles!
        }
    }
    return -1;
}`,
      java: `Queue<Integer> q = new LinkedList<>();
q.offer(start);
while (!q.isEmpty()) {
    int node = q.poll();
    for (int next : graph.get(node)) {
        q.offer(next); // BUG: No visited check causes infinite loop
    }
}`,
      cpp: `queue<int> q;
q.push(start);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) {
        q.push(v); // BUG: Missing visited set causes TLE / MLE
    }
}`
    },
    goodCode: {
      python: `from collections import deque

def shortest_path(graph, start, end):
    queue = deque([(start, 0)])
    visited = {start} # Track explored vertices
    
    while queue:
        node, dist = queue.popleft()
        if node == end:
            return dist
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor) # Mark visited at push time!
                queue.append((neighbor, dist + 1))
    return -1`,
      javascript: `function shortestPath(graph, start, end) {
    const queue = [[start, 0]];
    const visited = new Set([start]);
    let head = 0;
    
    while (head < queue.length) {
        const [node, dist] = queue[head++];
        if (node === end) return dist;
        for (const neighbor of graph[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor); // Mark visited immediately
                queue.push([neighbor, dist + 1]);
            }
        }
    }
    return -1;
}`,
      java: `Queue<Integer> q = new ArrayDeque<>();
Set<Integer> visited = new HashSet<>();
q.offer(start);
visited.add(start);

while (!q.isEmpty()) {
    int node = q.poll();
    if (node == end) return dist;
    for (int next : graph.get(node)) {
        if (!visited.contains(next)) {
            visited.add(next);
            q.offer(next);
        }
    }
}`,
      cpp: `queue<int> q;
unordered_set<int> visited;
q.push(start);
visited.insert(start);

while (!q.empty()) {
    int u = q.front(); q.pop();
    if (u == end) return dist;
    for (int v : adj[u]) {
        if (visited.find(v) == visited.end()) {
            visited.insert(v);
            q.push(v);
        }
    }
}`
    }
  },
  {
    id: 'string-concat-in-loop',
    name: 'Repeated String Concatenation Inside Loops',
    category: 'Strings & Memory',
    severity: 'major',
    detectedComplexity: { time: 'O(N^2)', space: 'O(N^2) temporary copies' },
    optimalComplexity: { time: 'O(N)', space: 'O(N)' },
    description: 'Using `s += char` or `s = s + str` in a loop generates a new string object and copies all previous characters on every iteration.',
    whyItFails: 'Strings in languages like Python, Java, and JavaScript are immutable. Appending 1 character to an existing string of length K requires copying all K characters. Sum of 1 + 2 + ... + N = N(N+1)/2 = O(N^2).',
    bestPractice: 'Collect parts in a list/array and perform a single `join()`, or use `StringBuilder` (Java) / `std::string::reserve` (C++).',
    interviewRelevance: 'Decode String, Reverse Words in a String, Valid Palindrome, Custom Serialization',
    badCode: {
      python: `def build_sentence(words):
    result = ""
    for w in words:
        # Re-allocates and copies entire 'result' string every time -> O(N^2)
        result += w + " "
    return result.strip()`,
      javascript: `function buildSentence(words) {
    let result = "";
    for (let i = 0; i < words.length; i++) {
        // String reallocation in tight loop
        result += words[i] + " ";
    }
    return result.trim();
}`,
      java: `public String buildSentence(String[] words) {
    String result = "";
    for (String w : words) {
        result += w + " "; // O(N^2) string copies in Java!
    }
    return result.trim();
}`,
      cpp: `// Repeated concatenation without reserving buffer
string result = "";
for (const string& w : words) {
    result += w + " ";
}`
    },
    goodCode: {
      python: `def build_sentence(words):
    # O(N) single-pass allocation
    return " ".join(words)`,
      javascript: `function buildSentence(words) {
    // Array join performs single-pass memory allocation
    return words.join(" ");
}`,
      java: `public String buildSentence(String[] words) {
    StringBuilder sb = new StringBuilder();
    for (String w : words) {
        sb.append(w).append(" ");
    }
    return sb.toString().trim();
}`,
      cpp: `string buildSentence(const vector<string>& words) {
    string result;
    // Pre-reserve estimate if possible
    for (const string& w : words) {
        result.append(w).append(" ");
    }
    return result;
}`
    }
  },
  {
    id: 'binary-search-bugs',
    name: 'Binary Search Midpoint Overflow & Infinite Loop',
    category: 'Binary Search',
    severity: 'major',
    detectedComplexity: { time: 'Infinite Loop or Integer Overflow', space: 'O(1)' },
    optimalComplexity: { time: 'O(log N)', space: 'O(1)' },
    description: 'Classic binary search traps: `(low + high) / 2` overflows 32-bit signed integers in Java/C++, and setting `low = mid` with `while (low < high)` causes an infinite loop when `high = low + 1`.',
    whyItFails: 'If `low + high > 2^31 - 1`, the sum turns negative, accessing invalid array indexes. Furthermore, integer division truncates downwards, so `(low + low + 1) / 2 == low`. If updated with `low = mid`, `low` never changes!',
    bestPractice: 'Calculate mid as `low + (high - low) // 2`. Carefully match loop condition `while (low <= high)` with `low = mid + 1` / `high = mid - 1`.',
    interviewRelevance: 'Binary Search, Search in Rotated Sorted Array, Find First and Last Position, Capacity To Ship Packages',
    badCode: {
      python: `def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    # Potential infinite loop if mid calculation and bounds mismatch
    while low < high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid # BUG: infinite loop when low and high differ by 1!
        else:
            high = mid - 1
    return -1`,
      javascript: `function binarySearch(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low < high) {
        let mid = Math.floor((low + high) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) low = mid; // Infinite loop trap!
        else high = mid - 1;
    }
    return -1;
}`,
      java: `public int binarySearch(int[] nums, int target) {
    int low = 0, high = nums.length - 1;
    while (low <= high) {
        int mid = (low + high) / 2; // BUG: 32-bit integer overflow!
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      cpp: `int binarySearch(vector<int>& nums, int target) {
    int low = 0, high = nums.size() - 1;
    while (low <= high) {
        int mid = (low + high) / 2; // Integer overflow bug!
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    },
    goodCode: {
      python: `def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = low + (high - low) // 2 # Safe from overflow
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1 # Guaranteed progression
        else:
            high = mid - 1
    return -1`,
      javascript: `function binarySearch(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      java: `public int binarySearch(int[] nums, int target) {
    int low = 0, high = nums.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2; // Safe from overflow!
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      cpp: `int binarySearch(vector<int>& nums, int target) {
    int low = 0, high = nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2; // Safe from overflow!
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    }
  },
  {
    id: 'subarray-brute-force',
    name: 'Quadratic Subarray Evaluation instead of Prefix Sum / Sliding Window',
    category: 'Arrays & Math',
    severity: 'major',
    detectedComplexity: { time: 'O(N^2) or O(N^3)', space: 'O(1)' },
    optimalComplexity: { time: 'O(N)', space: 'O(N) or O(1)' },
    description: 'Re-summing contiguous subarrays with nested loops instead of tracking running cumulative sums or using two pointers.',
    whyItFails: 'Evaluating every pair (i, j) and computing sum(arr[i..j]) takes O(N^3) naively or O(N^2) with running inner sum. For problems with negative numbers, Hash Map of prefix frequencies solves it in O(N).',
    bestPractice: 'Use Prefix Sum + Hash Map for arbitrary values/sum targets (like Subarray Sum Equals K), or Sliding Window for non-negative numbers.',
    interviewRelevance: 'Subarray Sum Equals K, Continuous Subarray Sum, Maximum Subarray (Kadane)',
    badCode: {
      python: `def subarray_sum(nums, k):
    count = 0
    # O(N^2) nested loop checking every possible subarray
    for i in range(len(nums)):
        current_sum = 0
        for j in range(i, len(nums)):
            current_sum += nums[j]
            if current_sum == k:
                count += 1
    return count`,
      javascript: `function subarraySum(nums, k) {
    let count = 0;
    // O(N^2) brute force
    for (let i = 0; i < nums.length; i++) {
        let sum = 0;
        for (let j = i; j < nums.length; j++) {
            sum += nums[j];
            if (sum === k) count++;
        }
    }
    return count;
}`,
      java: `public int subarraySum(int[] nums, int k) {
    int count = 0;
    for (int i = 0; i < nums.length; i++) {
        int sum = 0;
        for (int j = i; j < nums.length; j++) {
            sum += nums[j];
            if (sum == k) count++;
        }
    }
    return count;
}`,
      cpp: `int subarraySum(vector<int>& nums, int k) {
    int count = 0;
    for (int i = 0; i < nums.size(); i++) {
        int sum = 0;
        for (int j = i; j < nums.size(); j++) {
            sum += nums[j];
            if (sum == k) count++;
        }
    }
    return count;
}`
    },
    goodCode: {
      python: `from collections import defaultdict

def subarray_sum(nums, k):
    # Prefix Sum + Hash Map -> O(N) Time, O(N) Space
    prefix_counts = defaultdict(int)
    prefix_counts[0] = 1 # Base case: empty prefix
    curr_sum = 0
    count = 0
    
    for num in nums:
        curr_sum += num
        # If (curr_sum - k) was seen before, a valid subarray ends here
        if (curr_sum - k) in prefix_counts:
            count += prefix_counts[curr_sum - k]
        prefix_counts[curr_sum] += 1
        
    return count`,
      javascript: `function subarraySum(nums, k) {
    const prefixCounts = new Map([[0, 1]]);
    let currSum = 0, count = 0;
    
    for (const num of nums) {
        currSum += num;
        if (prefixCounts.has(currSum - k)) {
            count += prefixCounts.get(currSum - k);
        }
        prefixCounts.set(currSum, (prefixCounts.get(currSum) || 0) + 1);
    }
    return count;
}`,
      java: `public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> map = new HashMap<>();
    map.put(0, 1);
    int currSum = 0, count = 0;
    for (int num : nums) {
        currSum += num;
        if (map.containsKey(currSum - k)) {
            count += map.get(currSum - k);
        }
        map.put(currSum, map.getOrDefault(currSum, 0) + 1);
    }
    return count;
}`,
      cpp: `int subarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> prefix_counts;
    prefix_counts[0] = 1;
    int curr_sum = 0, count = 0;
    for (int num : nums) {
        curr_sum += num;
        if (prefix_counts.count(curr_sum - k)) {
            count += prefix_counts[curr_sum - k];
        }
        prefix_counts[curr_sum]++;
    }
    return count;
}`
    }
  },
  {
    id: 'mutate-while-iterating',
    name: 'Modifying Collection While Iterating',
    category: 'Arrays & Logic',
    severity: 'critical',
    detectedComplexity: { time: 'Silent Logical Corruption / O(N^2)', space: 'O(1)' },
    optimalComplexity: { time: 'O(N)', space: 'O(1) in-place or O(N)' },
    description: 'Deleting or removing items from a list while iterating over it with a standard index/for-each loop causes skipped elements or IndexErrors.',
    whyItFails: 'When you delete index `i`, subsequent elements shift left into index `i`. On the next iteration, the loop counter advances to `i + 1`, completely skipping the element that just slid into index `i`.',
    bestPractice: 'Use the Two-Pointer technique (read pointer & write pointer) for in-place modification, or list comprehension / filter.',
    interviewRelevance: 'Remove Element, Remove Duplicates from Sorted Array, Move Zeroes',
    badCode: {
      python: `def remove_val(nums, val):
    # BUG: Skips elements immediately after removed element!
    for num in nums:
        if num == val:
            nums.remove(num) # O(N) scan + shifts array
    return len(nums)`,
      javascript: `function removeVal(nums, val) {
    // BUG: Elements skipped because index increments after splice
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === val) {
            nums.splice(i, 1); 
        }
    }
    return nums.length;
}`,
      java: `// ConcurrentModificationException or skipped elements
for (Integer num : list) {
    if (num == val) {
        list.remove(num); // Throws ConcurrentModificationException!
    }
}`,
      cpp: `// Iterator invalidation
for (auto it = v.begin(); it != v.end(); ++it) {
    if (*it == val) {
        v.erase(it); // Invalidates iterator!
    }
}`
    },
    goodCode: {
      python: `def remove_val(nums, val):
    # Two-pointer in-place write: O(N) Time, O(1) Space
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return write`,
      javascript: `function removeVal(nums, val) {
    // Two-pointer write approach
    let write = 0;
    for (let read = 0; read < nums.length; read++) {
        if (nums[read] !== val) {
            nums[write++] = nums[read];
        }
    }
    nums.length = write;
    return write;
}`,
      java: `public int removeVal(int[] nums, int val) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != val) {
            nums[write++] = nums[read];
        }
    }
    return write;
}`,
      cpp: `int removeVal(vector<int>& nums, int val) {
    int write = 0;
    for (int read = 0; read < nums.size(); read++) {
        if (nums[read] != val) {
            nums[write++] = nums[read];
        }
    }
    return write;
}`
    }
  },
  {
    id: 'greedy-fallacy-dp',
    name: 'Greedy Fallacy on DP Problems (e.g., Coin Change)',
    category: 'Greedy vs DP',
    severity: 'critical',
    detectedComplexity: { time: 'Incorrect Output (Logical Bug)', space: 'O(1)' },
    optimalComplexity: { time: 'O(Amount * N)', space: 'O(Amount)' },
    description: 'Picking the locally optimal choice (e.g. largest coin first) fails when subproblems lack the greedy-choice property.',
    whyItFails: 'For coins = [1, 3, 4] and amount = 6, greedy takes 4 + 1 + 1 (3 coins), whereas the optimal solution is 3 + 3 (2 coins). Greedy produces wrong answers in algorithmic interviews!',
    bestPractice: 'Verify the Greedy Choice Property. If picking an item can eliminate a better global combination, use Dynamic Programming.',
    interviewRelevance: 'Coin Change, 0/1 Knapsack, Jump Game II, Partition Equal Subset Sum',
    badCode: {
      python: `def coin_change(coins, amount):
    # WRONG: Greedy approach fails for general coin systems
    coins.sort(reverse=True)
    count = 0
    for coin in coins:
        if amount == 0: break
        count += amount // coin
        amount %= coin
    return count if amount == 0 else -1`,
      javascript: `function coinChange(coins, amount) {
    // WRONG: Greedy algorithm does not yield global optimum
    coins.sort((a, b) => b - a);
    let count = 0;
    for (const coin of coins) {
        count += Math.floor(amount / coin);
        amount %= coin;
    }
    return amount === 0 ? count : -1;
}`,
      java: `// Fails for denominations like [1, 3, 4] targeting 6
public int coinChange(int[] coins, int amount) {
    Arrays.sort(coins);
    int count = 0;
    for (int i = coins.length - 1; i >= 0; i--) {
        count += amount / coins[i];
        amount %= coins[i];
    }
    return amount == 0 ? count : -1;
}`,
      cpp: `// Greedy fails for non-canonical coin sets
int coinChange(vector<int>& coins, int amount) {
    sort(coins.rbegin(), coins.rend());
    int count = 0;
    for (int c : coins) {
        count += amount / c;
        amount %= c;
    }
    return amount == 0 ? count : -1;
}`
    },
    goodCode: {
      python: `def coin_change(coins, amount):
    # Dynamic Programming: O(Amount * len(coins)) Time, O(Amount) Space
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for a in range(1, amount + 1):
        for c in coins:
            if a - c >= 0:
                dp[a] = min(dp[a], 1 + dp[a - c])
                
    return dp[amount] if dp[amount] != float('inf') else -1`,
      javascript: `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let a = 1; a <= amount; a++) {
        for (const c of coins) {
            if (a - c >= 0) {
                dp[a] = Math.min(dp[a], 1 + dp[a - c]);
            }
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      java: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (a >= c) {
                dp[a] = Math.min(dp[a], 1 + dp[a - c]);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
      cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (a >= c) {
                dp[a] = min(dp[a], 1 + dp[a - c]);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`
    }
  },
  {
    id: 'sort-inside-loop',
    name: 'Repeated Array Sorting Inside Loop',
    category: 'Sorting & Heaps',
    severity: 'major',
    detectedComplexity: { time: 'O(N^2 log N)', space: 'O(N)' },
    optimalComplexity: { time: 'O(N log K)', space: 'O(K)' },
    description: 'Re-sorting an entire list repeatedly every time a new element arrives or inside an outer loop, instead of using a Heap or maintaining sorted order.',
    whyItFails: 'Standard sorting takes O(M log M). Repeating this sorting operation across N iterations incurs O(N * M log M) total overhead.',
    bestPractice: 'Use a Priority Queue / Heap (Python `heapq`, Java `PriorityQueue`, C++ `priority_queue`) to insert in O(log K) and query min/max in O(1).',
    interviewRelevance: 'Kth Largest Element in an Array, Find Median from Data Stream, Top K Frequent Elements',
    badCode: {
      python: `def kth_largest_stream(k, stream):
    buffer = []
    result = []
    for val in stream:
        buffer.append(val)
        buffer.sort() # Sorting entire array on every element! O(N^2 log N)
        result.append(buffer[-k])
    return result`,
      javascript: `function kthLargestStream(k, stream) {
    const buffer = [];
    const result = [];
    for (const val of stream) {
        buffer.push(val);
        buffer.sort((a, b) => a - b); // O(N^2 log N)
        result.push(buffer[buffer.length - k]);
    }
    return result;
}`,
      java: `// Re-sorting collection on each insert
List<Integer> list = new ArrayList<>();
for (int val : stream) {
    list.add(val);
    Collections.sort(list); // O(N^2 log N)
}`,
      cpp: `// Repeated std::sort inside loop
vector<int> v;
for (int x : stream) {
    v.push_back(x);
    sort(v.begin(), v.end()); // Inefficient
}`
    },
    goodCode: {
      python: `import heapq

def kth_largest_stream(k, stream):
    # Maintain a Min-Heap of size K -> O(N log K) Time, O(K) Space
    min_heap = []
    result = []
    for val in stream:
        heapq.heappush(min_heap, val)
        if len(min_heap) > k:
            heapq.heappop(min_heap)
        if len(min_heap) == k:
            result.append(min_heap[0])
    return result`,
      javascript: `// Min-Heap approach maintains size K -> O(N log K)
// In JS, implement or use a standard MinHeap class
function findKthLargest(nums, k) {
    // Quickselect (average O(N)) or Min-Heap (O(N log K))
}`,
      java: `public List<Integer> kthLargestStream(int k, int[] stream) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>(k);
    List<Integer> res = new ArrayList<>();
    for (int val : stream) {
        minHeap.offer(val);
        if (minHeap.size() > k) minHeap.poll();
        if (minHeap.size() == k) res.add(minHeap.peek());
    }
    return res;
}`,
      cpp: `vector<int> kthLargestStream(int k, const vector<int>& stream) {
    priority_queue<int, vector<int>, greater<int>> minHeap;
    vector<int> res;
    for (int val : stream) {
        minHeap.push(val);
        if (minHeap.size() > k) minHeap.pop();
        if (minHeap.size() == k) res.push_back(minHeap.top());
    }
    return res;
}`
    }
  },
  {
    id: 'dijkstra-negative-weights',
    name: "Dijkstra's Algorithm on Graphs with Negative Edge Weights",
    category: 'Trees & Graphs',
    severity: 'critical',
    detectedComplexity: { time: 'Incorrect Shortest Paths / Infinite Loop', space: 'O(V)' },
    optimalComplexity: { time: 'O(V * E)', space: 'O(V)' },
    description: "Dijkstra's algorithm fundamentally assumes that once a vertex is extracted from the priority queue, its shortest distance is finalized. With negative edges, this greedy assumption breaks.",
    whyItFails: "Negative edges mean adding an edge can reduce the total distance, violating the subpath optimality condition Dijkstra relies upon. Negative cycles cause infinite loops in Dijkstra.",
    bestPractice: "Use the Bellman-Ford Algorithm (O(V * E)) or Shortest Path Faster Algorithm (SPFA) when negative edge weights are present.",
    interviewRelevance: 'Cheapest Flights Within K Stops, Network Delay Time, Currency Arbitrage',
    badCode: {
      python: `# Using standard Dijkstra when graph has negative weights
# Result will be wrong or get stuck if negative cycle exists!`,
      javascript: `// Dijkstra fails when graph has negative edge weights`,
      java: `// Using PriorityQueue Dijkstra with negative edges -> Wrong answers`,
      cpp: `// Dijkstra fails with negative weights`
    },
    goodCode: {
      python: `def bellman_ford(n, edges, src):
    # O(V * E) - correctly handles negative edge weights
    dist = [float('inf')] * n
    dist[src] = 0
    
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                
    # Detect negative weight cycles
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            raise ValueError("Graph contains a negative weight cycle!")
            
    return dist`,
      javascript: `function bellmanFord(n, edges, src) {
    const dist = new Array(n).fill(Infinity);
    dist[src] = 0;
    for (let i = 0; i < n - 1; i++) {
        for (const [u, v, w] of edges) {
            if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }
    return dist;
}`,
      java: `// Bellman-Ford handles negative weights
public int[] bellmanFord(int n, int[][] edges, int src) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++) {
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }
    return dist;
}`,
      cpp: `vector<int> bellmanFord(int n, const vector<vector<int>>& edges, int src) {
    vector<int> dist(n, 1e9);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++) {
        for (const auto& e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != 1e9 && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }
    return dist;
}`
    }
  },
  {
    id: 'two-pointers-unsorted',
    name: 'Applying Two-Pointers (Opposite Ends) on Unsorted Array',
    category: 'Two Pointers & Arrays',
    severity: 'critical',
    detectedComplexity: { time: 'Incorrect Output (Logical Bug)', space: 'O(1)' },
    optimalComplexity: { time: 'O(N log N) with sort or O(N) with Hash Map', space: 'O(N)' },
    description: 'Converging two pointers `left++` and `right--` requires monotonic behavior (the array must be sorted). On unsorted arrays, advancing a pointer blindly discards valid candidate pairs.',
    whyItFails: 'If `nums[left] + nums[right] < target`, in a sorted array you know increasing `left` will increase the sum. In an unsorted array, `nums[left + 1]` could be smaller, larger, or equal, breaking the guarantee.',
    bestPractice: 'Sort the array first if indices do not matter (O(N log N)), or use a Hash Map to preserve original indices in O(N) time.',
    interviewRelevance: 'Two Sum II (Input Array Is Sorted), 3Sum, Container With Most Water, 4Sum',
    badCode: {
      python: `def two_sum_flawed(nums, target):
    # BUG: nums is NOT sorted! Two pointers will miss valid solutions
    left, right = 0, len(nums) - 1
    while left < right:
        curr = nums[left] + nums[right]
        if curr == target:
            return [left, right]
        elif curr < target:
            left += 1 # Cannot guarantee next element is larger!
        else:
            right -= 1
    return []`,
      javascript: `function twoSumFlawed(nums, target) {
    // BUG: Two-pointer convergence requires monotonic/sorted data
    let left = 0, right = nums.length - 1;
    while (left < right) {
        const sum = nums[left] + nums[right];
        if (sum === target) return [left, right];
        if (sum < target) left++;
        else right--;
    }
    return [];
}`,
      java: `// Two pointers applied to unsorted array fails
public int[] twoSumFlawed(int[] nums, int target) {
    int l = 0, r = nums.length - 1;
    while (l < r) {
        int sum = nums[l] + nums[r];
        if (sum == target) return new int[]{l, r};
        if (sum < target) l++;
        else r--;
    }
    return new int[]{};
}`,
      cpp: `// Two pointers fails without sorted condition
vector<int> twoSumFlawed(vector<int>& nums, int target) {
    int l = 0, r = nums.size() - 1;
    while (l < r) {
        int sum = nums[l] + nums[r];
        if (sum == target) return {l, r};
        if (sum < target) l++;
        else r--;
    }
    return {};
}`
    },
    goodCode: {
      python: `def two_sum_hash(nums, target):
    # Works correctly on unsorted arrays in O(N) Time
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []`,
      javascript: `function twoSumHash(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        if (seen.has(target - nums[i])) {
            return [seen.get(target - nums[i]), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
      java: `public int[] twoSumHash(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        if (map.containsKey(target - nums[i])) {
            return new int[]{map.get(target - nums[i]), i};
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
      cpp: `vector<int> twoSumHash(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        if (seen.count(target - nums[i])) {
            return {seen[target - nums[i]], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`
    }
  }
];
