// --- 글로벌 코어 데이터 모델 상태 관리 ---
let userState = null;
let globalTheme = 'white';

let feedData = [
    { id: 1, user: '나스닥고딩선배', age: 18, title: '엔비디아 분할 후 매수 진입 타이밍', content: '실시간 상향 서포트 라인 터치 직전이라 분할 매수 들어가기 좋은 평단가인 것 같아. 무턱대고 숏 잡지 말고 형 분석 피드 정독해.', likes: 128, liked: false, saved: false, tag: '엔비디아', poll: { a: '형 분석 믿음', b: '청개구리 숏 간다', va: 84, vb: 19 } },
    { id: 2, user: '한강뷰갈중3', age: 16, title: '주말 모의투자대회 팀원 버스 태워줄 사람 구함', content: '수익률 가상 시드 인증 가능해! 포인트 쓸어 담아서 이번 주말에 기프티콘 상점에서 네이버페이로 환전하러 갈 파티원 구함.', likes: 64, liked: false, saved: false, tag: '삼성전자', poll: null }
];

let diaryData = [
    { id: 1, date: '2026-06-03', rate: 4.8, text: '삼전 주주방 실시간 대화 흐름 파악 후 거래 체결 성공적 마무리.' }
];

let rankingsData = [
    { rank: 1, name: '워렌버핏고교생', age: 19, rate: 84.12, progress: 95 },
    { rank: 2, name: '한강뷰갈중3', age: 16, rate: 41.52, progress: 65 },
    { rank: 3, name: '급식주식왕', age: 18, rate: 22.10, progress: 40 }
];

// --- 인증 및 온보딩 핸들러 시스템 ---
function toggleAuthMode(isLogin) {
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', isLogin);
}

function executeRegister() {
    const id = document.getElementById('reg-id').value.trim();
    const nick = document.getElementById('reg-nick').value.trim();
    const age = document.getElementById('reg-age').value;

    if (!id || !nick) {
        alert('모든 가입 폼 데이터를 정밀하게 채워주세요!');
        return;
    }

    userState = { id, nick, age: parseInt(age), chips: 500, followers: 48 };
    document.getElementById('welcome-sheet').style.display = 'flex';
}

function closeWelcomeSheet() {
    document.getElementById('welcome-sheet').style.display = 'none';
    bootAppMain();
}

function executeLogin() {
    const id = document.getElementById('login-id').value.trim();
    if (!id) {
        alert('아이디를 바르게 기재해 주세요.');
        return;
    }

    userState = { id, nick: '주린이중3', age: 16, chips: 500, followers: 48 };
    bootAppMain();
}

function bootAppMain() {
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    updateProfileDisplay();
    drawFeedTimeline();
    drawLeagueRankings();
    drawDiaries();
}

function executeLogout() {
    userState = null;
    document.getElementById('screen-main').classList.add('hidden');
    document.getElementById('screen-auth').classList.remove('hidden');
}

// --- 네비게이션 및 테마 제어 로직 ---
function navigateTab(targetId, navButton) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.dock-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(`view-${targetId}`).classList.add('active');
    navButton.classList.add('active');
}

function switchTheme() {
    globalTheme = globalTheme === 'white' ? 'dark' : 'white';
    document.documentElement.setAttribute('data-theme', globalTheme);
    const btn = document.getElementById('theme-btn');
    btn.className = globalTheme === 'white' ? 'fas fa-moon' : 'fas fa-sun';
}

// --- 프로필 관리 모듈 ---
function updateProfileDisplay() {
    document.getElementById('profile-nick-display').innerText = userState.nick;
    document.getElementById('profile-age-display').innerText = `${userState.age}세`;
    document.getElementById('profile-chips').innerText = `🪙 ${userState.chips} Chips`;
    document.getElementById('lbl-followers').innerText = userState.followers;
}

function rollAvatarImg() {
    const avatars = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"
    ];
    document.getElementById('user-avatar').src = avatars[Math.floor(Math.random() * avatars.length)];
}

