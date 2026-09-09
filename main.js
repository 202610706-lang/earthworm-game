document.addEventListener('DOMContentLoaded', () => {
    // Q&A 관련 요소를 가져옵니다.
    const questionInput = document.getElementById('questionInput');
    const askBtn = document.getElementById('askBtn');
    const answerResult = document.getElementById('answerResult');

    // 모달(지원 창) 관련 요소를 가져옵니다.
    const applyBtn = document.getElementById('applyBtn');
    const applyModal = document.getElementById('applyModal');
    const closeBtn = document.querySelector('.close-btn');
    const applyForm = document.getElementById('applyForm');

    // 자주 묻는 질문 키워드 데이터
    const faqData = [
        { keywords: ['면접', '뽑', '선발'], answer: '💡 간단한 면접이 진행되며, 열정과 책임감을 가장 중요하게 봅니다!' },
        { keywords: ['열어', '시간', '언제'], answer: '🍫 매점은 쉬는 시간 10분과 점심시간 동안 운영됩니다.' },
        { keywords: ['혜택', '장점', '좋은점'], answer: '✨ 강당 백스테이지 체험 및 봉사시간 인정, 그리고 매점 이용 우대 혜택이 있습니다!' },
        { keywords: ['할일', '뭐해', '일'], answer: '⚡ 행사 조명/음향 제어 및 매점 재고 관리와 판매를 담당합니다.' }
    ];

    // 질문 처리 함수
    const handleQuestion = () => {
        const query = questionInput.value.trim();

        if (!query) {
            alert('질문을 입력해주세요!');
            return;
        }

        // 키워드 매칭 검색
        let matchedAnswer = '🤖 답변: 해당 질문에 대한 자동 답변을 찾지 못했어요. 지원 후 동아리 부장에게 물어보세요!';
        
        for (const item of faqData) {
            if (item.keywords.some(keyword => query.includes(keyword))) {
                matchedAnswer = item.answer;
                break;
            }
        }

        // 요청해주신 요구사항: 앞에 "질문이 잘 전달되었습니다!" 문장 추가
        answerResult.innerHTML = `<strong>질문이 잘 전달되었습니다!</strong><br>${matchedAnswer}`;
        answerResult.style.display = 'block';
        questionInput.value = '';
    };

    // 질문 버튼 클릭 및 엔터키 이벤트 등록
    askBtn.addEventListener('click', handleQuestion);
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuestion();
    });

    // --- 지원하기 모달 창 동작 설정 --- //

    // 지원하기 버튼 클릭시 창 켜기
    applyBtn.addEventListener('click', () => {
        applyModal.style.display = 'flex';
    });

    // X 버튼 누르면 창 닫기
    closeBtn.addEventListener('click', () => {
        applyModal.style.display = 'none';
    });

    // 창 바깥 여백 누르면 닫기
    window.addEventListener('click', (e) => {
        if (e.target === applyModal) {
            applyModal.style.display = 'none';
        }
    });

    // 폼 제출 이벤트 처리
    applyForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 기본 새로고침 동작 방지

        const studentId = document.getElementById('studentId').value;
        const studentName = document.getElementById('studentName').value;

        alert(`🎉 ${studentId} ${studentName} 학생의 인터랙트 동아리 지원이 완료되었습니다!`);

        // 입력 폼 초기화 및 모달 닫기
        applyForm.reset();
        applyModal.style.display = 'none';
    });
});