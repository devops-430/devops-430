### 🧠 How Git Handles Commit Changes During Rebase

When you **edit an earlier commit** (e.g., to remove a file or secret), Git:

1. **Creates a new snapshot** for that commit (e.g., a cleaned version without the secret).
2. Then, for **every subsequent commit**, Git:
   - **Reapplies** its changes **on top of** the *new* version of the previous commit.
   - Git attempts to **automatically adjust** changes based on the updated snapshot.
   - If there are **conflicts** (e.g., later commit touches the file you just removed), you’ll be prompted to resolve them manually.

---

### 🔄 What Does This Mean in Practice?

Let’s say your history looked like this:

```
A -- B -- C -- D -- E   (dev)
          ↑
          | Commit C added a secret file
```

When you rebase from `C^` and edit `C` to remove the secret file:

- Git **creates a new commit C'** (without the file).
- Then it tries to reapply `D` and `E` **on top of C'**.
- If `D` or `E` reference the removed file, Git will throw a **merge conflict**, which you'll have to fix.

---

### 🔐 Example Scenario

- `C` adds a file with secrets: `secrets.txt`
- You edit `C` during rebase and remove `secrets.txt`
- `D` modifies `secrets.txt`

Then during rebase:
- Git applies `D` on top of the new `C'`
- But `secrets.txt` no longer exists — so Git gives you a conflict
- You fix it by skipping or modifying `D` accordingly
- Continue rebase as usual

---

### ✅ Git's Design Principle Here:

Each commit is a **full snapshot** of the repo — not just a delta.  
This allows Git to **rewrite history cleanly**, provided each change can be logically replayed.

Great curiosity — this digs deep into Git's internal mechanics. Let's unpack it:

---

## 🗂️ Where Does Git Store Commit Snapshots?

Git stores all content in its **object database**, under the `.git/objects` directory.

### 🔑 Key Concepts:

1. **Commits are pointers to snapshots**, not diffs.
2. Each commit references:
   - A **tree object** (the root directory snapshot)
   - One or more **parent commits**
   - Metadata (author, message, timestamp)

---

### 🧱 Git Object Types

Git internally stores 4 object types:

| Type   | Description |
|--------|-------------|
| **Blob** | The contents of a file |
| **Tree** | A directory — contains file names, types, and blob/tree hashes |
| **Commit** | Points to a tree and parent commit(s) |
| **Tag** | Marks a specific object (usually a commit) |

---

### 📦 Where They Live:

Each object is stored in `.git/objects/` as a compressed file:

```
.git/objects/ab/cdef123456... ← object hash
```

For example, if a commit's SHA is `abcdef1234567890`, it's stored in:

```
.git/objects/ab/cdef1234567890...
```

Git uses the **SHA-1/SHA-256 hash of the object content** as the filename.

---

### 🔁 Example: What Happens When You Commit

Let’s say you run:

```bash
echo "hello" > file.txt
git add file.txt
git commit -m "Add file"
```

Git does:

1. Creates a **blob** for the file content.
2. Creates a **tree** for the directory.
3. Creates a **commit** that points to the tree.

Each of these is a separate object stored in `.git/objects`.

---

### 🔍 Want to Explore It Yourself?

You can inspect it using:

```bash
git cat-file -p <commit-sha>
```

It will show:

```
tree e6b30d...
parent a12f56...
author You <you@example.com>
...
```

To view the tree:

```bash
git cat-file -p e6b30d...
```

And then the blob for a file:

```bash
git cat-file -p <blob-sha>
```

---

### 🧠 Summary

- Git stores snapshots as **immutable objects** (blobs, trees, commits).
- Each commit **refers to a tree**, which refers to blobs and subtrees.
- It's a **content-addressable storage system** — every file version has a hash ID based on its content.

---

## 🌳 What Is a Tree in Git?

In Git, a **tree object**:

- Represents a **directory**
- Contains:
  - File names
  - Modes (permissions)
  - The **SHA-1/SHA-256** of each file (blob) or subdirectory (tree)

So, a tree maps **names to blobs or subtrees** — just like a folder with files and subfolders.

---

