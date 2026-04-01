/**
 * Claude Code 学习网站 - 交互逻辑
 */

// ========================================
// 状态管理
// ========================================
const state = {
    currentSection: 'welcome',
    completedSections: JSON.parse(localStorage.getItem('completedSections') || '[]'),
    theme: localStorage.getItem('theme') || 'dark',
    quizAnswers: {}
};

// 章节列表
const sections = ['welcome', 'chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5', 'chapter6', 'resources'];

// 测验题目
const quizQuestions = [
    {
        id: 1,
        question: "Claude Code 的核心能力是什么？",
        options: [
            "A. 代码自动补全",
            "B. 通过工具调用执行复杂任务",
            "C. 语法检查",
            "D. 代码格式化"
        ],
        correct: 1,
        explanation: "Claude Code 的核心是工具调用系统，可以执行 Bash 命令、读写文件、搜索代码等，而不仅仅是代码补全。"
    },
    {
        id: 2,
        question: "哪个工具用于在代码中搜索特定模式？",
        options: [
            "A. FileRead",
            "B. Bash",
            "C. Grep",
            "D. Glob"
        ],
        correct: 2,
        explanation: "Grep 工具专门用于在文件内容中搜索文本模式，支持正则表达式。"
    },
    {
        id: 3,
        question: "以下哪个命令用于自动生成提交信息？",
        options: [
            "A. /config",
            "B. /commit",
            "C. /review",
            "D. /clear"
        ],
        correct: 1,
        explanation: "/commit 命令会自动分析 git diff，生成符合规范的提交信息并执行提交。"
    },
    {
        id: 4,
        question: "Auto Mode 和 Full Auto 的主要区别是什么？",
        options: [
            "A. Auto Mode 更贵",
            "B. Full Auto 会阻断危险操作",
            "C. Auto Mode 会判断安全性，Full Auto 几乎不询问",
            "D. 没有区别"
        ],
        correct: 2,
        explanation: "Auto Mode 中 Claude 会判断操作安全性，危险操作会被阻断；Full Auto 几乎不询问，风险更高。"
    },
    {
        id: 5,
        question: "Hooks 的作用是什么？",
        options: [
            "A. 捕获错误",
            "B. 在特定事件发生时自动执行操作",
            "C. 连接网络",
            "D. 显示帮助信息"
        ],
        correct: 1,
        explanation: "Hooks 让你在特定事件（如文件保存、会话启动）发生时自动执行操作，实现自动化工作流。"
    }
];

// ========================================
// 初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initSearch();
    updateProgress();
    initQuiz();
});

// ========================================
// 主题切换
// ========================================
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = state.theme === 'dark' ? '☀️ 浅色模式' : '🌙 深色模式';
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = state.theme === 'dark' ? '☀️ 浅色模式' : '🌙 深色模式';
}

// ========================================
// 导航功能
// ========================================
function initNavigation() {
    // 侧边栏导航点击
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) {
                showSection(section);

                // 移动端关闭侧边栏
                if (window.innerWidth <= 1024) {
                    document.getElementById('sidebar').classList.remove('open');
                }
            }
        });
    });

    // 菜单切换按钮（移动端）
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    // 点击外部关闭侧边栏
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menu-toggle');

        if (window.innerWidth <= 1024 &&
            sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

function showSection(sectionId) {
    // 隐藏所有章节
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示目标章节
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionId;

        // 滚动到顶部
        document.getElementById('content-wrapper').scrollTop = 0;
        window.scrollTo(0, 0);
    }

    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });

    // 标记章节完成（除 welcome 和 resources）
    if (sectionId !== 'welcome' && sectionId !== 'resources') {
        markSectionComplete(sectionId);
    }
}

function startLearning() {
    showSection('chapter1');
}

function markSectionComplete(sectionId) {
    if (!state.completedSections.includes(sectionId)) {
        state.completedSections.push(sectionId);
        localStorage.setItem('completedSections', JSON.stringify(state.completedSections));
        updateProgress();
    }
}

