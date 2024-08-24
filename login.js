document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const data = {
        email: email,
        password: password,
      };

      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          document.getElementById("loginForm").reset();
          alert("login successful!");
        } else {
          document.getElementById("message").textContent = response.message;
          document.getElementById("message").style.color = "red";
        }
      } catch (error) {
        document.getElementById("message").textContent =
          "An error occurred. Please try again.";
        document.getElementById("message").style.color = "red";
      }
    });
  document
    .getElementsByClassName("forgotpassbtn")
    .addEventListener("click", async () => {
      const response = await fetch("http://localhost:3000/forgotPassword");
    });
});
