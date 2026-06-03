// ⚠️ 여기에 본인의 Supabase 정보 꼭 입력하기!
const SUPABASE_URL = "여기에_본인의_SUPABASE_URL_붙여넣기";
const SUPABASE_KEY = "여기에_본인의_SUPABASE_ANON_KEY_붙여넣기";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isStudentVerified = false;

// 탭 메뉴 전환 기능
function showSection(sectionId) {
  ['feed-section', 'diary-section', 'ranking-section'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
  
  ['menu-feed', 'menu-diary', 'menu-ranking'].forEach(id => {
    document.getElementById(id).classList.remove('bg-zinc-800', 'text-white', 'font-bold');
    document.getElementById(id).classList.add('text-zinc-400');
  });
  const activeMenuMap = {'feed-section': 'menu-feed', 'diary-section': 'menu-diary', 'ranking-section': 'menu-ranking'};
  document.getElementById(activeMenuMap[sectionId]).classList.add('bg-zinc-800', 'text-white', 'font-bold');
}

// 학생 인증 상태 토글 기능
function verifyStudent() {
  isStudentVerified = !isStudentVerified;
  const statusBox = document.getElementById('auth-status');
  if(isStudentVerified) {
    statusBox.innerHTML = `인증 상태: <span class="text-neon font-bold">★인증완료</span>`;
    alert("학생인증 배지가 부여되었습니다!");
  } else {
    statusBox.innerHTML = `인증 상태: <span class="text-red-400 font-bold">미인증</span>`;
  }
  loadPosts(); 
}

// [게시글] 불러오기
async function loadPosts() {
  const { data, error } = await supabaseClient.from('posts').select('*').order('id', { ascending: false });
  if (error) return;

  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  data.forEach(post => {
    const article = document.createElement('article');
    article.className = 'bg-surface p-5 rounded-2xl border border-border space-y-3';
    article.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2 text-xs">
          <div class="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center font-bold">👤</div>
          <span class="font-bold">익명주주</span>
          ${isStudentVerified ? `<span class="bg-neon/20 text-neon text-[9px] px-1.5 py-0.5 rounded font-bold">학생인증</span>` : ''}
        </div>
        <button onclick="deletePost(${post.id})" class="text-zinc-600 hover:text-red-400 text-xs">[삭제]</button>
      </div>
      <h3 class="text-base font-bold">${post.title}</h3>
      <p class="text-zinc-400 text-sm">${post.content}</p>
      <div class="flex gap-4 pt-2 text-xs text-zinc-500 font-bold">
        <button onclick="alert('좋아요 완료!')" class="hover:text-red-400">❤️ 좋아요</button>
        <button onclick="alert('댓글 기능')" class="hover:text-brand">💬 댓글</button>
      </div>
    `;
    feed.appendChild(article);
  });
}

// [게시글] 작성
async function addPost() {
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  if (!title || !content) return alert('내용을 채워주세요!');

  await supabaseClient.from('posts').insert([{ title, content }]);
  document.getElementById('postTitle').value = '';
  document.getElementById('postContent').value = '';
  loadPosts();
}

// [게시글] 삭제
async function deletePost(id) {
  if(!confirm("정말 삭제하시겠습니까?")) return;
  await supabaseClient.from('posts').delete().eq('id', id);
  loadPosts();
}

// [투자일기] 저장
function addDiary() {
  const profit = document.getElementById('diaryProfit').value;
  const title = document.getElementById('diaryTitle').value;
  const content = document.getElementById('diaryContent').value;
  if(!profit || !title || !content) return alert('모든 칸을 채워주세요!');

  const diaries = JSON.parse(localStorage.getItem('diaries') || '[]');
  diaries.unshift({ profit, title, content, date: new Date().toLocaleDateString() });
  localStorage.setItem('diaries', JSON.stringify(diaries));

  document.getElementById('diaryProfit').value = '';
  document.getElementById('diaryTitle').value = '';
  document.getElementById('diaryContent').value = '';
  loadDiaries();
  alert('오늘의 일기가 저장되었습니다.');
}

// [투자일기] 불러오기
function loadDiaries() {
  const list = document.getElementById('diary-list');
  if (!list) return;
  list.innerHTML = '';
  const diaries = JSON.parse(localStorage.getItem('diaries') || '[]');
  
  diaries.forEach(d => {
    const div = document.createElement('div');
    div.className = 'bg-surface p-4 rounded-2xl border border-border flex justify-between items-center';
    const isPlus = parseFloat(d.profit) >= 0;
    div.innerHTML = `
      <div>
        <span class="text-xs text-zinc-500 font-mono">${d.date}</span>
        <h4 class="font-bold text-sm mt-0.5">${d.title}</h4>
        <p class="text-xs text-zinc-400 mt-1">${d.content}</p>
      </div>
      <span class="${isPlus ? 'text-red-400' : 'text-blue-400'} font-mono font-bold text-base">${isPlus ? '+' : ''}${d.profit}%</span>
    `;
    list.appendChild(div);
  });
}

// 웹사이트가 켜지면 제일 먼저 실행할 코드
loadPosts();
loadDiaries();