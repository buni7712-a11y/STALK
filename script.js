const Storage = {
    get(key, fallback) {
        try {
            const data = localStorage.getItem(`stalk_${key}`);
            return data ? JSON.parse(data) : fallback;
        } catch(e) { return fallback; }
    },
    set(key, val) {
        try { localStorage.setItem(`stalk_${key}`, JSON.stringify(val)); } catch(e) {}
    }
};

// 🌟 감성적이고 귀여운 고화질 동물 일러스트 에셋 링크 매핑 (사람 얼굴 제거)
const animalAvatars = [
    "https://img.freepik.com/free-vector/cute-cool-fox-wearing-hoodie-cartoon-vector-icon-illustration-animal-fashion-icon-concept-isolated_138676-5740.jpg", // 여우
    "https://img.freepik.com/free-vector/cute-panda-with-boba-milk-tea-cartoon_138676-2443.jpg", // 판다
    "https://img.freepik.com/free-vector/cute-cat-wearing-dinosaur-hoodie-cartoon-vector-icon-illustration-animal-fashion-icon-isolated-white_138676-5257.jpg", // 고양이
    "https://img.freepik.com/free-vector/cute-koala-sleeping-tree-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium_138676-4874.jpg", // 코알라
    "https://img.freepik.com/free-vector/cute-rabbit-holding-carrot-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium_138676-4817.jpg", // 토끼
    "https://img.freepik.com/free-vector/cute-shiba-inu-dog-wearing-dinosaur-hoodie-cartoon-vector-icon-illustration-animal-fashion-isolated_138676-4749.jpg"  // 시바견
];

const defaultFeeds = [
    { id: 1, user: '익명여우선배', avatar: animalAvatars[0], age: 18, title: '엔비디아 주가 움직임 심상치 않다 📈', content: '차트 보니까 지지선 완벽하게 다진 느낌이야. 지금부터 분할 매수로 조금씩 담아두면 이번 달 리그에서 좋은 순위 먹을 수 있을 듯!', likes: 128, liked: false, saved: false, tag: '엔비디아', poll: { a: '나도 무조건 풀매수', b: '일단 조금 더 관망함', va: 84, vb: 19 } },
    { id: 2, user: '한강뷰갈중3', avatar: animalAvatars[3], age: 16, title: '주말 토너먼트 같이 나갈 팀원 구해요!', content: '벌써 12회차 리그네요. 저번 주말 리그 랭킹권 분들이나 기본 분석 지식 있는 고수 친구 한 명 구합니다. 같이 치킨 먹자!', likes: 64, liked: false, saved: false, tag: '삼성전자', poll: null }
];

const defaultDiaries = [
    { id: 1, date: '2026-06-03', rate: 4.8, text: '삼성전자 주주방 친구들 여론 확인하고 들어갔는데 오늘 타이밍 딱 맞았다. 일기 쓰니까 복기도 되고 포인트도 쌓여서 개이득!' }
];

const defaultRankings = [
    { rank: 1, name: '주식천재판다', age: 19, rate: 84.12, progress: 95 },
    { rank: 2, name: '한강뷰갈중3', age: 16, rate: 41.52, progress: 65 },
    { rank: 3, name: '급식주주왕토끼', age: 18, rate: 22.10, progress: 40 }
];

let userState = Storage.get('userState', null);
let feedData = Storage.get('feedData', defaultFeeds);
let diaryData = Storage.get('diaryData', defaultDiaries);
let rankingsData = Storage.get('rankingsData', defaultRankings);
let votedRecords = new Set(Storage.get('votedRecords', []));
let globalTheme = Storage.get('globalTheme', 'light');

window.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('data-theme', globalTheme);
    const btn = document.getElementById('theme-btn');
    if(btn) btn.innerHTML = globalTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    
    // 샘플 메시지 프로필 이미지 변경
    document.getElementById('dm-avatar-sample').src = animalAvatars[3];

    if (userState) {
        bootAppMain();
    } else {
        document.getElementById('screen-auth').classList.remove('hidden');
        document.getElementById('screen-main').classList.add('hidden');
    }
});

function toggleAuthMode(isLogin) {
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', isLogin);
}

