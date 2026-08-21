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

// // Validação e envio do formulário de cadastro
// const signupFormElement = document.getElementById('signupFormElement');

// signupFormElement.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const name = document.getElementById('signupName').value.trim();
//     const email = document.getElementById('signupEmail').value.trim();
//     const password = document.getElementById('signupPassword').value.trim();
//     const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();

//     let isValid = true;

//     // Validar nome
//     if (name.length === 0) {
//         showError('signupName', 'signupNameError');
//         isValid = false;
//     } else {
//         clearError('signupName', 'signupNameError');
//     }

//     // Validar email
//     if (!isValidEmail(email)) {
//         showError('signupEmail', 'signupEmailError');
//         isValid = false;
//     } else {
//         clearError('signupEmail', 'signupEmailError');
//     }

//     // Validar senha
//     if (password.length < 6) {
//         showError('signupPassword', 'signupPasswordError');
//         isValid = false;
//     } else {
//         clearError('signupPassword', 'signupPasswordError');
//     }

//     // Validar confirmação de senha
//     if (password !== confirmPassword) {
//         showError('signupConfirmPassword', 'signupConfirmPasswordError');
//         isValid = false;
//     } else {
//         clearError('signupConfirmPassword', 'signupConfirmPasswordError');
//     }

//     if (isValid) {
//         showSuccessMessage('signupSuccess');
//         logFormSubmission('Cadastro', { name, email, password });
//         signupFormElement.reset();

//         // Redirecionar para login após 2 segundos
//         setTimeout(() => {
//             window.location.href = 'login.html';
//         }, 2000);
//     }
// });

// // Remover validação inline ao começar a digitar
// setupInputValidation('signupName', 'signupNameError');
// setupInputValidation('signupEmail', 'signupEmailError');
// setupInputValidation('signupPassword', 'signupPasswordError');
// setupInputValidation('signupConfirmPassword', 'signupConfirmPasswordError');

const form = document.querySelector("#signupFormElement");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = form.elements["name"].value;
    const email = form.elements["email"].value;
    const password = form.elements["password"].value;
    const confirm_password = form.elements["confirm_password"].value;

    if (password !== confirm_password) {
        alert("As senhas não coincidem.")
        return;
    }

    const response = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    const data = await response.json();

    if (data["message"] === "success") {
        setTimeout(() => {
            form.reset();
        }, 300);

        setTimeout(() => {
            window.location.href = "/login";
        }, 400);
    } else {
        alert("Erro!")
    }
});