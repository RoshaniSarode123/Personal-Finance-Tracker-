// --- State Management ---
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// --- DOM Elements ---
// Budget & Summary
const budgetForm = document.getElementById('budgetForm');
const budgetInput = document.getElementById('budgetInput');
const expenseForm = document.getElementById('expenseForm');
const typeInput = document.getElementById('type');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const submitBtn = document.getElementById('submitExpenseBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editExpenseId = document.getElementById('editExpenseId');

// Summary Elements
const totalBudgetDisplay = document.getElementById('totalBudgetDisplay');
const totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
const totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
const remainingBudgetDisplay = document.getElementById('remainingBudgetDisplay');
const budgetProgressBar = document.getElementById('budgetProgressBar');
const budgetUsageText = document.getElementById('budgetUsageText');
const remainingStatusText = document.getElementById('remainingStatusText');

// List & Filters
const expenseList = document.getElementById('expenseList');
const emptyListState = document.getElementById('emptyListState');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');

// Theme & Notifications
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const toastContainer = document.getElementById('toastContainer');

// Chart
const ctx = document.getElementById('expenseChart').getContext('2d');
let expenseChart;
const noDataMessage = document.getElementById('noDataMessage');

const barCtx = document.getElementById('monthlyBarChart').getContext('2d');
let monthlyBarChart;
const noBarDataMessage = document.getElementById('noBarDataMessage');

const exportCsvBtn = document.getElementById('exportCsvBtn');

// --- Initialization ---
function init() {
    // Set initial date to today
    dateInput.valueAsDate = new Date();
    
    // Apply theme
    applyTheme();

    // Render initial data
    updateSummary();
    renderExpenses();
    initChart();

    // Event Listeners
    budgetForm.addEventListener('submit', handleBudgetSubmit);
    expenseForm.addEventListener('submit', handleExpenseSubmit);
    cancelEditBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', renderExpenses);
    filterCategory.addEventListener('change', renderExpenses);
    themeToggle.addEventListener('click', toggleTheme);
    exportCsvBtn.addEventListener('click', exportToCsv);
}

// --- Theme Management ---
function applyTheme() {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.classList.add('fa-moon');
        themeIcon.classList.remove('fa-sun');
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    applyTheme();
    // Update chart colors based on theme
    if (expenseChart) {
        updateChartColors();
    }
}

// --- Budget Management ---
function handleBudgetSubmit(e) {
    e.preventDefault();
    const amount = parseFloat(budgetInput.value);
    if (amount > 0) {
        monthlyBudget = amount;
        localStorage.setItem('monthlyBudget', monthlyBudget);
        updateSummary();
        showToast('Budget updated successfully!', 'success');
        budgetInput.value = '';
    }
}

// --- Expense/Income Management ---
function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const type = typeInput.value;
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || !amount || !category || !date) {
        showToast('Please fill all fields', 'warning');
        return;
    }

    const expense = {
        id: editExpenseId.value ? editExpenseId.value : generateId(),
        type,
        title,
        category,
        amount,
        date
    };

    if (editExpenseId.value) {
        const index = expenses.findIndex(exp => exp.id === editExpenseId.value);
        if(index !== -1) expenses[index] = expense;
        showToast('Transaction updated', 'success');
    } else {
        expenses.push(expense);
        showToast('Transaction added', 'success');
    }

    saveData();
    resetForm();
    updateSummary();
    renderExpenses();
    updateChart();
}

function deleteExpense(id) {
    if(confirm('Are you sure you want to delete this transaction?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveData();
        updateSummary();
        renderExpenses();
        updateChart();
        showToast('Transaction deleted', 'info');
    }
}

function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    editExpenseId.value = expense.id;
    typeInput.value = expense.type || 'Expense';
    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;

    submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Update Transaction';
    cancelEditBtn.classList.remove('hidden');
    document.getElementById('formTitle').innerHTML = `
        <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <i class="fa-solid fa-pen text-secondary text-sm"></i>
        </div>
        Edit Transaction
    `;
    titleInput.focus();
}

