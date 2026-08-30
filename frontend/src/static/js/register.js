const form = document.querySelector("#FormRegister");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const password = form.elements["password"].value.trim();
    const confirm_password = form.elements["password_confirmation"].value.trim();

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