function updateProgress() {
    const learningSections = sections.filter(s => s !== 'welcome' && s !== 'resources');
    const completed = state.completedSections.filter(s => learningSections.includes(s)).length;
    const total = learningSections.length;
    const percentage = Math.round((completed / total) * 100);

    // 更新进度条
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }

    // 更新导航项状态
    document.querySelectorAll('.nav-item').forEach(item => {
        const section = item.dataset.section;
        if (state.completedSections.includes(section)) {
            item.classList.add('completed');
        }
    });
}

// ========================================
// 搜索功能
// ========================================
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            performSearch(e.target.value);
        }, 300));

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch(e.target.value);
            }
        });
    }
}

function performSearch(query) {
    if (!query || query.length < 2) {
        // 清除高亮
        document.querySelectorAll('.highlight-search').forEach(el => {
            el.classList.remove('highlight-search');
        });
        return;
    }

    query = query.toLowerCase();
    let found = false;

    // 搜索所有章节
    document.querySelectorAll('.content-section').forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(query)) {
            // 如果当前不在该章节，跳转到第一个匹配的章节
            if (!found && !section.classList.contains('active')) {
                const sectionId = section.id;
                showSection(sectionId);
                found = true;
            }
        }
    });

    // 高亮搜索结果
    highlightText(query);
}

function highlightText(query) {
    // 移除旧的高亮
    document.querySelectorAll('.highlight-search').forEach(el => {
        el.outerHTML = el.innerHTML;
    });

    // 添加新的高亮
    const walker = document.createTreeWalker(
        document.getElementById('content-wrapper'),
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(query)) {
            nodes.push(node);
        }
    }

    nodes.forEach(node => {
        const span = document.createElement('span');
        span.className = 'highlight-search';
        span.style.backgroundColor = 'rgba(217, 119, 87, 0.3)';
        span.style.padding = '2px 4px';
        span.style.borderRadius = '4px';

        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        const parts = node.textContent.split(regex);

        parts.forEach((part, i) => {
            if (part.toLowerCase() === query) {
                const mark = document.createElement('mark');
                mark.style.backgroundColor = 'rgba(217, 119, 87, 0.5)';
                mark.style.color = 'inherit';
                mark.textContent = part;
                node.parentNode.insertBefore(mark, node);
            } else {
                node.parentNode.insertBefore(document.createTextNode(part), node);
            }
        });

        node.parentNode.removeChild(node);
    });
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// 测验功能
// ========================================
function initQuiz() {
    // 测验功能已初始化，等待用户触发
}

function showQuiz() {
    const modal = document.getElementById('quiz-modal');
    const body = document.getElementById('quiz-body');

    state.quizAnswers = {};

    body.innerHTML = `
        <div class="quiz-intro">
            <p>测试你对 Claude Code 的理解！共 ${quizQuestions.length} 题。</p>
        </div>
        ${quizQuestions.map((q, index) => `
            <div class="quiz-question" data-question="${q.id}">
                <h4>第 ${index + 1} 题：${q.question}</h4>
                <div class="quiz-options">
                    ${q.options.map((opt, optIndex) => `
                        <div class="quiz-option" data-option="${optIndex}" onclick="selectAnswer(${q.id}, ${optIndex})">
                            ${opt}
                        </div>
                    `).join('')}
                </div>
                <div class="quiz-explanation" style="display: none; margin-top: 12px; padding: 12px; background: rgba(99, 179, 237, 0.1); border-radius: 6px; font-size: 14px;">
                    💡 ${q.explanation}
                </div>
            </div>
        `).join('')}
        <button class="btn btn-primary" style="width: 100%; margin-top: 24px;" onclick="submitQuiz()">提交答案</button>
    `;

    modal.classList.add('active');
}

function closeQuiz() {
    const modal = document.getElementById('quiz-modal');
    modal.classList.remove('active');
}

