// 인스턴스 고유 인증 데이터 동기화 완료
const SUPABASE_URL = "https://lwanjcmxxtlevfecdzhf.supabase.co";
const SUPABASE_KEY = "sb_publishable_mWr-L1t1iJ77_LzYFUs8Wg_BMID6Ze-";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 앱 제어 핵심 상태 엔진 변수
let isStudentVerified = false;
let currentCategory = 'all';
let userNickname = localStorage.getItem('stalk_nick') || "미인증_주주";
let userPoints = parseInt(localStorage.getItem('stalk_points')) || 100;
let userAvatar = localStorage.getItem('stalk_avatar') || "👤";

// 주말 대회 데이터 모델
let myVirtualProfit = parseFloat(localStorage.getItem('virtual_profit')) || 0.0;
let myVirtualMoney = parseInt(localStorage.getItem('virtual_money')) || 0;

// 🔥 신규: 소셜 네트워크 시스템 로컬 상태 레이어
let followingList = JSON.parse(localStorage.getItem('stalk_following') || '[]');
let followersCount = parseInt(localStorage.getItem('stalk_followers_count')) || 0;
let activeChatPartner = null;

function initApp() {
  document.getElementById('user-nickname').innerText = userNickname;
  document.getElementById('user-points').innerText = userPoints;
  document.getElementById('user-avatar').innerText = userAvatar;
  
  updateSocialCounts();
  loadPosts();
  loadDiaries();
  loadRanking();
  updateVirtualUI();
  loadWeekendLeaderboard();
  renderChatRooms();
  
  setInterval(simulateVirtualMarket, 3000);
}

// 소셜 팔로우 개수 뷰포트 드라이버
function updateSocialCounts() {
  document.getElementById('following-count').innerText = followingList.length;
  document.getElementById('followers-count').innerText = followersCount;
}

// 1. 프로필 관리 매니저
function updateProfile() {
  const input = document.getElementById('changeNicknameInput').value.trim();
  if(!input) return alert('변경하고자 하는 신규 인공지능 페르소나 닉네임을 적어주세요.');
  if(input.length > 10) return alert('닉네임은 최대 10자까지만 허용됩니다.');
  
  userNickname = input;
  localStorage.setItem('stalk_nick', userNickname);
  document.getElementById('user-nickname').innerText = userNickname;
  document.getElementById('changeNicknameInput').value = '';
  
  const avatars = ["🦊", "🐱", "🦁", "🐸", "🐹", "🚀", "💎", "🎯", "⚡"];
  userAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  localStorage.setItem('stalk_avatar', userAvatar);
  document.getElementById('user-avatar').innerText = userAvatar;
  
  addNotification(`내 프로필 아이덴티티가 [${userNickname}] 캐릭터로 갱신되었습니다.`);
  loadPosts();
  loadRanking();
  loadWeekendLeaderboard();
}

function gainPoints(amount) {
  userPoints += amount;
  localStorage.setItem('stalk_points', userPoints);
  document.getElementById('user-points').innerText = userPoints;
  loadRanking();
}

function addNotification(message) {
  const box = document.getElementById('notification-box');
  if (!box) return;
  if (box.querySelector('.italic')) box.innerHTML = '';
  
  const p = document.createElement('p');
  p.className = 'border-b border-zinc-800/60 pb-2 text-zinc-300 font-medium tracking-tight';
  p.innerHTML = `✨ ${message}`;
  box.insertBefore(p, box.firstChild);
}