function resetForm() {
    expenseForm.reset();
    editExpenseId.value = '';
    typeInput.value = 'Expense';
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Transaction';
    cancelEditBtn.classList.add('hidden');
    document.getElementById('formTitle').innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <i class="fa-solid fa-plus text-primary text-sm"></i>
        </div>
        Add New Transaction
    `;
}

// --- Data & DOM Updates ---
function saveData() {
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function updateSummary() {
    // Only calculate expenses for total expenses display and budget
    const totalExpenses = expenses
        .filter(exp => !exp.type || exp.type === 'Expense')
        .reduce((sum, exp) => sum + exp.amount, 0);
        
    const totalIncome = expenses
        .filter(exp => exp.type === 'Income')
        .reduce((sum, exp) => sum + exp.amount, 0);
        
    const remaining = monthlyBudget - totalExpenses;
    
    // Animate Counters
    animateValue(totalBudgetDisplay, monthlyBudget);
    if(totalIncomeDisplay) animateValue(totalIncomeDisplay, totalIncome);
    animateValue(totalExpensesDisplay, totalExpenses);
    animateValue(remainingBudgetDisplay, remaining);

    // Update Progress Bar
    const usagePercentage = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;
    const clampedPercentage = Math.min(usagePercentage, 100);
    
    budgetProgressBar.style.width = `${clampedPercentage}%`;
    budgetUsageText.innerText = `${clampedPercentage.toFixed(1)}%`;

    // Visual feedback for over budget
    if (usagePercentage > 100) {
        budgetProgressBar.classList.remove('from-primary', 'to-secondary');
        budgetProgressBar.classList.add('from-danger', 'to-danger');
        remainingBudgetDisplay.classList.add('text-danger');
        budgetUsageText.classList.remove('text-primary');
        budgetUsageText.classList.add('text-danger');
        remainingStatusText.innerHTML = `<span class="text-danger"><i class="fa-solid fa-triangle-exclamation"></i> Over Budget!</span>`;
    } else if (usagePercentage > 85) {
        budgetProgressBar.classList.remove('from-primary', 'to-secondary', 'from-danger', 'to-danger');
        budgetProgressBar.classList.add('from-warning', 'to-warning');
        remainingBudgetDisplay.classList.remove('text-danger');
        budgetUsageText.classList.remove('text-primary', 'text-danger');
        budgetUsageText.classList.add('text-warning');
        remainingStatusText.innerHTML = `<span class="text-warning"><i class="fa-solid fa-circle-exclamation"></i> Almost there</span>`;
    } else {
        budgetProgressBar.classList.remove('from-danger', 'to-danger', 'from-warning', 'to-warning');
        budgetProgressBar.classList.add('from-primary', 'to-secondary');
        remainingBudgetDisplay.classList.remove('text-danger');
        budgetUsageText.classList.remove('text-danger', 'text-warning');
        budgetUsageText.classList.add('text-primary');
        remainingStatusText.innerHTML = `<span class="text-success"><i class="fa-solid fa-check-circle"></i> Looking good!</span>`;
    }
}

// Counter Animation Logic
function animateValue(obj, end, duration = 1000) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing function: easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        obj.innerHTML = formatCurrency(easeProgress * end);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = formatCurrency(end); // Ensure exact final value
        }
    };
    window.requestAnimationFrame(step);
}

function renderExpenses() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterCat = filterCategory.value;

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchTerm);
        const matchesCategory = filterCat === 'All' || exp.category === filterCat;
        return matchesSearch && matchesCategory;
    });

    expenseList.innerHTML = '';

    if (filteredExpenses.length === 0) {
        emptyListState.classList.remove('hidden');
        document.querySelector('table').classList.add('hidden');
    } else {
        emptyListState.classList.add('hidden');
        document.querySelector('table').classList.remove('hidden');

        filteredExpenses.forEach(exp => {
            const cat = getCategoryStyle(exp.category);
            const isIncome = exp.type === 'Income';
            const amountColor = isIncome ? 'text-success' : 'text-slate-900 dark:text-white';
            const amountPrefix = isIncome ? '+' : '';

            const tr = document.createElement('tr');
            tr.className = "expense-row group border-b border-slate-200/50 dark:border-slate-700/50 last:border-0";
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${cat.bg} ${cat.text}">
                            ${cat.icon}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">${exp.title}</div>
                            <div class="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                ${isIncome ? '<span class="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Income</span>' : ''}
                                ID: <span class="font-mono">${exp.id.substring(1, 6)}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                        ${exp.category}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                    ${formatDate(exp.date)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${amountColor}">
                    ${amountPrefix}${formatCurrency(exp.amount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="editExpense('${exp.id}')" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteExpense('${exp.id}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            expenseList.appendChild(tr);
        });
    }
}

// --- Chart.js ---
function initChart() {
    const chartData = getChartData();
    
    const config = {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)', 'rgba(168, 85, 247, 0.8)', 
                    'rgba(236, 72, 153, 0.8)', 'rgba(16, 185, 129, 0.8)', 
                    'rgba(244, 63, 94, 0.8)', 'rgba(245, 158, 11, 0.8)'
                ],
                borderWidth: 2,
                borderColor: isDarkMode ? '#0b1120' : '#f8fafc',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right', labels: { color: isDarkMode ? '#cbd5e1' : '#475569' } }
            }
        }
    };

    if(chartData.values.length === 0) {
        noDataMessage.classList.remove('hidden');
        document.getElementById('expenseChart').classList.add('hidden');
    } else {
        noDataMessage.classList.add('hidden');
        document.getElementById('expenseChart').classList.remove('hidden');
        expenseChart = new Chart(ctx, config);
    }
    
    initBarChart();
}

function initBarChart() {
    const barData = getMonthlyBarData();
    
    const config = {
        type: 'bar',
        data: {
            labels: barData.labels,
            datasets: [{
                label: 'Monthly Spending',
                data: barData.values,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: isDarkMode ? '#cbd5e1' : '#475569' } },
                x: { grid: { display: false }, ticks: { color: isDarkMode ? '#cbd5e1' : '#475569' } }
            },
            plugins: { legend: { display: false } }
        }
    };

    if(barData.values.length === 0) {
        noBarDataMessage.classList.remove('hidden');
        document.getElementById('monthlyBarChart').classList.add('hidden');
    } else {
        noBarDataMessage.classList.add('hidden');
        document.getElementById('monthlyBarChart').classList.remove('hidden');
        monthlyBarChart = new Chart(barCtx, config);
    }
}

function updateChart() {
    const chartData = getChartData();
    const barData = getMonthlyBarData();
    
    if (chartData.values.length === 0) {
        if(expenseChart) expenseChart.destroy();
        expenseChart = null;
        noDataMessage.classList.remove('hidden');
        document.getElementById('expenseChart').classList.add('hidden');
    } else {
        noDataMessage.classList.add('hidden');
        document.getElementById('expenseChart').classList.remove('hidden');
        if (expenseChart) {
            expenseChart.data.labels = chartData.labels;
            expenseChart.data.datasets[0].data = chartData.values;
            expenseChart.update();
        } else {
            initChart();
        }
    }
    
    if (barData.values.length === 0) {
        if(monthlyBarChart) monthlyBarChart.destroy();
        monthlyBarChart = null;
        noBarDataMessage.classList.remove('hidden');
        document.getElementById('monthlyBarChart').classList.add('hidden');
    } else {
        noBarDataMessage.classList.add('hidden');
        document.getElementById('monthlyBarChart').classList.remove('hidden');
        if (monthlyBarChart) {
            monthlyBarChart.data.labels = barData.labels;
            monthlyBarChart.data.datasets[0].data = barData.values;
            monthlyBarChart.update();
        } else {
            initBarChart();
        }
    }
}

function updateChartColors() {
    if (!expenseChart) return;
    expenseChart.options.plugins.legend.labels.color = isDarkMode ? '#cbd5e1' : '#475569';
    expenseChart.data.datasets[0].borderColor = isDarkMode ? '#0b1120' : '#f8fafc';
    expenseChart.update();
    
    if (monthlyBarChart) {
        monthlyBarChart.options.scales.x.ticks.color = isDarkMode ? '#cbd5e1' : '#475569';
        monthlyBarChart.options.scales.y.ticks.color = isDarkMode ? '#cbd5e1' : '#475569';
        monthlyBarChart.options.scales.y.grid.color = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        monthlyBarChart.data.datasets[0].borderColor = isDarkMode ? '#0b1120' : '#f8fafc';
        monthlyBarChart.update();
    }
}

function getChartData() {
    const categoryTotals = {};
    
    // Only include Expenses in the charts
    expenses.filter(exp => !exp.type || exp.type === 'Expense').forEach(exp => {
        if (categoryTotals[exp.category]) {
            categoryTotals[exp.category] += exp.amount;
        } else {
            categoryTotals[exp.category] = exp.amount;
        }
    });

    return {
        labels: Object.keys(categoryTotals),
        values: Object.values(categoryTotals)
    };
}

function getMonthlyBarData() {
    const monthlyTotals = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Sort expenses by date ascending to keep months in order
    // Only include Expenses
    const sortedExpenses = [...expenses]
        .filter(exp => !exp.type || exp.type === 'Expense')
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedExpenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        if (monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] += exp.amount;
        } else {
            monthlyTotals[monthKey] = exp.amount;
        }
    });

    return {
        labels: Object.keys(monthlyTotals),
        values: Object.values(monthlyTotals)
    };
}

// --- Utilities ---
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getCategoryStyle(category) {
    const styles = {
        'Food': { icon: '<i class="fa-solid fa-utensils"></i>', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-500' },
        'Shopping': { icon: '<i class="fa-solid fa-bag-shopping"></i>', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-500' },
        'Transportation': { icon: '<i class="fa-solid fa-car"></i>', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-500' },
        'Bills': { icon: '<i class="fa-solid fa-file-invoice-dollar"></i>', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-500' },
        'Entertainment': { icon: '<i class="fa-solid fa-film"></i>', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-500' },
        'Health': { icon: '<i class="fa-solid fa-heart-pulse"></i>', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-500' },
        'Travel': { icon: '<i class="fa-solid fa-plane"></i>', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-500' },
        'Other': { icon: '<i class="fa-solid fa-tag"></i>', bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-500' }
    };
    return styles[category] || styles['Other'];
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-enter flex items-center p-4 mb-3 text-slate-800 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-white/10`;
    
    // Define type styles
    let icon = '';
    if (type === 'success') {
        icon = '<div class="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mr-3 text-success border border-success/30"><i class="fa-solid fa-check"></i></div>';
    } else if (type === 'error') {
        icon = '<div class="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center mr-3 text-danger border border-danger/30"><i class="fa-solid fa-xmark"></i></div>';
    } else if (type === 'warning') {
        icon = '<div class="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center mr-3 text-warning border border-warning/30"><i class="fa-solid fa-exclamation"></i></div>';
    } else {
        icon = '<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-primary border border-primary/30"><i class="fa-solid fa-info"></i></div>';
    }

    toast.innerHTML = `
        ${icon}
        <div class="text-sm font-semibold">${message}</div>
    `;

    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => {
            toast.remove();
        }, 300); // Wait for exit animation to finish
    }, 3000);
}

function exportToCsv() {
    if (expenses.length === 0) {
        showToast('No expenses to export', 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Type,Title,Category,Amount\n";
    
    expenses.forEach(exp => {
        const type = exp.type || 'Expense';
        const row = `"${exp.date}","${type}","${exp.title}","${exp.category}",${exp.amount}`;
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finance_tracker_expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Expenses exported successfully!', 'success');
}

// Start App
document.addEventListener('DOMContentLoaded', init);
