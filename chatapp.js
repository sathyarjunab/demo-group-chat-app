document.addEventListener("DOMContentLoaded", () => {
  const groupList = document.getElementById("groupList");
  const createGroupBtn = document.getElementById("createGroupBtn");
  const messagesContainer = document.getElementById("messagesContainer");
  const currentGroupTitle = document.getElementById("currentGroup");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const userList = document.getElementById("userList");

  let selectedGroupUUID = null; // Store the selected group's UUID
  let token = localStorage.getItem("token");
  let currentUser = localStorage.getItem("user");

  // Fetch groups on page load
  async function fetchGroups() {
    try {
      const response = await fetch("http://localhost:3001/groups", {
        headers: { authorization: token },
      });
      const groups = await response.json();
      groups.forEach((group) => {
        addGroupToList(group.GroupName, group.UUID);
      });
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

  // Function to add group to the list in the UI
  function addGroupToList(groupName, groupUUID) {
    const li = document.createElement("li");
    li.textContent = groupName;
    li.dataset.uuid = groupUUID; // Store UUID in data attribute
    li.addEventListener("click", () => {
      selectedGroupUUID = groupUUID;
      currentGroupTitle.textContent = `Group: ${groupName}`;
      fetchMessages(groupUUID);
      fetchUsers(groupUUID); // Fetch users for the selected group
    });
    groupList.appendChild(li);
  }

  // Function to fetch and display messages for a selected group
  async function fetchMessages(groupUUID) {
    try {
      const response = await fetch(
        `http://localhost:3001/groups/${groupUUID}/messages`,
        {
          headers: { authorization: token },
        }
      );
      const messages = await response.json();
      messagesContainer.innerHTML = ""; // Clear previous messages
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

  // Function to fetch and display users for a selected group
  async function fetchUsers(groupUUID) {
    try {
      const response = await fetch(
        `http://localhost:3001/groups/${groupUUID}/users`,
        {
          headers: { authorization: token },
        }
      );
      const users = await response.json();
      userList.innerHTML = ""; // Clear previous users
      users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = user.Name;
        userList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  // Function to handle message sending
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
                user: currentUser, // Use actual username stored in localStorage
                text: message,
              }),
            }
          );
          if (result) {
            console.log(result);
            fetchMessages(selectedGroupUUID); // Refresh messages
            messageInput.value = "";
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    }
  });

  // Function to handle group creation
  createGroupBtn.addEventListener("click", async () => {
    const groupName = prompt("Enter Group Name:");
    if (groupName) {
      const groupMembers = prompt("Enter Group Members (comma-separated):");
      if (groupMembers) {
        const membersArray = groupMembers
          .split(",")
          .map((member) => member.trim());

        // Check if the number of members exceeds 5
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
            addGroupToList(group.GroupName, group.UUID); // Add the new group with its UUID
          } else {
            console.error("Error creating group:", response.statusText);
          }
        } catch (error) {
          console.error("Error creating group:", error);
        }
      }
    }
  });

  // Initial fetch of groups
  fetchGroups();
});
