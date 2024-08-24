document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("signupForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const password = document.getElementById("password").value;

      const data = {
        name: name,
        email: email,
        phone: phone,
        password: password,
      };

      try {
        const response = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          document.getElementById("message").textContent =
            "Sign up successful!";
          document.getElementById("message").style.color = "green";
        } else {
          document.getElementById("message").textContent =
            "Sign up failed. Please try again.";
        }
      } catch (error) {
        document.getElementById("message").textContent =
          "An error occurred. Please try again.";
      }
    });
});
