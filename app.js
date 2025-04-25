const apiUrl = 'https://quiz-backend-tvuf.onrender.com/api/questions'; 

let currentQuestionIndex = 0;
let questions = [];
let correctAnswersCount = 0; // Contador de acertos

const questionTitle = document.getElementById('question-title');
const alternativesList = document.getElementById('alternatives-list');
const commentContainer = document.getElementById('comment-container');
const commentText = document.getElementById('comment');
const nextButton = document.getElementById('next-button');
const questionCount = document.getElementById('question-count');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');
const retryButton = document.getElementById('retry-button');

async function fetchQuestions() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        questions = data;
        loadQuestion();
    } catch (error) {
        console.error('Erro ao carregar as perguntas:', error);
    }
}

function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        questionTitle.textContent = `${question.id}. ${question.pergunta}`;
        
        // Exibindo a contagem da questão (ex: 1/25)
        questionCount.textContent = `Questão ${currentQuestionIndex + 1} de ${questions.length}`;
        
        alternativesList.innerHTML = '';
        question.alternativas.forEach((alt, index) => {
            const li = document.createElement('li');
            li.textContent = alt;
            li.onclick = () => checkAnswer(index, li); // Passando o elemento li para manipular a borda
            alternativesList.appendChild(li);
        });

        commentContainer.style.display = 'none'; // Ocultar o comentário inicialmente
    }
}

function checkAnswer(selectedIndex, liElement) {
    const question = questions[currentQuestionIndex];
    const correctAnswerIndex = question.respostaCorreta;

    if (selectedIndex === correctAnswerIndex) {
        commentText.textContent = 'Resposta correta! ' + question.comentario;
        liElement.style.border = '2px solid #4CAF50'; // Bordas verdes para resposta correta
        correctAnswersCount++;
    } else {
        commentText.textContent = 'Resposta incorreta. ' + question.comentario;
        liElement.style.border = '2px solid #FF5733'; // Bordas vermelhas para resposta incorreta
    }

    commentContainer.style.display = 'block'; // Mostrar comentário
    nextButton.disabled = false;
}

nextButton.onclick = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
        nextButton.disabled = true;
    } else {
        // Exibir resultado final
        showResult();
    }
};

function showResult() {
    const totalQuestions = questions.length;
    const accuracy = ((correctAnswersCount / totalQuestions) * 100).toFixed(2);
    resultText.textContent = `Você acertou ${correctAnswersCount} de ${totalQuestions} questões (${accuracy}%)`;
    resultContainer.style.display = 'block'; // Exibe a tela de resultado
    document.getElementById('question-container').style.display = 'none'; // Oculta o quiz
}

retryButton.onclick = function() {
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    resultContainer.style.display = 'none'; // Esconde o resultado
    document.getElementById('question-container').style.display = 'block'; // Mostra o quiz novamente
    loadQuestion();
    nextButton.disabled = true;
};

fetchQuestions();