// 싱글 레이어 모듈식 내비게이션 컨트롤러
function showSection(sectionId) {
  ['feed-section', 'dm-section', 'diary-section', 'weekend-section', 'ranking-section'].forEach(id => {
    const sec = document.getElementById(id);
    if (sec) sec.classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
  
  ['menu-feed', 'menu-dm', 'menu-diary', 'menu-weekend', 'menu-ranking'].forEach(id => {
    const menu = document.getElementById(id);
    if (menu) menu.className = "w-full text-left px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-zinc-800/50 transition";
  });
  
  const activeMenuMap = {
    'feed-section': 'menu-feed', 
    'dm-section': 'menu-dm',
    'diary-section': 'menu-diary', 
    'weekend-section': 'menu-weekend',
    'ranking-section': 'menu-ranking'
  };
  document.getElementById(activeMenuMap[sectionId]).className = "w-full text-left px-4 py-2.5 rounded-xl text-sm bg-zinc-800 text-white font-bold transition";
}

function filterCategory(category) {
  currentCategory = category;
  ['all', 'domestic', 'global', 'qna'].forEach(cat => {
    const btn = document.getElementById(`cat-${cat}`);
    if (btn) btn.className = "bg-surface border border-border px-4 py-1.5 rounded-full text-xs text-zinc-400 whitespace-nowrap transition";
  });
  const activeBtn = document.getElementById(`cat-${category}`);
  if (activeBtn) activeBtn.className = "bg-zinc-800 px-4 py-1.5 rounded-full text-xs text-neon font-bold whitespace-nowrap transition";
  loadPosts();
}

function verifyStudent() {
  if(isStudentVerified) return alert('이미 인스티튜션 인증이 완료된 상위 정주주 프로필입니다.');
  isStudentVerified = true;
  document.getElementById('auth-status').innerHTML = `인증 상태: <span class="text-neon font-bold">★ 학생 정주주 Verified</span>`;
  gainPoints(50);
  addNotification('학생 연동 도메인 하이패스 통과! 웰컴 보너스 +50p 획득.');
}

// 🔥 신규: 소셜 팔로우/언팔로우 토글 허브
function toggleFollow(targetName) {
  if(targetName === userNickname) return alert('본인 자신은 팔로우 크루로 매핑할 수 없습니다.');
  
  const index = followingList.indexOf(targetName);
  if(index > -1) {
    followingList.splice(index, 1);
    addNotification(`[${targetName}] 님을 팔로우 취소했습니다.`);
  } else {
    followingList.push(targetName);
    addNotification(`[${targetName}] 님을 팔로우하기 시작했습니다. 네트워킹 커넥트 연결 완료!`);
    gainPoints(5);
  }
  localStorage.setItem('stalk_following', JSON.stringify(followingList));
  updateSocialCounts();
  loadPosts();
  loadRanking();
}

// 🔥 신규: 다이렉트 메시지(DM) 윈도우 인터페이스 브릿지
function openDM(targetName) {
  activeChatPartner = targetName;
  showSection('dm-section');
  
  document.getElementById('dm-window-header').innerText = `💬 [${targetName}] 주주님과의 DM 채널`;
  document.getElementById('dmInput').disabled = false;
  document.getElementById('dmSendBtn').disabled = false;
  
  // 채팅방 리스트 강제 보정 후 다이렉트 렌더링
  let rooms = JSON.parse(localStorage.getItem('dm_rooms') || '[]');
  if(!rooms.includes(targetName)) {
    rooms.push(targetName);
    localStorage.setItem('dm_rooms', JSON.stringify(rooms));
  }
  
  renderChatRooms();
  loadDMMessages();
}

function renderChatRooms() {
  const container = document.getElementById('dm-rooms-list');
  if(!container) return;
  
  let rooms = JSON.parse(localStorage.getItem('dm_rooms') || '[]');
  if(rooms.length === 0) {
    container.innerHTML = `<p class="p-4 text-zinc-600 text-center text-[11px] italic">활성화된 개인 대화 채널이 존재하지 않습니다.</p>`;
    return;
  }
  
  container.innerHTML = '';
  rooms.forEach(room => {
    const activeClass = activeChatPartner === room ? 'bg-zinc-800 text-neon' : 'hover:bg-zinc-900 text-zinc-300';
    const div = document.createElement('div');
    div.className = `p-3 text-xs font-bold cursor-pointer transition ${activeClass}`;
    div.innerText = `👤 ${room}`;
    div.onclick = () => openDM(room);
    container.appendChild(div);
  });
}

function loadDMMessages() {
  const box = document.getElementById('dm-messages-box');
  if(!box || !activeChatPartner) return;
  
  const chatKey = `dm_log_${[userNickname, activeChatPartner].sort().join('_')}`;
  const logs = JSON.parse(localStorage.getItem(chatKey) || '[]');
  
  if(logs.length === 0) {
    box.innerHTML = `<p class="text-zinc-600 text-center italic pt-24">[${activeChatPartner}] 님과의 안전한 대화가 열렸습니다. 분석 보안 메시지를 전송해 보세요.</p>`;
    return;
  }
  
  box.innerHTML = '';
  logs.forEach(msg => {
    const isMe = msg.sender === userNickname;
    const div = document.createElement('div');
    div.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
    div.innerHTML = `
      <div class="max-w-[75%] p-2.5 rounded-xl border leading-relaxed break-all ${isMe ? 'bg-neon/10 border-neon/30 text-zinc-100' : 'bg-zinc-900 border-border text-zinc-300'}">
        <div class="font-bold text-[10px] text-zinc-400 mb-0.5">${msg.sender}</div>
        <div>${msg.text}</div>
      </div>
    `;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

function sendDirectMessage() {
  const input = document.getElementById('dmInput');
  if(!input || !input.value.trim() || !activeChatPartner) return;
  
  const chatKey = `dm_log_${[userNickname, activeChatPartner].sort().join('_')}`;
  const logs = JSON.parse(localStorage.getItem(chatKey) || '[]');
  
  logs.push({ sender: userNickname, text: input.value.trim(), ts: Date.now() });
  localStorage.setItem(chatKey, JSON.stringify(logs));
  
  input.value = '';
  loadDMMessages();
}

// 🔥 신규: 포스트 링크 공유 클립보드 가상화 API
function sharePost(title) {
  alert(`🔗 공유 링크가 복사되었습니다!\n대상 분석 리포트: [${title}]`);
  addNotification(`[${title}] 종목 리서치 데이터를 외부 플랫폼으로 공유 링크 포워딩했습니다.`);
  gainPoints(2);
}

// 🔥 신규: 리포스트(재게시) 미들웨어 핸들러
async function repostPost(title, content, category) {
  const confirmRepost = confirm(`♻️ 이 주주 분석 리포트를 내 피드로 리포스트(재게시) 하시겠습니까?`);
  if(!confirmRepost) return;
  
  const { error } = await supabaseClient.from('posts').insert([
    { 
      title: `[♻️ 리포스트] ${title}`, 
      content: `원문 출처 피드 가속 데이터 고도화 공유:\n---\n${content}`, 
      category: category,
      nickname: userNickname
    }
  ]);
  
  if(!error) {
    addNotification(`[${title}] 리포트를 내 타임라인 피드로 성공적으로 재게시 완료했습니다.`);
    gainPoints(5);
    loadPosts();
  }
}

// 🔥 신규: 투표(Poll) 데이터 트랜잭션 핸들러
function votePoll(postId, optionIndex) {
  const votedKey = `voted_${postId}`;
  if(localStorage.getItem(votedKey)) return alert('이 시장 진단 투표에는 이미 의견을 반영하셨습니다.');
  
  let votes = JSON.parse(localStorage.getItem(`poll_votes_${postId}`) || '[0, 0]');
  votes[optionIndex] += 1;
  localStorage.setItem(`poll_votes_${postId}`, JSON.stringify(votes));
  localStorage.setItem(votedKey, 'true');
  
  addNotification('시장 예측 투표 풀에 소중한 오피니언 지표를 반영 완료했습니다.');
  gainPoints(3);
  loadPosts();
}

// 2. 주말 모의투자 시뮬레이션 머신
function simulateVirtualMarket() {
  if(!document.getElementById('stock-price-1')) return;
  
  const change1 = (Math.random() * 6 - 3).toFixed(1);
  const change2 = (Math.random() * 8 - 4).toFixed(1);
  
  const p1 = Math.floor(65000 + Math.random() * 5000);
  const p2 = Math.floor(11000 + Math.random() * 2000);
  
  document.getElementById('stock-price-1').innerText = `${p1.toLocaleString()}원 (${change1 >= 0 ? '+' : ''}${change1}%)`;
  document.getElementById('stock-price-1').className = `text-xs font-mono mt-0.5 ${change1 >= 0 ? 'text-red-400' : 'text-blue-400'}`;
  
  document.getElementById('stock-price-2').innerText = `${p2.toLocaleString()}원 (${change2 >= 0 ? '+' : ''}${change2}%)`;
  document.getElementById('stock-price-2').className = `text-xs font-mono mt-0.5 ${change2 >= 0 ? 'text-red-400' : 'text-blue-400'}`;
}

function tradeVirtualStock(stockName, effect) {
  myVirtualProfit += effect + (Math.random() * 2 - 1);
  myVirtualMoney += effect * Math.floor(Math.random() * 15000 + 5000);
  
  localStorage.setItem('virtual_profit', myVirtualProfit.toFixed(2));
  localStorage.setItem('virtual_money', myVirtualMoney);
  
  updateVirtualUI();
  loadWeekendLeaderboard();
  addNotification(`[${stockName}] 주말 가상 포지션을 변경하여 실시간 포트가 요동칩니다.`);
}

function updateVirtualUI() {
  if(!document.getElementById('my-virtual-profit')) return;
  document.getElementById('my-virtual-profit').innerText = `${myVirtualProfit >= 0 ? '+' : ''}${myVirtualProfit.toFixed(2)}%`;
  document.getElementById('my-virtual-profit').className = `font-bold ${myVirtualProfit >= 0 ? 'text-red-400' : 'text-blue-400'}`;
  document.getElementById('my-virtual-money').innerText = `${myVirtualMoney.toLocaleString()}원`;
}

function loadWeekendLeaderboard() {
  const leaderboard = document.getElementById('weekend-leaderboard');
  if(!leaderboard) return;
  
  const competitors = [
    { name: "🤖 테슬라귀신", profit: 14.50 },
    { name: "🤖 리버모어공", profit: 8.25 },
    { name: "🤖 나스닥고딩", profit: -2.10 },
    { name: `${userAvatar} 나 (${userNickname})`, profit: myVirtualProfit }
  ];
  
  competitors.sort((a, b) => b.profit - a.profit);
  leaderboard.innerHTML = '';
  
  competitors.forEach((c, index) => {
    const div = document.createElement('div');
    div.className = 'p-4 flex justify-between items-center text-sm bg-zinc-900/20';
    div.innerHTML = `
      <span class="font-bold text-zinc-300">${index + 1}위. ${c.name}</span>
      <span class="font-mono font-bold ${c.profit >= 0 ? 'text-red-400' : 'text-blue-400'}">${c.profit >= 0 ? '+' : ''}${c.profit.toFixed(2)}%</span>
    `;
    leaderboard.appendChild(div);
  });
}

function endWeekendTournament() {
  const competitors = [
    { id: 'bot1', name: "테슬라귀신", profit: 14.50 },
    { id: 'bot2', name: "리버모어공", profit: 8.25 },
    { id: 'bot3', name: "나스닥고딩", profit: -2.10 },
    { id: 'user', name: userNickname, profit: myVirtualProfit }
  ];
  
  competitors.sort((a, b) => b.profit - a.profit);
  const myRank = competitors.findIndex(c => c.id === 'user') + 1;
  
  let rewardPoints = 0;
  if(myRank === 1) rewardPoints = 100;
  else if(myRank === 2) rewardPoints = 50;
  else if(myRank === 3) rewardPoints = 30;
  
  if(rewardPoints > 0) {
    gainPoints(rewardPoints);
    alert(`🎉 대회 정산 완료!\n축하합니다! 주말 가상 리그 [${myRank}등] 달성으로 ${rewardPoints}p가 차등 지급되었습니다!`);
  } else {
    alert(`대회 정산 완료!\n아쉽게도 ${myRank}등을 기록하여 3위권 진입에 실패했습니다.`);
  }
  
  myVirtualProfit = 0.0;
  myVirtualMoney = 0;
  localStorage.setItem('virtual_profit', '0.00');
  localStorage.setItem('virtual_money', '0');
  updateVirtualUI();
  loadWeekendLeaderboard();
}

// 3. Supabase 연동 코어 데이터 스트리밍
async function loadPosts() {
  const { data, error } = await supabaseClient.from('posts').select('*').order('id', { ascending: false });
  if (error) return console.error("데이터 통신 장애 피드 실패:", error);

  const feed = document.getElementById('feed');
  if (!feed) return;
  feed.innerHTML = '';
  
  const filteredData = data.filter(post => currentCategory === 'all' || post.category === currentCategory);

  if(filteredData.length === 0) {
    feed.innerHTML = `<div class="text-center py-16 text-zinc-500 text-sm italic border border-dashed border-border rounded-2xl">누적된 오피니언 데이터 피드가 비어있습니다.</div>`;
    return;
  }

  filteredData.forEach(post => {
    const likesCount = localStorage.getItem(`likes_${post.id}`) || 0;
    const isBookmarked = localStorage.getItem(`bookmark_${post.id}`) === 'true';
    const commentsList = JSON.parse(localStorage.getItem(`comments_${post.id}`) || '[]');
    
    // 소셜 팔로우 스타일 제어 및 매칭
    const isFollowing = followingList.includes(post.nickname);
    const followBtnText = isFollowing ? '✓ 팔로잉 중' : '➕ 팔로우';
    const followBtnClass = isFollowing ? 'text-neon bg-neon/10 px-2 py-0.5 rounded' : 'text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded';

    // 투표 컴포넌트 데이터 팩토리 빌딩 (title에 임베딩 기법 활용 또는 로컬 연산 매핑)
    let pollHTML = '';
    const hasPoll = post.title.includes('📊'); 
    if(hasPoll) {
      const votes = JSON.parse(localStorage.getItem(`poll_votes_${post.id}`) || '[4, 2]');
      const totalVotes = votes[0] + votes[1] || 1;
      const p1 = ((votes[0] / totalVotes) * 100).toFixed(0);
      const p2 = ((votes[1] / totalVotes) * 100).toFixed(0);

      pollHTML = `
        <div class="bg-zinc-900/60 p-3.5 rounded-xl border border-border/80 my-2 space-y-2 text-xs">
          <div class="font-bold text-zinc-400">📊 주주 실시간 포지션 투표 현황</div>
          <button onclick="votePoll(${post.id}, 0)" class="w-full bg-zinc-950 hover:bg-zinc-900 border border-border p-2 rounded-lg flex justify-between items-center transition">
            <span>👍 매수 리스크 베팅</span> <span class="font-mono text-neon font-bold">${p1}% (${votes[0]}표)</span>
          </button>
          <button onclick="votePoll(${post.id}, 1)" class="w-full bg-zinc-950 hover:bg-zinc-900 border border-border p-2 rounded-lg flex justify-between items-center transition">
            <span>👎 매도 헷지 가속</span> <span class="font-mono text-purple-400 font-bold">${p2}% (${votes[1]}표)</span>
          </button>
        </div>
      `;
    }

    let commentsHTML = '';
    commentsList.forEach(c => {
      commentsHTML += `
        <div class="bg-zinc-900/80 p-2.5 rounded-xl text-xs border border-zinc-800/80 space-y-0.5">
          <span class="font-bold text-zinc-300">👤 ${c.writer}</span>
          <p class="text-zinc-400 pl-1 break-all">${c.text}</p>
        </div>
      `;
    });

    const article = document.createElement('article');
    article.className = 'bg-surface p-5 rounded-2xl border border-border space-y-3.5 text-left transition duration-200 hover:border-zinc-700 min-w-0 break-words';
    article.innerHTML = `
      <div class="flex justify-between items-start gap-2">
        <div class="flex items-center gap-2 text-xs min-w-0 flex-wrap">
          <div class="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center font-bold shrink-0">👤</div>
          <span class="font-bold text-zinc-200 truncate max-w-[100px]">${post.nickname || '익명 주주'}</span>
          
          <!-- 팔로우 및 DM 제어 컴포넌트 소스 -->
          ${post.nickname !== userNickname ? `
            <button onclick="toggleFollow('${post.nickname}')" class="${followBtnClass} font-bold tracking-tight text-[10px] transition">${followBtnText}</button>
            <button onclick="openDM('${post.nickname}')" class="text-zinc-400 hover:text-neon bg-zinc-800/50 px-2 py-0.5 rounded text-[10px] font-bold transition">💬 DM</button>
          ` : ''}

          <span class="text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded text-[10px] font-mono border border-border shrink-0">
            ${post.category === 'domestic' ? '국내주식' : post.category === 'global' ? '해외주식' : post.category === 'qna' ? '질문/퀴즈' : '일반토론'}
          </span>
        </div>
        <button onclick="deletePost(${post.id})" class="text-zinc-600 hover:text-red-400 text-xs transition shrink-0">[삭제]</button>
      </div>
      
      <h3 class="text-base font-bold text-zinc-100 leading-snug break-all">${post.title}</h3>
      <p class="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed break-all">${post.content}</p>
      
      <!-- 투표 섹션 마운트 -->
      ${pollHTML}

      <div class="flex items-center justify-between pt-1 text-xs text-zinc-400 font-bold border-b border-zinc-800/80 pb-3.5 flex-wrap gap-2">
        <div class="flex gap-5">
          <button onclick="toggleLike(${post.id})" class="hover:text-red-400 flex items-center gap-1 transition">❤️ 공감 <span class="text-red-400 font-mono">${likesCount}</span></button>
          <button onclick="toggleBookmark(${post.id})" class="${isBookmarked ? 'text-yellow-400' : 'hover:text-yellow-400'} transition flex items-center gap-1">🔖 분석보관</button>
        </div>
        
        <!-- 🔥 신규: 리포스트 및 공유 액션 어셈블리 -->
        <div class="flex gap-3 text-[11px] font-medium">
          <button onclick="repostPost('${post.title}', '${post.content}', '${post.category}')" class="text-zinc-400 hover:text-neon flex items-center gap-0.5 transition">♻️ 리포스트</button>
          <button onclick="sharePost('${post.title}')" class="text-zinc-400 hover:text-blue-400 flex items-center gap-0.5 transition">🔗 공유</button>
        </div>
      </div>

      <div class="space-y-2 pt-1">
        <div id="comments-box-${post.id}" class="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
          ${commentsHTML ? commentsHTML : '<p class="text-[11px] text-zinc-600 pl-1 italic">참여한 정밀 리포트 댓글 분과가 비어있습니다.</p>'}
        </div>
        <div class="flex gap-1.5 pt-1">
          <input id="comment-input-${post.id}" type="text" placeholder="분석 피드백 의견을 개진해 주세요..." class="w-full bg-zinc-900 border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neon">
          <button onclick="addComment(${post.id})" class="bg-zinc-800 hover:bg-zinc-700 border border-border text-white px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition">등록</button>
        </div>
      </div>
    `;
    feed.appendChild(article);
  });
}

// 4. Supabase 트랜잭션 안전 파이프라인 인서트 프로토콜
async function addPost() {
  let title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const category = document.getElementById('postCategory').value;
  
  const opt1 = document.getElementById('pollOption1').value.trim();
  const opt2 = document.getElementById('pollOption2').value.trim();
  
  if (!title || !content) return alert('포스팅용 스키마 타이틀과 본문을 기입해 주세요.');

  // 투표 입력 상태 감지 시 가상 타이틀 식별 심볼 컴파일 플러그인
  if(opt1 && opt2) {
    title = `📊 [의견투표] ${title}`;
  }

  // 스키마 대응 최적 구조화 업로드
  const { data, error } = await supabaseClient.from('posts').insert([
    { 
      title: title, 
      content: content, 
      category: category,
      nickname: userNickname
    }
  ]).select();
  
  if (error) return alert('트랜잭션 가용성에러 발생: ' + error.message);

  // 투표 초기 백업 인덱스 마운팅 구조체 바인딩
  if(opt1 && opt2 && data && data[0]) {
    localStorage.setItem(`poll_votes_${data[0].id}`, JSON.stringify([0, 0]));
  }

  document.getElementById('postTitle').value = '';
  document.getElementById('postContent').value = '';
  document.getElementById('pollOption1').value = '';
  document.getElementById('pollOption2').value = '';
  
  gainPoints(10); 
  addNotification(`새 리서치 포스트 [${title}] 컴포넌트 빌드 완료. (+10p)`);
  loadPosts();
}

async function deletePost(id) {
  if(!confirm("해당 분석 블록을 영구 소멸시키겠습니까?")) return;
  const { error } = await supabaseClient.from('posts').delete().eq('id', id);
  if(!error) {
    addNotification(`분석 노드가 유실 없이 파기 처리되었습니다.`);
    loadPosts();
  }
}

function toggleLike(id) {
  let count = parseInt(localStorage.getItem(`likes_${id}`) || 0);
  localStorage.setItem(`likes_${id}`, count + 1);
  gainPoints(2);
  loadPosts();
}

function toggleBookmark(id) {
  const current = localStorage.getItem(`bookmark_${id}`) === 'true';
  localStorage.setItem(`bookmark_${id}`, !current);
  addNotification(!current ? "리서치 포트폴리오 스토리지 보관" : "보관 해제");
  loadPosts();
}

function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if(!input || !input.value.trim()) return alert('댓글 본문을 기입하세요.');

  const commentsList = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
  commentsList.push({ writer: userNickname, text: input.value.trim() });
  localStorage.setItem(`comments_${postId}`, JSON.stringify(commentsList));
  input.value = '';
  
  gainPoints(5);
  loadPosts();
}

// 5. 오답노트 보관 모듈
function addDiary() {
  const profit = document.getElementById('diaryProfit').value.trim();
  const title = document.getElementById('diaryTitle').value.trim();
  const content = document.getElementById('diaryContent').value.trim();
  
  if(!profit || !title || !content) return alert('일지 필수 파라미터 누락.');

  const diaries = JSON.parse(localStorage.getItem('diaries') || '[]');
  diaries.unshift({ profit, title, content, date: new Date().toLocaleDateString() });
  localStorage.setItem('diaries', JSON.stringify(diaries));

  document.getElementById('diaryProfit').value = '';
  document.getElementById('diaryTitle').value = '';
  document.getElementById('diaryContent').value = '';
  
  gainPoints(15);
  addNotification(`[${title}] 매매 일지가 인덱스에 압축 마운트되었습니다. (+15p)`);
  loadDiaries();
}

function loadDiaries() {
  const list = document.getElementById('diary-list');
  if (!list) return;
  list.innerHTML = '';
  const diaries = JSON.parse(localStorage.getItem('diaries') || '[]');
  
  diaries.forEach(d => {
    const div = document.createElement('div');
    div.className = 'bg-surface p-4 rounded-2xl border border-border flex justify-between items-center text-left gap-4 min-w-0';
    const isPlus = parseFloat(d.profit) >= 0;
    div.innerHTML = `
      <div class="space-y-1 min-w-0 flex-1">
        <span class="text-[10px] text-zinc-500 font-mono font-bold">${d.date}</span>
        <h4 class="font-bold text-sm text-zinc-200 truncate">${d.title}</h4>
        <p class="text-xs text-zinc-400 break-all leading-relaxed">${d.content}</p>
      </div>
      <span class="px-3 py-1 rounded-xl text-xs font-mono font-black shrink-0 ${isPlus ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}">
        ${isPlus ? '▲ +' : '▼ '}${d.profit}%
      </span>
    `;
    list.appendChild(div);
  });
}

function loadRanking() {
  const rankingList = document.getElementById('ranking-list');
  if(!rankingList) return;
  
  const users = [
    { name: "👑 자산가_김개미", points: 2450 },
    { name: "🥈 스톡마스터", points: 1890 },
    { name: "🥉 테슬라중학생", points: 1200 },
    { name: `${userAvatar} 나 (${userNickname})`, points: userPoints }
  ];

  users.sort((a, b) => b.points - a.points);
  rankingList.innerHTML = '';
  
  users.forEach((u, index) => {
    let badgeText = `${index + 1}위`;
    let colorClass = "text-zinc-400";
    if (index === 0) { badgeText = "1위🥇"; colorClass = "text-neon"; }
    if (index === 1) { badgeText = "2위🥈"; colorClass = "text-zinc-200"; }
    if (index === 2) { badgeText = "3위🥉"; colorClass = "text-zinc-300"; }

    const div = document.createElement('div');
    div.className = 'p-4 flex justify-between items-center text-sm hover:bg-zinc-800/10 transition';
    div.innerHTML = `
      <span class="font-bold ${colorClass}">${badgeText} ${u.name}</span>
      <span class="text-xs text-zinc-400 font-mono">통합 자산 ${u.points.toLocaleString()}p</span>
    `;
    rankingList.appendChild(div);
  });
}

initApp();

function joinTournament() {
  alert("대회에 참가했습니다! 실시간 수익률을 확인하세요.");
  gainPoints(100); // 참가 포인트 지급 예시
}

function saveDebate() {
  const input = document.getElementById('debateInput');
  const list = document.getElementById('debate-list');
  if(input.value) {
    list.innerHTML += `<div class="p-2 border-b border-zinc-800 text-xs">${userNickname}: ${input.value}</div>`;
    input.value = '';
  }
}

function checkQuiz(isCorrect) {
  alert(isCorrect ? "정답입니다! 50p 획득!" : "틀렸습니다. 다시 도전하세요!");
  if(isCorrect) gainPoints(50);
}


async function addPostWithPoll() {
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  // 사용자 입력 예시: "매수 리스크 베팅, 매도 헷지 가속, 관망" -> ['매수 리스크 베팅', '매도 헷지 가속', '관망']
  const optionsInput = document.getElementById('pollOptions').value; 
  const options = optionsInput.split(',').map(item => item.trim());

  const { error } = await supabaseClient
    .from('posts')
    .insert([{ title, content, options: options, votes: new Array(options.length).fill(0) }]);
  
  if (error) alert(error.message);
}

// [핵심] 토론 기능 함수
function saveDebate() {
  const input = document.getElementById('debateInput');
  const list = document.getElementById('debate-list');
  if(!input.value.trim()) return alert('의견을 입력하세요!');
  
  const div = document.createElement('div');
  div.className = "p-3 border-b border-zinc-800 text-sm animate-fade-in";
  div.innerHTML = `<span class="font-bold text-neon">${userNickname}:</span> ${input.value}`;
  list.prepend(div); // 최신글이 위로
  input.value = '';
}

// [핵심] 퀴즈 기능 함수
function checkQuiz(isCorrect) {
  if(isCorrect) {
    alert("정답입니다! 50p 획득!");
    gainPoints(50);
  } else {
    alert("오답입니다. 다시 생각해보세요!");
  }
}

// [핵심] 대회 참가 함수
function joinTournament() {
  alert("대회에 참가했습니다! 랭킹을 확인하세요.");
}