// --- 피드 코어 타임라인 모듈 ---
function drawFeedTimeline() {
    const stream = document.getElementById('dynamic-timeline');
    stream.innerHTML = '';

    feedData.forEach(p => {
        const wrap = document.createElement('div');
        wrap.className = 'card post-card';
        wrap.innerHTML = `
            <div class="post-meta">
                <div class="post-profile">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100">
                    <div>
                        <div class="post-author">${p.user} <span class="post-tag">${p.age}세</span></div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">인기태그: ${p.tag}</div>
                    </div>
                </div>
                <i class="fas fa-shield-alt" style="color: var(--text-muted); cursor: pointer;" onclick="triggerReportSheet()"></i>
            </div>
            <div class="post-body">
                <h4>${p.title}</h4>
                <p>${p.content}</p>
            </div>
            ${p.poll ? `
                <div class="poll-area">
                    <div class="poll-row" onclick="castVote(${p.id}, 'a')"><span>🅰 ${p.poll.a}</span><span style="color: var(--color-blue); font-weight: 700;">${p.poll.va}표</span></div>
                    <div class="poll-row" onclick="castVote(${p.id}, 'b')"><span>🅱 ${p.poll.b}</span><span style="color: var(--text-muted); font-weight: 700;">${p.poll.vb}표</span></div>
                </div>
            ` : ''}
            <div class="post-actions">
                <div class="action-item ${p.liked ? 'active-heart' : ''}" onclick="engageHeart(${p.id})"><i class="fas fa-heart"></i> ${p.likes}</div>
                <div class="action-item ${p.saved ? 'active-bookmark' : ''}" onclick="engageBookmark(${p.id})"><i class="fas fa-bookmark"></i> 저장</div>
                <div class="action-item" onclick="alert('나의 개인 스페이스로 공유 피드가 복사되었습니다.')"><i class="fas fa-retweet"></i> 리포스트</div>
                <div class="action-item" onclick="openDirectMessage('${p.user}')"><i class="fas fa-paper-plane"></i> 1:1 디엠</div>
            </div>
        `;
        stream.appendChild(wrap);
    });
}

function submitNewPost() {
    const title = document.getElementById('feed-title').value.trim();
    const text = document.getElementById('feed-text').value.trim();
    const opt1 = document.getElementById('feed-opt1').value.trim();
    const opt2 = document.getElementById('feed-opt2').value.trim();

    if (!title || !text) {
        alert('제목과 본문을 제대로 완성해 주세요!');
        return;
    }

    let payload = {
        id: feedData.length + 1,
        user: userState.nick,
        age: userState.age,
        title: title,
        content: text,
        likes: 0, liked: false, saved: false,
        tag: '종합지수',
        poll: (opt1 && opt2) ? { a: opt1, b: opt2, va: 1, vb: 0 } : null
    };

    feedData.unshift(payload);
    userState.chips += 20;
    updateProfileDisplay();

    document.getElementById('feed-title').value = '';
    document.getElementById('feed-text').value = '';
    document.getElementById('feed-opt1').value = '';
    document.getElementById('feed-opt2').value = '';

    drawFeedTimeline();
    alert('피드가 성공적으로 공유되어 보상 20 Chips를 획득했습니다!');
}

function engageHeart(id) {
    const post = feedData.find(f => f.id === id);
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    drawFeedTimeline();
}

// 투표 조작 방지 상태 셋팅
const votedRecords = new Set();
function castVote(id, opt) {
    const voteKey = `${userState.id}-${id}`;
    if (votedRecords.has(voteKey)) {
        alert('이미 투표를 마친 게시물입니다.');
        return;
    }
    const post = feedData.find(f => f.id === id);
    if (opt === 'a') post.poll.va++;
    else post.poll.vb++;
    
    votedRecords.add(voteKey);
    drawFeedTimeline();
}

function engageBookmark(id) {
    const post = feedData.find(f => f.id === id);
    post.saved = !post.saved;
    drawFeedTimeline();
}

function filterStockRoom(name) {
    alert(`⚡ [실시간 채널] 대단위 트래픽 학생 전용 '${name}' 주주토크방에 연결되었습니다.`);
}

function triggerReportSheet() { document.getElementById('alert-sheet').style.display = 'flex'; }
	function closeNotificationSheet() { document.getElementById('alert-sheet').style.display = 'none'; }