function selectAnswer(questionId, optionIndex) {
    state.quizAnswers[questionId] = optionIndex;

    // 更新 UI
    const questionEl = document.querySelector(`[data-question="${questionId}"]`);
    questionEl.querySelectorAll('.quiz-option').forEach((opt, idx) => {
        opt.classList.remove('selected');
        if (idx === optionIndex) {
            opt.style.borderColor = 'var(--primary)';
            opt.style.background = 'rgba(217, 119, 87, 0.1)';
        } else {
            opt.style.borderColor = 'transparent';
            opt.style.background = 'var(--bg-tertiary)';
        }
    });
}

function submitQuiz() {
    let correct = 0;

    quizQuestions.forEach(q => {
        const selected = state.quizAnswers[q.id];
        const questionEl = document.querySelector(`[data-question="${q.id}"]`);
        const options = questionEl.querySelectorAll('.quiz-option');
        const explanation = questionEl.querySelector('.quiz-explanation');

        options.forEach((opt, idx) => {
            opt.style.pointerEvents = 'none'; // 禁用点击

            if (idx === q.correct) {
                opt.classList.add('correct');
            } else if (idx === selected && selected !== q.correct) {
                opt.classList.add('wrong');
            }
        });

        explanation.style.display = 'block';

        if (selected === q.correct) {
            correct++;
        }
    });

    // 显示结果
    const percentage = Math.round((correct / quizQuestions.length) * 100);
    let message = '';

    if (percentage === 100) {
        message = '🎉 完美！你对 Claude Code 了如指掌！';
    } else if (percentage >= 80) {
        message = '👍 很棒！你对 Claude Code 有很好的理解。';
    } else if (percentage >= 60) {
        message = '💪 还不错！可以复习一下错题。';
    } else {
        message = '📚 建议重新阅读教程，巩固基础知识。';
    }

    setTimeout(() => {
        const body = document.getElementById('quiz-body');
        body.innerHTML = `
            <div class="quiz-result">
                <div style="font-size: 48px; margin-bottom: 20px;">${percentage >= 60 ? '🎉' : '💪'}</div>
                <h3>测验完成！</h3>
                <p style="font-size: 24px; margin: 16px 0;">${correct} / ${quizQuestions.length} 正确</p>
                <p style="color: var(--text-secondary);">${message}</p>
                <button class="btn btn-primary" style="margin-top: 24px;" onclick="closeQuiz()">关闭</button>
                <button class="btn btn-secondary" style="margin-top: 24px; margin-left: 12px;" onclick="showQuiz()">重新测验</button>
            </div>
        `;
    }, 1000);
}

// ========================================
// 工具函数
// ========================================
function copyCode(btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('pre')?.textContent || codeBlock.querySelector('code')?.textContent;

    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            const originalText = btn.textContent;
            btn.textContent = '已复制!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // ESC 关闭测验
    if (e.key === 'Escape') {
        closeQuiz();
    }

    // / 聚焦搜索
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
    }

    // 方向键切换章节
    if (e.key === 'ArrowLeft' && e.altKey) {
        navigateChapter(-1);
    }
    if (e.key === 'ArrowRight' && e.altKey) {
        navigateChapter(1);
    }
});

function navigateChapter(direction) {
    const currentIndex = sections.indexOf(state.currentSection);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < sections.length) {
        showSection(sections[newIndex]);
    }
}

// 防止代码块中的按钮触发复制
function initCodeBlocks() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyCode(btn);
        });
    });
}

// 页面加载完成后初始化代码块
document.addEventListener('DOMContentLoaded', initCodeBlocks);

// ========================================
// 导出函数供 HTML 使用
// ========================================
window.showSection = showSection;
window.startLearning = startLearning;
window.showQuiz = showQuiz;
window.closeQuiz = closeQuiz;
window.selectAnswer = selectAnswer;
window.submitQuiz = submitQuiz;
window.copyCode = copyCode;