function executeRegister() {
    const id = document.getElementById('reg-id').value.trim();
    const nick = document.getElementById('reg-nick').value.trim();
    const age = document.getElementById('reg-age').value;

    if (!id || !nick) {
        alert('아이디와 닉네임을 모두 적어주세요!');
        return;
    }

    // 회원가입 시 무작위 동물 아바타 지정
    const randomAvatar = animalAvatars[Math.floor(Math.random() * animalAvatars.length)];

    userState = { id, nick, age: parseInt(age), chips: 500, followers: 48, avatar: randomAvatar };
    Storage.set('userState', userState);
    document.getElementById('welcome-sheet').style.display = 'flex';
}

function closeWelcomeSheet() {
    document.getElementById('welcome-sheet').style.display = 'none';
    bootAppMain();
}

function executeLogin() {
    const id = document.getElementById('login-id').value.trim();
    if (!id) {
        alert('아이디를 입력해 주세요.');
        return;
    }

    userState = { id, nick: '초보판다주주', age: 16, chips: 500, followers: 48, avatar: animalAvatars[1] };
    Storage.set('userState', userState);
    bootAppMain();
}

function bootAppMain() {
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    updateProfileDisplay();
    drawFeedTimeline();
    drawLeagueRankings();
    drawDiaries();
    
    // 첫 기본 페이지 세팅
    const initialCell = document.querySelector('.dock-cell');
    navigateTab('feed', 0, initialCell);
}

function executeLogout() {
    localStorage.removeItem('stalk_userState');
    userState = null;
    document.getElementById('screen-main').classList.add('hidden');
    document.getElementById('screen-auth').classList.remove('hidden');
}

