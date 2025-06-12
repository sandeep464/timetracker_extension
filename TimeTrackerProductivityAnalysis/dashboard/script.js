fetch("http://localhost:3000/api/logs?userId=sandeep123")
  .then(res => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log("Raw logs from backend:", data.logs);

    // Aggregate time per site
    const timePerSite = {};
    data.logs.forEach(log => {
      if (log.site) {
        timePerSite[log.site] = (timePerSite[log.site] || 0) + log.timeSpent;
      }
    });

    console.log("⏱️ Time spent per site:", timePerSite);

    // Prepare data for Chart.js
    const labels = Object.keys(timePerSite);
    const dataValues = Object.values(timePerSite).map(val => (val / 60).toFixed(2)); // convert to minutes

    // Render pie chart
    const ctx = document.getElementById("chart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Time Spent (minutes)",
            data: dataValues,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#C9CBCF",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  })
  .catch((error) => {
    console.error("Error fetching or processing data:", error);
    document.body.innerHTML += `<p style="color: red;">Error: ${error.message}</p>`;
  });
