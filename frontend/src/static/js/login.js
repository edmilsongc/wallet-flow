// // Validar email
// function isValidEmail(email) {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// // Mostrar erro no campo
// function showError(inputId, errorId) {
//     const input = document.getElementById(inputId);
//     const error = document.getElementById(errorId);
//     if (input && error) {
//         input.classList.add('is-invalid');
//         error.classList.add('show');
//     }
// }

// // Limpar erro do campo
// function clearError(inputId, errorId) {
//     const input = document.getElementById(inputId);
//     const error = document.getElementById(errorId);
//     if (input && error) {
//         input.classList.remove('is-invalid');
//         error.classList.remove('show');
//     }
// }

// // Mostrar mensagem de sucesso
// function showSuccessMessage(messageId) {
//     const message = document.getElementById(messageId);
//     if (message) {
//         message.classList.add('show');
//         setTimeout(() => {
//             message.classList.remove('show');
//         }, 3000);
//     }
// }

// // Remover validação inline ao começar a digitar
// function setupInputValidation(inputId, errorId) {
//     const input = document.getElementById(inputId);
//     if (input) {
//         input.addEventListener('input', () => {
//             if (input.classList.contains('is-invalid')) {
//                 clearError(inputId, errorId);
//             }
//         });
//     }
// }

// // Log para debug
// function logFormSubmission(formName, data) {
//     console.log(`${formName} enviado:`, data);
// }

// // Validação e envio do formulário de login
// const loginFormElement = document.getElementById('loginFormElement');

// loginFormElement.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const email = document.getElementById('loginEmail').value.trim();
//     const password = document.getElementById('loginPassword').value.trim();

//     let isValid = true;

//     // Validar email
//     if (!isValidEmail(email)) {
//         showError('loginEmail', 'loginEmailError');
//         isValid = false;
//     } else {
//         clearError('loginEmail', 'loginEmailError');
//     }

//     // Validar senha
//     if (password.length === 0) {
//         showError('loginPassword', 'loginPasswordError');
//         isValid = false;
//     } else {
//         clearError('loginPassword', 'loginPasswordError');
//     }

//     if (isValid) {
//         showSuccessMessage('loginSuccess');
//         logFormSubmission('Login', { email, password });
//         loginFormElement.reset();
//     }
// });

// // Remover validação inline ao começar a digitar
// setupInputValidation('loginEmail', 'loginEmailError');
// setupInputValidation('loginPassword', 'loginPasswordError');

// // Link "Esqueci minha senha"
// document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
//     e.preventDefault();
//     alert('Funcionalidade de recuperação de senha será implementada em breve!');
// });

const form = document.querySelector("#loginFormElement");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.elements["email"].value;
    const password = form.elements["password"].value;

    const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });
    const data = await response.json();

    console.log(data);

    if (data['message'] === "success") {
        setTimeout(() => {
            form.reset();
        }, 300);

        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 400);
    } else {
        alert("Credenciais inválidas ou usuário inexistente.");
    }
});