function switchTheme() {
    globalTheme = globalTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', globalTheme);
    Storage.set('globalTheme', globalTheme);
    document.getElementById('theme-btn').innerHTML = globalTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// 🌟 세련된 가로 슬라이딩 화면 전환 및 탭 바운스 피드백 함수
function navigateTab(targetId, pageIndex, navButton) {
    const slider = document.getElementById('main-slider');
    if (slider) {
        slider.style.transform = `translateX(-${pageIndex * 20}%)`;
    }
    
    document.querySelectorAll('.dock-cell').forEach(c => c.classList.remove('active'));
    navButton.classList.add('active');
}

function updateProfileDisplay() {
    if (!userState) return;
    document.getElementById('profile-nick-display').innerText = userState.nick;
    document.getElementById('profile-age-display').innerText = `${userState.age}세`;
    document.getElementById('profile-chips').innerText = `🪙 ${userState.chips} Chips`;
    document.getElementById('lbl-followers').innerText = userState.followers;
    document.getElementById('user-avatar').src = userState.avatar;
}

// 프로필 사진 변경 시 다른 동물 친구로 랜덤 매칭
function rollAvatarImg() {
    const current = userState.avatar;
    let filtered = animalAvatars.filter(a => a !== current);
    const picked = filtered[Math.floor(Math.random() * filtered.length)];
    
    userState.avatar = picked;
    Storage.set('userState', userState);
    updateProfileDisplay();
    showToastNotification("✨ 새로운 캐릭터 프로필로 변경되었어요!");
}

function drawFeedTimeline() {
    const timeline = document.getElementById('dynamic-timeline');
    if(!timeline) return;
    timeline.innerHTML = '';

    feedData.forEach(p => {
        const card = document.createElement('div');
        card.className = 'toss-card post-item-card';
        
        let pollMarkup = '';
        if (p.poll) {
            const total = p.poll.va + p.poll.vb || 1;
            const percentA = Math.round((p.poll.va / total) * 100);
            const percentB = Math.round((p.poll.vb / total) * 100);
            
            pollMarkup = `
                <div class="poll-render-zone">
                    <div class="poll-track" onclick="castVote(${p.id}, 'a')">
                        <div class="poll-fill-bar" style="width: ${percentA}%"></div>
                        <div class="poll-info-flex"><span>${p.poll.a}</span><span>${percentA}% (${p.poll.va}표)</span></div>
                    </div>
                    <div class="poll-track" onclick="castVote(${p.id}, 'b')">
                        <div class="poll-fill-bar" style="width: ${percentB}%"></div>
                        <div class="poll-info-flex"><span>${p.poll.b}</span><span>${percentB}% (${p.poll.vb}표)</span></div>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="post-top">
                <div class="profile-segment">
                    <img src="${p.avatar || animalAvatars[4]}" alt="user">
                    <div>
                        <div class="p-meta-nick">${p.user} <span class="age-tag">${p.age}세</span></div>
                        <div class="p-meta-sub">🔥 관련 주주방 : ${p.tag}</div>
                    </div>
                </div>
                <button class="icon-btn" onclick="triggerReportSheet()" style="font-size:14px;"><i class="fas fa-ellipsis-v"></i></button>
            </div>
            <div class="post-main">
                <h3>${p.title}</h3>
                <p>${p.content}</p>
            </div>
            ${pollMarkup}
            <div class="post-actions-flex">
                <button class="action-trigger ${p.liked ? 'active-heart' : ''}" onclick="engageHeart(${p.id})"><i class="fas fa-heart"></i> ${p.likes}</button>
                <button class="action-trigger ${p.saved ? 'active-bookmark' : ''}" onclick="engageBookmark(${p.id})"><i class="fas fa-bookmark"></i> 저장</button>
                <button class="action-trigger" onclick="openDirectMessage('${p.user}')"><i class="fas fa-paper-plane"></i> 대화하기</button>
            </div>
        `;
        timeline.appendChild(card);
    });
}

function submitNewPost() {
    const title = document.getElementById('feed-title').value.trim();
    const text = document.getElementById('feed-text').value.trim();
    const opt1 = document.getElementById('feed-opt1').value.trim();
    const opt2 = document.getElementById('feed-opt2').value.trim();

    if (!title || !text) {
        alert('제목과 내용을 입력해 주세요!');
        return;
    }

    const newPost = {
        id: Date.now(),
        user: userState ? userState.nick : '익명토끼',
        avatar: userState ? userState.avatar : animalAvatars[4],
        age: userState ? userState.age : 16,
        title: title,
        content: text,
        likes: 0, liked: false, saved: false,
        tag: '자유게시판',
        poll: (opt1 && opt2) ? { a: opt1, b: opt2, va: 1, vb: 0 } : null
    };

    feedData.unshift(newPost);
    if(userState) userState.chips += 20;
    
    Storage.set('feedData', feedData);
    Storage.set('userState', userState);

    document.getElementById('feed-title').value = '';
    document.getElementById('feed-text').value = '';
    document.getElementById('feed-opt1').value = '';
    document.getElementById('feed-opt2').value = '';

    updateProfileDisplay();
    drawFeedTimeline();
    showToastNotification("📝 글 작성이 성공적으로 완료되어 20칩을 얻었어요!");
}

function engageHeart(id) {
    const post = feedData.find(f => f.id === id);
    if(post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        Storage.set('feedData', feedData);
        drawFeedTimeline();
    }
}

// 🌟 난해하고 어려운 멘트 대신 직관적이고 친절한 토크방 매핑 알림 적용
function filterStockRoom(name) {
    showToastNotification(`🔥 실시간 ${name} 주주방에 안전하게 입장했어요!`);
}

function castVote(id, opt) {
    const key = `${userState ? userState.id : 'anon'}-${id}`;
    if (votedRecords.has(key)) {
        showToastNotification("❌ 이미 투표 완료한 항목이에요.");
        return;
    }
    const post = feedData.find(f => f.id === id);
    if (post && post.poll) {
        if (opt === 'a') post.poll.va++;
        else post.poll.vb++;
        
        votedRecords.add(key);
        Storage.set('feedData', feedData);
        Storage.set('votedRecords', Array.from(votedRecords));
        drawFeedTimeline();
        showToastNotification("🗳️ 투표가 정상적으로 반영되었습니다!");
    }
}

// 🌟 하단 모달 가이드라인 문구 정제
function triggerReportSheet() { 
    document.getElementById('sheet-title-text').innerText = "신고 시스템 접수 완료";
    document.getElementById('sheet-body-text').innerText = "안전하고 클린한 환경을 위해 운영팀이 24시간 실시간 모니터링 세션으로 전환하여 정밀 검토할게요!";
    document.getElementById('alert-sheet').style.display = 'flex'; 
}
function closeNotificationSheet() { document.getElementById('alert-sheet').style.display = 'none'; }

function saveInvestmentDiary() {
    const rate = document.getElementById('diary-rate').value;
    const text = document.getElementById('diary-comment').value.trim();

    if (!rate || !text) {
        alert('오늘의 수익률과 투자 노트를 간단히 채워주세요!');
        return;
    }

    diaryData.unshift({
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        rate: parseFloat(rate),
        text: text
    });

    if(userState) userState.chips += 30;
    
    Storage.set('diaryData', diaryData);
    Storage.set('userState', userState);

    document.getElementById('diary-rate').value = '';
    document.getElementById('diary-comment').value = '';

    updateProfileDisplay();
    drawDiaries();
    showToastNotification("📒 오늘 하루 투자 복기 완료! 30칩이 추가 충전되었어요.");
}

function drawDiaries() {
    const area = document.getElementById('diary-timeline-space');
    if(!area) return;
    area.innerHTML = '';
    
    diaryData.forEach(d => {
        area.innerHTML += `
            <div class="toss-card" style="margin-top: 12px; padding: 18px 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; font-weight: 700;">
                    <span style="color: var(--text-muted);">${d.date} 주식 기록</span>
                    <span style="color: ${d.rate >= 0 ? 'var(--color-red)' : 'var(--color-blue)'}">${d.rate >= 0 ? '+' : ''}${d.rate}%</span>
                </div>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">${d.text}</p>
            </div>
        `;
    });
}

function drawLeagueRankings() {
    const container = document.getElementById('league-container');
    if(!container) return;
    container.innerHTML = '';
    
    rankingsData.forEach(r => {
        container.innerHTML += `
            <div class="ranking-flex-row">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div class="rank-badge-sphere sphere-${r.rank}">${r.rank}</div>
                    <div>
                        <div style="font-weight: 700; font-size: 14px;">${r.name} <span style="font-size:11px; font-weight:400; color:var(--text-muted);">${r.age}세</span></div>
                        <div class="toss-progress-bar-bg"><div class="toss-progress-bar-fill" style="width: ${r.progress}%"></div></div>
                    </div>
                </div>
                <span style="font-weight: 700; color: var(--color-red); font-size: 14px;">+${r.rate}%</span>
            </div>
        `;
    });
}

// 🌟 원터치 플로팅 상단 알림 바 유틸리티 함수
let toastTimeout = null;
function showToastNotification(message) {
    const toast = document.getElementById('toast-notification');
    const label = document.getElementById('toast-message-text');
    if(!toast || !label) return;

    label.innerText = message;
    toast.classList.remove('hidden');

    if(toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 2800);
}

function openDirectMessage(username) {
    document.getElementById('target-dm-title').innerText = `@${username} 친구와의 대화`;
    document.getElementById('dm-chat-layer').style.display = 'block';
    
    const stream = document.getElementById('chat-bubble-stream');
    stream.innerHTML = `
        <div class="chat-bubble incoming">반가워! 이번 리그 상위 보상 노리려고 정보 모으는 중인데 같이 대화 나눠볼래? 😊</div>
    `;
    stream.scrollTop = stream.scrollHeight;
}

function closeDirectMessage() { document.getElementById('dm-chat-layer').style.display = 'none'; }

function transmitMessage() {
    const input = document.getElementById('chat-msg-input');
    const msg = input.value.trim();
    if (!msg) return;

    const stream = document.getElementById('chat-bubble-stream');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble outgoing';
    bubble.innerText = msg;
    
    stream.appendChild(bubble);
    input.value = '';
    stream.scrollTop = stream.scrollHeight;
}

function redeemGoods(name, price) {
    if (!userState) return;
    if (userState.chips < price) {
        showToastNotification(`❌ 보유 칩이 부족해요! 글이나 일기를 써서 칩을 모아보세요.`);
        return;
    }
    userState.chips -= price;
    Storage.set('userState', userState);
    updateProfileDisplay();
    
    document.getElementById('sheet-title-text').innerText = "기프티콘 교환 완료! 🎉";
    document.getElementById('sheet-body-text').innerText = `[${name}] 교환 쿠폰 바코드가 가입하신 연락처 번호로 즉시 전송되었습니다. 맛있게 먹어!`;
    document.getElementById('alert-sheet').style.display = 'flex';
}