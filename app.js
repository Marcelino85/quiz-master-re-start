const apiUrl = 'https://quiz-backend-tvuf.onrender.com/api/questions';

let currentQuestionIndex = 0;
let questions = [];
let correctAnswersCount = 0;
let selectedIndexes = new Set();
let timerInterval;
let timeLeft = 60;

const questionTitle = document.getElementById('question-title');
const alternativesList = document.getElementById('alternatives-list');
const commentContainer = document.getElementById('comment-container');
const commentText = document.getElementById('comment');
const nextButton = document.getElementById('next-button');
const questionCount = document.getElementById('question-count');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');
const retryButton = document.getElementById('retry-button');
const timerDisplay = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');
const requiredAnswersInfo = document.getElementById('required-answers-info');

async function fetchQuestions() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        questions = shuffleArray(data); // Embaralhar perguntas
        loadQuestion();
    } catch (error) {
        console.error('Erro ao carregar as perguntas:', error);
    }
}

// Função para embaralhar array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function loadQuestion() {
    clearInterval(timerInterval);
    startTimer();

    selectedIndexes.clear();
    nextButton.disabled = true;

    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        questionTitle.innerHTML = `<strong>${currentQuestionIndex + 1}ª)</strong> ${question.pergunta}`;
        questionCount.textContent = `Questão ${currentQuestionIndex + 1} de ${questions.length}`;
        alternativesList.innerHTML = '';

        // Mostrar quantas respostas selecionar
        const correctAnswers = Array.isArray(question.respostaCorreta) ? question.respostaCorreta.length : 1;
        requiredAnswersInfo.textContent = `Selecione ${correctAnswers} resposta(s)`;

        question.alternativas.forEach((alt, index) => {
            const li = document.createElement('li');
            li.textContent = alt;
            li.onclick = () => selectAnswer(index, li);
            alternativesList.appendChild(li);
        });

        commentContainer.style.display = 'none';
        updateProgressBar();
    }
}

function selectAnswer(selectedIndex, liElement) {
    const question = questions[currentQuestionIndex];
    const correctAnswers = Array.isArray(question.respostaCorreta) ? question.respostaCorreta.length : 1;

    if (selectedIndexes.has(selectedIndex)) {
        selectedIndexes.delete(selectedIndex);
        liElement.style.border = '1px solid #ccc'; // Tirar seleção
    } else {
        if (selectedIndexes.size < correctAnswers) {
            selectedIndexes.add(selectedIndex);
            liElement.style.border = '2px solid #007bff'; // Marcar como selecionado (azul)
        }
    }

    // Habilitar "Próxima" apenas quando o número de respostas for atingido
    nextButton.disabled = selectedIndexes.size !== correctAnswers;
}

function checkAnswer() {
    const question = questions[currentQuestionIndex];
    const correctAnswerIndexes = Array.isArray(question.respostaCorreta) ? question.respostaCorreta : [question.respostaCorreta];

    const lis = alternativesList.querySelectorAll('li');

    lis.forEach((li, index) => {
        li.style.transition = 'border 0.5s ease'; // Transição suave

        if (correctAnswerIndexes.includes(index)) {
            li.style.border = '2px solid #90ee90'; // Verde suave para corretas
        } else if (selectedIndexes.has(index)) {
            li.style.border = '2px solid #f08080'; // Vermelho suave para erradas
        } else {
            li.style.border = '1px solid #ccc'; // Sem seleção
        }
    });

    const isCorrect = correctAnswerIndexes.every(idx => selectedIndexes.has(idx)) && selectedIndexes.size === correctAnswerIndexes.length;

    if (isCorrect) {
        commentText.textContent = 'Resposta correta! ' + question.comentario;
        correctAnswersCount++;
    } else {
        commentText.textContent = 'Resposta incorreta. ' + question.comentario;
    }

    commentContainer.style.display = 'block';
    stopTimer();
}


nextButton.onclick = function() {
    checkAnswer(); // Verifica a resposta
    currentQuestionIndex++;

    let countdown = 10; // Tempo em segundos
    commentText.innerHTML += `<br><br><span style="color: red;">Próxima pergunta em ${countdown} segundos...</span>`;
   

    const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            commentText.innerHTML = commentText.innerHTML.replace(/\d+ segundos/, `${countdown} segundos`);
        } else {
            clearInterval(interval); // Para o contador

            if (currentQuestionIndex < questions.length) {
                loadQuestion();
                nextButton.disabled = true; // Bloqueia novamente até responder
            } else {
                showResult();
            }
        }
    }, 1000); // Atualiza a cada 1 segundo
};


function showResult() {
    const totalQuestions = questions.length;
    const accuracy = ((correctAnswersCount / totalQuestions) * 100).toFixed(2);
    resultText.textContent = `Você acertou ${correctAnswersCount} de ${totalQuestions} questões (${accuracy}%)`;
    resultContainer.style.display = 'block';
    document.getElementById('question-container').style.display = 'none';
}

retryButton.onclick = function() {
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    resultContainer.style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    questions = shuffleArray(questions);
    loadQuestion();
};

function startTimer() {
    timeLeft = 60;
    timerDisplay.textContent = `Tempo restante: ${timeLeft}s`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Tempo restante: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            commentText.textContent = 'Tempo esgotado!';
            commentContainer.style.display = 'block';
            nextButton.disabled = false;
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

fetchQuestions();
