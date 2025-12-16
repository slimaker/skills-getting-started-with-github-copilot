document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const participantsList = document.getElementById("participants-list");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong></p>
          <ul class="participants-list" style="list-style-type: none;">
            ${details.participants
              .map(
                (participant) => `
                  <li>
                    ${participant}
                    <span class="delete-icon" style="cursor: pointer; margin-left: 10px;">❌</span>
                  </li>
                `
              )
              .join("")}
          </ul>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        // Add event listeners to delete icons
        activityCard.querySelectorAll(".delete-icon").forEach((icon, index) => {
          icon.addEventListener("click", () => {
            const participant = details.participants[index];
            unregisterParticipant(name, participant);
            icon.parentElement.remove();
          });
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Function to add a participant to the list
  function addParticipant(name) {
    const listItem = document.createElement("li");
    listItem.textContent = name;

    const deleteIcon = document.createElement("span");
    deleteIcon.textContent = "❌";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.style.marginLeft = "10px";

    deleteIcon.addEventListener("click", () => {
      unregisterParticipant(name);
      listItem.remove();
    });

    listItem.appendChild(deleteIcon);
    participantsList.appendChild(listItem);
  }

  // Function to unregister a participant
  async function unregisterParticipant(activity, participant) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(participant)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        console.error("Failed to unregister participant");
      }
    } catch (error) {
      console.error("Error unregistering participant:", error);
    }
  }

  // Initialize app
  fetchActivities();

  // Example usage: dynamically add participants
  ["John Doe", "Jane Smith"].forEach(addParticipant);
});