// --- 투자 일기 및 성적 엔진 ---
function saveInvestmentDiary() {
    const rate = document.getElementById('diary-rate').value;
    const text = document.getElementById('diary-comment').value.trim();

    if (!rate || !text) {
        alert('수익률 데이터와 오늘의 반성 코멘트를 기입해주세요!');
        return;
    }

    diaryData.unshift({
        id: diaryData.length + 1,
        date: new Date().toISOString().slice(0,10),
        rate: parseFloat(rate),
        text: text
    });

    userState.chips += 30;
    updateProfileDisplay();

    document.getElementById('diary-rate').value = '';
    document.getElementById('diary-comment').value = '';
    drawDiaries();
}

function drawDiaries() {
    const area = document.getElementById('diary-timeline-space');
    area.innerHTML = '';
    diaryData.forEach(d => {
        area.innerHTML += `
            <div class="card" style="margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; font-weight: 700;">
                    <span style="color: var(--text-muted);">${d.date} 기록</span>
                    <span style="color: ${d.rate >= 0 ? 'var(--color-red)' : 'var(--color-blue)'}">수익률: ${d.rate}%</span>
                </div>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.4;">${d.text}</p>
            </div>
        `;
    });
}

// --- 토너먼트 및 랭킹 모듈 ---
function drawLeagueRankings() {
    const area = document.getElementById('league-container');
    area.innerHTML = '';
    rankingsData.forEach(r => {
        area.innerHTML += `
            <div class="rank-row">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="rank-num-badge rank-${r.rank}">${r.rank}</div>
                    <div>
                        <div style="font-weight: 700; font-size: 14px;">${r.name} <span style="font-size:11px; font-weight:normal; color:var(--text-muted);">${r.age}세</span></div>
                        <div class="profit-bar-bg"><div class="profit-bar-fill" style="width: ${r.progress}%"></div></div>
                    </div>
                </div>
                <span style="font-weight: 800; color: var(--color-red); font-size: 14px;">+${r.rate}%</span>
            </div>
        `;
    });
}

// --- 1:1 실시간 모의 메신저 레이어 모듈 ---
function openDirectMessage(username) {
    document.getElementById('target-dm-title').innerText = `@${username} 대화방`;
    document.getElementById('dm-chat-layer').style.display = 'flex';
    
    const stream = document.getElementById('chat-bubble-stream');
    stream.innerHTML = `
        <div style="background: var(--bg-card); border:1px solid var(--border-color); align-self: flex-start; padding: 12px 16px; border-radius: var(--radius-md); font-size: 13px; max-width: 80%; line-height: 1.4;">반갑습니다! 혹시 모의투자대회 정보공유 포트폴리오 연합 가능할까요? 😉</div>
    `;
}

function closeDirectMessage() { document.getElementById('dm-chat-layer').style.display = 'none'; }

function transmitMessage() {
    const inp = document.getElementById('chat-msg-input');
    if (!inp.value.trim()) return;

    const stream = document.getElementById('chat-bubble-stream');
    const bubble = document.createElement('div');
    bubble.setAttribute('style', 'background: var(--color-blue); color: white; align-self: flex-end; padding: 12px 16px; border-radius: var(--radius-md); font-size: 13px; max-width: 80%; line-height: 1.4;');
    bubble.innerText = inp.value;
    
    stream.appendChild(bubble);
    inp.value = '';
    stream.scrollTop = stream.scrollHeight;
}

// --- 리워드 스토어 기프티콘 비즈니스 로직 ---
function redeemGoods(name, price) {
    if (userState.chips < price) {
        alert(`보유 칩이 부족합니다! 주말 모의투자 토너먼트 상위권에 입상하거나 피드 업로드, 투자 일기 등을 부지런히 적어 보상 Chips를 먼저 파밍하세요.`);
        return;
    }
    userState.chips -= price;
    updateProfileDisplay();
    alert(`🎉 기프티콘 교환 성공!\n[${name}] 모바일 바코드가 학생인증 계정에 연결된 연락처 메신저로 투명하게 발송되었습니다.`);
}