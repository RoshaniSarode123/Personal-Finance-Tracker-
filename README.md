# Personal Finance Tracker Web App

A modern, fully responsive web application to track personal finances. It allows users to manage their daily expenses, set a monthly budget, visualize spending distribution, analyze monthly spending trends, and filter/search through past transactions.

## Features

- **Dashboard Layout:** A beautiful, responsive dashboard with summary cards for total budget, total expenses, and remaining balance.
- **Expense Management:** Add, edit, and delete expenses with title, amount, category, and date.
- **Budget Management:** Set a monthly budget and automatically calculate remaining budget with a visual progress bar.
- **Data Persistence:** Uses `localStorage` to save your data automatically across page reloads.
- **Filtering & Search:** Live search by expense title or filter by category (Food, Travel, Bills, etc.).
- **Data Visualization:** 
  - Pie Chart: View spending distribution across different categories.
  - Bar Chart: Analyze your monthly spending trends.
- **Export Data:** Export your expenses as a CSV file for backup or external analysis.
- **Premium UI:** Glassmorphism styling, custom animations, glowing background orbs, toast notifications, and interactive hover effects.
- **Dark/Light Mode:** Toggle between beautiful dark and light themes seamlessly.
- **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop screens.

## Tech Stack

- **HTML5**
- **CSS3** (Tailwind CSS via CDN & Custom Styles)
- **JavaScript** (Vanilla ES6+)
- **Chart.js** (Data Visualization)
- **FontAwesome** (Icons)

## Folder Structure

```text
finance-tracker/
│
├── index.html       # Main HTML file containing the layout
├── style.css        # Custom CSS for animations and glassmorphism
├── script.js        # JavaScript logic for DOM, LocalStorage, and Charts
├── assets/          # Directory for any images or static assets
└── README.md        # Project documentation
```

## Setup Instructions

This project uses standard web technologies and requires no complex build tools to run locally.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/finance-tracker.git
   cd finance-tracker
   ```

2. **Run Locally:**
   - Open `index.html` in your web browser.
   - Alternatively, you can serve the directory using `npx serve` or VS Code Live Server.

## Live Deployment

*(Update this section once deployed)*
Live URL: [Deploy on Netlify/Vercel/GitHub Pages]
