document.addEventListener("DOMContentLoaded", () => {
  const groupList = document.getElementById("groupList");
  const createGroupBtn = document.getElementById("createGroupBtn");
  const messagesContainer = document.getElementById("messagesContainer");
  const currentGroupTitle = document.getElementById("currentGroup");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const userList = document.getElementById("userList");
  const addUserBtn = document.getElementById("addUserBtn");
  const addUserModal = document.getElementById("addUserModal");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  let selectedGroupUUID = null;
  let token = localStorage.getItem("token");
  let currentUser = localStorage.getItem("user");
  let isAdmin = false; // Check if current user is an admin of the selected group

  async function fetchGroups() {
    try {
      const response = await fetch("http://localhost:3001/groups", {
        headers: { authorization: token },
      });
      const groups = await response.json();
      groups.forEach((group) => {
        addGroupToList(group.GroupName, group.UUID, group.isAdmin);
      });
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

  function addGroupToList(groupName, groupUUID, isadmin) {
    const li = document.createElement("li");
    li.textContent = groupName;
    li.dataset.uuid = groupUUID;
    li.addEventListener("click", () => {
      isAdmin = isadmin;
      if (isadmin) {
        addUserBtn.style.display = "block";
      }
      selectedGroupUUID = groupUUID;
      currentGroupTitle.textContent = `Group: ${groupName}`;
      fetchMessages(groupUUID);
      fetchUsers(groupUUID);
    });
    groupList.appendChild(li);
  }

  async function fetchMessages(groupUUID) {
    try {
      const response = await fetch(
        `http://localhost:3001/groups/${groupUUID}/messages`,
        {
          headers: { authorization: token },
        }
      );
      const messages = await response.json();
      messagesContainer.innerHTML = "";
      messages.forEach((message) => {
        const div = document.createElement("div");
        div.classList.add("message");
        div.classList.add(message.user === currentUser ? "user" : "other");
        div.textContent = `${
          message.User.Name === currentUser ? "you" : message.User.Name
        }: ${message.Message}`;
        messagesContainer.appendChild(div);
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  async function fetchUsers(groupUUID) {
    try {
      const response = await fetch(
        `http://localhost:3001/groups/${groupUUID}/users`,
        {
          headers: { authorization: token },
        }
      );
      const users = await response.json();
      userList.innerHTML = "";
      users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = `${user.Name === currentUser ? "you" : user.Name} (${
          user.role
        })`;
        li.dataset.userId = user.id;
        li.addEventListener("click", () => handleUserClick(user));
        userList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  function handleUserClick(user) {
    if (isAdmin && user.role !== "admin") {
      let buttonsDiv = document.querySelector("#userButtons");
      if (!buttonsDiv) {
        buttonsDiv = document.createElement("div");
        buttonsDiv.id = "userButtons";
        const makeAdminBtn = document.createElement("button");
        makeAdminBtn.textContent = "Make Admin";
        makeAdminBtn.addEventListener("click", () => makeAdmin(user.id));
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => removeUser(user.id));
        buttonsDiv.appendChild(makeAdminBtn);
        buttonsDiv.appendChild(removeBtn);
        userList.appendChild(buttonsDiv);
      }
    }
  }

  async function makeAdmin(userId) {
    try {
      await fetch(
        `http://localhost:3001/groups/${selectedGroupUUID}/users/${userId}/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );
      fetchUsers(selectedGroupUUID); // Refresh users list
    } catch (error) {
      console.error("Error making admin:", error);
    }
  }

  async function removeUser(userId) {
    try {
      await fetch(
        `http://localhost:3001/groups/${selectedGroupUUID}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );
      fetchUsers(selectedGroupUUID); // Refresh users list
    } catch (error) {
      console.error("Error removing user:", error);
    }
  }

  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (selectedGroupUUID) {
      const message = messageInput.value.trim();
      if (message) {
        try {
          const result = await fetch(
            `http://localhost:3001/groups/${selectedGroupUUID}/messages`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                authorization: token,
              },
              body: JSON.stringify({
                user: currentUser,
                text: message,
              }),
            }
          );
          if (result.ok) {
            fetchMessages(selectedGroupUUID);
            messageInput.value = "";
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    }
  });

  createGroupBtn.addEventListener("click", async () => {
    const groupName = prompt("Enter Group Name:");
    if (groupName) {
      const groupMembers = prompt("Enter Group Members (comma-separated):");
      if (groupMembers) {
        const membersArray = groupMembers
          .split(",")
          .map((member) => member.trim());

        if (membersArray.length > 5) {
          alert("A group can have a maximum of 5 members.");
          return;
        }

        try {
          const response = await fetch("http://localhost:3001/groups", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: token,
            },
            body: JSON.stringify({
              name: groupName,
              members: membersArray,
            }),
          });
          if (response.ok) {
            const group = await response.json();
            addGroupToList(group.GroupName, group.UUID, true);
          } else {
            console.error("Error creating group:", response.statusText);
          }
        } catch (error) {
          console.error("Error creating group:", error);
        }
      }
    }
  });

  addUserBtn.addEventListener("click", () => {
    addUserModal.style.display = "block"; // Show the modal
  });

  const closeModal = document.querySelector(".modal .close");
  closeModal.addEventListener("click", () => {
    addUserModal.style.display = "none"; // Hide the modal
  });

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (query) {
      try {
        const response = await fetch(
          `http://localhost:3001/users/search?query=${query}`,
          {
            headers: { authorization: token },
          }
        );
        const users = await response.json();
        searchResults.innerHTML = "";
        users.forEach((user) => {
          const li = document.createElement("li");
          li.textContent = user.Name;
          li.addEventListener("click", () => addUserToGroup(user.id));
          searchResults.appendChild(li);
        });
      } catch (error) {
        console.error("Error searching users:", error);
      }
    } else {
      searchResults.innerHTML = "";
    }
  });

  async function addUserToGroup(userId) {
    try {
      console.log("Dsasadasad");
      await fetch(
        `http://localhost:3001/groups/${selectedGroupUUID}/users/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );
      fetchUsers(selectedGroupUUID); // Refresh users list
      addUserModal.style.display = "none"; // Hide the modal
    } catch (error) {
      console.error("Error adding user to group:", error);
    }
  }

  fetchGroups();
});