### 🧱 Tree = Directory Snapshot

Think of it like a manifest of a directory at the time of a commit.

Each **commit** points to one **tree** object that captures the state of the root directory.  
That root tree may reference other tree objects (subdirectories), and blobs (files).

---

### 🔍 Example: Tree Internals

Say you have this directory:

```
project/
├── README.md
└── src/
    └── main.py
```

Git stores this as:

- A tree for `project`:
  - Entry: `README.md` → blob `abc123...`
  - Entry: `src/` → tree `def456...`
- A tree for `src/`:
  - Entry: `main.py` → blob `789abc...`

You can inspect a tree like this:

```bash
git cat-file -p <tree-sha>
```

You’ll see:

```
100644 blob abc123...    README.md
040000 tree def456...    src
```

And for `src`'s tree:

```
100644 blob 789abc...    main.py
```

---

## 🔁 Tree vs Blob vs Commit Summary

| Git Object | Represents      | Points To                        |
|------------|------------------|----------------------------------|
| **Blob**   | File content     | None                             |
| **Tree**   | Directory        | Blobs (files) and Trees (subdirs)|
| **Commit** | Repo state       | One tree + parent commits        |

---

### 🎯 Why This Matters

Because Git stores full snapshots (not diffs), the tree structure lets it:

- Quickly detect changes (via hash comparison)
- Efficiently reuse unchanged trees/blobs between commits
- Enable powerful operations like rebase, cherry-pick, and reset


Git’s `cherry-pick` is a powerful command that **copies a commit** from one branch and **applies its changes** on top of another branch — like "plucking" a cherry 🍒 and placing it elsewhere in the tree.

Let’s dive into **how Git actually handles cherry-picking internally.**

---

## 🍒 What `git cherry-pick` Does (Conceptually)

When you run:

```bash
git cherry-pick <commit-sha>
```

Git does the following:

1. **Finds the diff** (changes) introduced by `<commit-sha>` compared to its parent.
2. **Applies** those changes (a patch) to your current working tree and index.
3. **Creates a new commit** with those changes, using:
   - Your current HEAD as the parent
   - The same author and message (by default) as the original commit

> The original commit’s SHA is **not reused** — a new one is generated.

---

## 🔬 Example Internals

Suppose:

- You're on branch `feature`
- The commit you want to cherry-pick is `abc123` from `main`

When you run:

```bash
git cherry-pick abc123
```

Git:

1. Computes:

   ```bash
   git diff abc123^ abc123
   ```

2. Applies the patch to your current branch (`feature`):

   ```bash
   git apply
   ```

3. Stages and commits the result with:

   ```bash
   git commit --author="Original Author" -m "Original commit message"
   ```

---

## 💥 What If Conflicts Occur?

If the changes from the cherry-picked commit **conflict** with existing code, Git:

- Stops the process
- Marks conflicts in the working tree
- Asks you to resolve them

After fixing conflicts, you continue with:

```bash
git add .
git cherry-pick --continue
```

---

## ⚙️ Internals: What’s Stored

When cherry-picking, Git modifies:

- The **index** (staging area)
- The **working tree** (your current files)
- The **HEAD** (to point to the new commit)

No history is rewritten; Git simply creates a **new commit** with a new hash on your current branch.

---

## 🚧 Gotchas

- Cherry-pick is **not idempotent** — applying the same commit multiple times will keep creating new commits.
- You may lose the original chronological context if you cherry-pick without care.
- Repeated cherry-picks can make rebasing harder if histories diverge.

---

## 🧠 Summary

| Step        | Git Action                                  |
|-------------|----------------------------------------------|
| 1. Identify | Git finds diff between commit and its parent |
| 2. Apply    | Git applies the diff as a patch              |
| 3. Commit   | Git creates a new commit on current branch   |


Here's a breakdown of the commonly used **symbols and notations in Git**:

---

## 🔹 `^` (caret)
Refers to a **parent commit**.

| Syntax      | Meaning                                      |
|-------------|----------------------------------------------|
| `HEAD^`     | First parent of `HEAD`                       |
| `abc123^2`  | Second parent (e.g., in a merge commit)      |
| `abc123^^`  | Parent of parent (grandparent)               |

