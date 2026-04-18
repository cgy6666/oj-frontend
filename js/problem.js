const API_BASE = 'https://oj-backend-theta.vercel.app/'; // 替换为你的Vercel域名
let editor;

function getProblemId() { return new URLSearchParams(window.location.search).get('id'); }

async function loadProblem() {
  const res = await fetch(`${API_BASE}/problems`);
  const problems = await res.json();
  const p = problems.find(x => x.id == getProblemId());
  
  document.getElementById('problem-detail').innerHTML = `
    <h1 class="text-2xl font-bold mb-4">${p.title}</h1>
    <p class="mb-4">${p.description}</p>
    <pre class="bg-gray-100 p-3 rounded">输入: ${p.sample_input}\n输出: ${p.sample_output}</pre>
  `;

  // 初始化编辑器
  editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    mode: 'text/x-c++src',
    theme: 'dracula',
    lineNumbers: true
  });
  
  document.getElementById('language').onchange = (e) => {
    editor.setOption('mode', e.target.value == '71' ? 'python' : 'text/x-c++src');
  };
}

async function submitCode() {
  const btn = document.getElementById('submit-btn');
  const resultDiv = document.getElementById('result');
  btn.disabled = true;
  resultDiv.textContent = '正在提交...';

  try {
    // 1. 提交
    const submitRes = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_id: getProblemId(),
        code: editor.getValue(),
        language_id: document.getElementById('language').value,
        stdin: ''
      })
    });
    const { submission_id, token } = await submitRes.json();
    
    resultDiv.textContent = '正在评测...';

    // 2. 轮询结果
    const poll = async () => {
      const res = await fetch(`${API_BASE}/result?submission_id=${submission_id}&token=${token}`);
      const data = await res.json();
      
      if (data.status?.id <= 2) {
        setTimeout(poll, 1000);
      } else {
        resultDiv.innerHTML = `
          <p><strong>状态:</strong> <span class="${data.status.description === 'Accepted' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}">${data.status.description}</span></p>
          ${data.time ? `<p><strong>耗时:</strong> ${data.time} ms</p>` : ''}
          ${data.stdout ? `<pre class="bg-gray-100 p-2 mt-2 text-sm">${data.stdout}</pre>` : ''}
          ${data.stderr ? `<pre class="bg-red-100 p-2 mt-2 text-sm text-red-800">${data.stderr}</pre>` : ''}
        `;
      }
    };
    setTimeout(poll, 2000);
  } catch (e) {
    resultDiv.textContent = '错误: ' + e.message;
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProblem();
  document.getElementById('submit-btn').addEventListener('click', submitCode);
});
