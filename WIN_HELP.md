## **how to export environment variables** in **Windows**, specifically:
- in **Command Prompt (cmd.exe)** 
- in **PowerShell**

And you want the example to be about **AWS Secrets** (e.g., `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

---

Here’s the quick guide:

## 1. 🖥 CMD (Command Prompt)

In **cmd.exe**, use the `set` command:

```cmd
set AWS_ACCESS_KEY_ID=your_access_key_id
set AWS_SECRET_ACCESS_KEY=your_secret_access_key
set AWS_DEFAULT_REGION=us-east-1
```

✅ **Note:** 
- `set` only sets it for the **current CMD session**.
- If you open a new cmd window, you'll need to set it again unless you set it permanently.

---

## 2. ⚡ PowerShell

In **PowerShell**, use `$env:` to set environment variables:

```powershell
$env:AWS_ACCESS_KEY_ID="your_access_key_id"
$env:AWS_SECRET_ACCESS_KEY="your_secret_access_key"
$env:AWS_DEFAULT_REGION="us-east-1"
```

✅ **Note:** 
- Like in cmd, it will be valid only for the **current PowerShell session** unless you write it to your profile script.

---

## 3. 📜 Example: Full session in CMD

```cmd
C:\> set AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
C:\> set AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
C:\> set AWS_DEFAULT_REGION=us-east-1

C:\> aws s3 ls
```

---

## 4. 📜 Example: Full session in PowerShell

```powershell
PS C:\> $env:AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
PS C:\> $env:AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
PS C:\> $env:AWS_DEFAULT_REGION="us-east-1"

PS C:\> aws s3 ls
```

---

## 5. 🌟 (Optional) Make it Permanent

If you want to make it **permanent** (i.e., every time you open a new terminal):

- **In Windows**, you can add Environment Variables permanently via:
  - **Settings** → **System** → **About** → **Advanced system settings** → **Environment Variables**.
  - Add **User variables** or **System variables** like:
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_DEFAULT_REGION`

---

### 🔥 Quick difference:
| CMD | PowerShell |
|:---|:---|
| `set VAR=value` | `$env:VAR="value"` |
| Limited scripting | Richer scripting (objects, piping) |


## Reference 

1. [VScode + gitbash](https://blog.danielpadua.dev/posts/git-bash-with-vscode/)
2. [Caching your GitHub credentials in Git](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git?platform=windows)

