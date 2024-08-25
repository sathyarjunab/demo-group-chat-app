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
        const response = await fetch("http://localhost:3001/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const resdate = await response.json();
        if (response.ok) {
          document.getElementById("loginForm").reset();
          localStorage.setItem("token", resdate.token);
          localStorage.setItem("user", resdate.user);
          alert("login successful!");
          window.location.href = "/chatapp.html";
        } else {
          document.getElementById("message").textContent = resdate.message;
          document.getElementById("message").style.color = "red";
        }
      } catch (error) {
        console.log(error);
        document.getElementById("message").textContent =
          "An error occurred. Please try again.";
        document.getElementById("message").style.color = "red";
      }
    });

  document
    .querySelector(".forgotpassbtn")
    .addEventListener("click", async () => {
      const response = await fetch("http://localhost:3001/forgotPassword");
    });
});
