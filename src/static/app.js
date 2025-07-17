document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }
    const filterCategory = document.getElementById("filter-category");
    const sortActivities = document.getElementById("sort-activities");
    const searchActivities = document.getElementById("search-activities");
  
    let allActivities = {};
    let categories = new Set();
  
    // Function to fetch activities from API
    async function fetchActivities() {
      try {
        const response = await fetch("/activities");
        const activities = await response.json();
        allActivities = activities;
  
        // Collect categories
        categories = new Set();
        Object.values(activities).forEach((details) => {
          if (details.category) categories.add(details.category);
        });
        renderCategoryOptions();
        renderActivities();
        renderActivitySelect();
      } catch (error) {
        activitiesList.innerHTML =
          "<p>Failed to load activities. Please try again later.</p>";
        console.error("Error fetching activities:", error);
      }
    }
  
    function renderCategoryOptions() {
      if (!filterCategory) return;
      // Remove all except 'All'
      filterCategory.innerHTML = '<option value="">All</option>';
      Array.from(categories)
        .sort()
        .forEach((cat) => {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.textContent = cat;
          filterCategory.appendChild(opt);
        });
    }
  
    function renderActivitySelect() {
      if (!activitySelect) return;
      // Remove all except the placeholder
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      Object.entries(allActivities).forEach(([name, details]) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        activitySelect.appendChild(opt);
      });
    }
  
    function renderActivities() {
      let activitiesArr = Object.entries(allActivities);
  
      // Filter by category
      const selectedCategory = filterCategory ? filterCategory.value : "";
      if (selectedCategory) {
        activitiesArr = activitiesArr.filter(
          ([, details]) => details.category === selectedCategory
        );
      }
  
      // Search
      const searchTerm = searchActivities ? searchActivities.value.trim().toLowerCase() : "";
      if (searchTerm) {
        activitiesArr = activitiesArr.filter(
          ([name, details]) =>
            name.toLowerCase().includes(searchTerm) ||
            (details.description && details.description.toLowerCase().includes(searchTerm))
        );
      }
  
      // Sort
      const sortBy = sortActivities ? sortActivities.value : "name";
      activitiesArr.sort((a, b) => {
        if (sortBy === "name") {
          return a[0].localeCompare(b[0]);
        } else if (sortBy === "time") {
          // Assume details.schedule is a string, try to parse as date
          const dateA = Date.parse(a[1].schedule || "");
          const dateB = Date.parse(b[1].schedule || "");
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateA - dateB;
          } else {
            return (a[1].schedule || "").localeCompare(b[1].schedule || "");
          }
        }
        return 0;
      });
  
      // Render
      activitiesList.innerHTML = "";
      if (activitiesArr.length === 0) {
        activitiesList.innerHTML = "<p>No activities found.</p>";
        return;
      }
      activitiesArr.forEach(([name, details]) => {
        // ...existing code for rendering activity cards...
        // For brevity, use a placeholder for unchanged rendering logic
        // ...existing code...
      });
  
      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    }
  
    // Handle unregister functionality
    async function handleUnregister(event) {
      const button = event.target;
      const activity = button.getAttribute("data-activity");
      const email = button.getAttribute("data-email");
  
      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(
            activity
          )}/unregister?email=${encodeURIComponent(email)}`,
          {
            method: "DELETE",
          }
        );
  
        const result = await response.json();
  
        if (response.ok) {
          fetchActivities();
        } else {
          alert(result.detail || "Failed to unregister.");
        }
      } catch (error) {
        alert("Error unregistering student.");
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
          messageDiv.textContent = "Signed up successfully!";
          messageDiv.className = "success";
          fetchActivities();
        } else {
          messageDiv.textContent = result.detail || "Failed to sign up.";
          messageDiv.className = "error";
        }
        messageDiv.classList.remove("hidden");
      } catch (error) {
        messageDiv.textContent = "Error signing up.";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }
    });
  
    // Add event listeners for filter, sort, and search
    if (filterCategory) filterCategory.addEventListener("change", renderActivities);
    if (sortActivities) sortActivities.addEventListener("change", renderActivities);
    if (searchActivities) searchActivities.addEventListener("input", renderActivities);
  
    // Initialize app
    fetchActivities();
  });

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
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
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
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

  // Initialize app
  fetchActivities();
});
