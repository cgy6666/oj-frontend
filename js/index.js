const API_BASE = 'https://oj-backend-theta.vercel.app/api'; // 替换为你的Vercel域名

async function loadProblems() {
  const res = await fetch(`${API_BASE}/problems`);
  const problems = await res.json();
  
  const list = document.getElementById('problem-list');
  list.innerHTML = problems.map(p => `
    <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <h2 class="text-xl font-semibold mb-2">${p.title}</h2>
      <p class="text-gray-600 mb-4">${p.description.substring(0, 50)}...</p>
      <a href="problem.html?id=${p.id}" class="text-blue-600 hover:underline">开始做题 →</a>
    </div>
  `).join('');
}

loadProblems();