---

## 🔸 `~` (tilde)
Refers to the **nth ancestor** of a commit by following the *first parent* only.

| Syntax       | Meaning                                         |
|--------------|-------------------------------------------------|
| `HEAD~1`     | Same as `HEAD^` (1st parent)                    |
| `HEAD~3`     | 3rd generation ancestor of `HEAD`               |
| `abc123~2`   | First parent → first parent (two generations up)|

✅ Use `~` when you want to walk linearly up the mainline of commits.

---

## 🔹 `@` (shorthand for `HEAD`)
- `git log @` → same as `git log HEAD`
- `@~2` → 2 commits before `HEAD`

---

## 🔸 `:` (colon)
Used for **path and file referencing** within commits.

| Syntax                   | Meaning                                         |
|--------------------------|-------------------------------------------------|
| `abc123:file.txt`        | Show `file.txt` as it was in commit `abc123`   |
| `HEAD:file.py`           | Show file content at HEAD                      |
| `:0:file.py`             | Stage 0 version of file (current branch)       |

---

## 🔹 `..` (two-dot range)
Used to compare ranges or show logs.

| Syntax                | Meaning                                                    |
|-----------------------|------------------------------------------------------------|
| `A..B`                | Commits in B that aren’t in A (i.e., what B added)         |
| `git log A..B`        | Show commits reachable from B but not from A              |

---

## 🔸 `...` (three-dot range)
Used for comparing **differences in branches**.

| Syntax                | Meaning                                                          |
|-----------------------|------------------------------------------------------------------|
| `A...B`               | Commits that are in A or B, but not both (symmetric difference) |
| `git diff A...B`      | Changes between the tips of the branches, from the merge base   |

---

## 🔹 `^@`, `^!`, `~n` — Advanced notations
- `commit^@` = all parents of a merge commit
- `commit^!` = commit and the changes it introduces (exclude parents)

---

## 🧪 Examples for Practice

```bash
git diff HEAD~2 HEAD      # Changes between 2 commits ago and now
git show HEAD^:README.md  # README from previous commit
git log feature..main     # What main has that feature doesn't
```

---

Git **garbage collection** (GC) is a process that cleans up unnecessary files and optimizes your local repository to reduce disk space and improve performance. Here's a breakdown of **when** and **what** Git garbage collects:

---

### 🕒 **When Does Git Run Garbage Collection?**

Git runs GC automatically or manually under these scenarios:

#### ✅ **Automatically (heuristic triggers):**
- After many commits or merges.
- After a large number of loose objects accumulate.
- When the `.git/objects` directory grows too large.
- Triggered by commands like:
  - `git commit`
  - `git fetch`
  - `git rebase`
- Git *might* run an **automatic background GC** via:
  ```bash
  git maintenance run --auto
  ```
  …if configured.

#### ✅ **Manually:**
You can explicitly run GC with:
```bash
git gc
```
Or to force a full cleanup:
```bash
git gc --aggressive --prune=now
```

---

### 🧹 **What Does Git Garbage Collect?**

1. **Unreachable commits**  
   - Commits not referenced by any branch, tag, or reflog, and older than the prune threshold (default 2 weeks).
2. **Dangling blobs and trees**  
   - Files or directories that were part of abandoned histories.
3. **Orphaned tags and references**
4. **Loose objects → pack files**  
   - Converts many individual object files into compressed `.pack` files.
5. **Stale working directories or logs**  
   - `logs/`, `refs/`, etc., are cleaned up if unused.

---

### 🗑️ How to See What Would Be Collected?

Run this to preview garbage collection:
```bash
git gc --dry-run
```

Or find unreachable objects:
```bash
git fsck --unreachable
```

---

### ⚙️ Time Threshold for Pruning

- Git doesn’t delete unreachable commits *immediately*.
- Default is:
  ```bash
  git gc --prune=2.weeks.ago
  ```
  This keeps unreachable commits around for 2 weeks in case of an undo.

You can change this:
```bash
git config gc.pruneExpire "1.day.ago"
```

---


## References
1. https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
2. https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery
