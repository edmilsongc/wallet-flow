const form = document.querySelector("#FormLogin");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.elements["email"].value.trim();
    const password = form.elements["password"].value.trim();

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