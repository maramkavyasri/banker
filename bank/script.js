// Mock user data for authentication
let users = [];
let currentUser = null; // Store the current user
let balance = 0; // Initial balance
let transactions = []; // Array to hold transaction history

// Load users from local storage when the app starts
function loadUsers() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
}

// Function to show login form
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

// Function to show signup form
function showSignup() {
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

// Function to handle login
function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Find the user by email
    const user = users.find(user => user.email === email);

    // Check if user exists and password matches
    if (user && user.password === password) {
        alert('Login successful!');
        currentUser = user; // Set the current user
        balance = user.balance || 0; // Set the user's balance
        window.location.href = 'transactions.html'; // Redirect to transactions page
        updateBalanceDisplay();
    } else {
        const feedback = document.getElementById('login-feedback');
        feedback.textContent = 'Invalid email or password. Please try again.';
        feedback.style.display = 'block';
    }
}

// Function to handle signup
function signup() {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

   // Email format validation
   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailPattern.test(email)) {
       displayFeedback('Invalid email format.', 'signup-feedback', 'red');
       return;
   }

   // Check if passwords match
   if (password !== confirmPassword) {
       displayFeedback('Passwords do not match.', 'signup-feedback', 'red');
       return;
   }

   // Check if the email already exists
   if (users.some(user => user.email === email)) {
       displayFeedback('Email already exists. Please log in.', 'signup-feedback', 'red');
       return;
   }

   // Add new user to the users array with initial balance
   users.push({ email, password, balance: 0 });
    
   // Save updated users array to local storage
   localStorage.setItem('users', JSON.stringify(users));

   displayFeedback('Registration successful! You can now log in.', 'signup-feedback', 'green');
}

// Function to deposit amount
function deposit() {
   const amount = parseFloat(document.getElementById('deposit-amount').value);
   
   if (isNaN(amount) || amount <= 0) {
       displayTransactionFeedback('Please enter a valid amount.', 'deposit-feedback', 'red');
       return;
   }

   balance += amount; // Update balance
   transactions.push({ type: 'Deposit', amount }); // Record transaction
   updateBalanceDisplay();
   
   displayTransactionFeedback(`Successfully deposited $${amount.toFixed(2)}.`, 'deposit-feedback', 'green');
   
   updateTransactionChart(); // Update chart visualization

   // Update user's balance in local storage
   currentUser.balance = balance;
   localStorage.setItem('users', JSON.stringify(users));
}

// Function to withdraw amount
function withdraw() {
   const amount = parseFloat(document.getElementById('withdraw-amount').value);
   
   if (isNaN(amount) || amount <= 0) {
       displayTransactionFeedback('Please enter a valid amount.', 'withdraw-feedback', 'red');
       return;
   }

   if (amount > balance) {
       displayTransactionFeedback('Insufficient funds for this withdrawal.', 'withdraw-feedback', 'red');
       return;
   }

   balance -= amount; // Update balance
   transactions.push({ type: 'Withdraw', amount }); // Record transaction
   updateBalanceDisplay();
   
   displayTransactionFeedback(`Successfully withdrew $${amount.toFixed(2)}.`, 'withdraw-feedback', 'green');
   
   updateTransactionChart(); // Update chart visualization

   // Update user's balance in local storage
   currentUser.balance = balance;
   localStorage.setItem('users', JSON.stringify(users));
}

// Function to transfer amount to another user
function transfer() {
   const recipientEmail = document.getElementById('transfer-to-email').value.trim();
   const amount = parseFloat(document.getElementById('transfer-amount').value);
   
   if (isNaN(amount) || amount <= 0) {
       displayTransactionFeedback('Please enter a valid amount.', 'transfer-feedback', 'red');
       return;
   }

   const recipient = users.find(user => user.email === recipientEmail);
   
   if (!recipient) {
       displayTransactionFeedback('Recipient does not exist.', 'transfer-feedback', 'red');
       return;
   }

   if (amount > balance) {
       displayTransactionFeedback('Insufficient funds for this transfer.', 'transfer-feedback', 'red');
       return;
   }

   balance -= amount; // Deduct from sender's balance
   recipient.balance += amount; // Add the transferred amount to the recipient's balance

   transactions.push({ type: 'Transfer', amount }); // Record transaction

   updateBalanceDisplay();
   
   displayTransactionFeedback(`Successfully transferred $${amount.toFixed(2)} to ${recipientEmail}.`, 'transfer-feedback', 'green');

   updateTransactionChart(); // Update chart visualization

   // Update user's and recipient's balances in local storage
   currentUser.balance = balance;
   localStorage.setItem('users', JSON.stringify(users));
}

// Function to update displayed balance
function updateBalanceDisplay() {
   document.getElementById('current-balance').textContent = balance.toFixed(2);
}

// Function to handle logout
function logout() {
   localStorage.removeItem('loggedIn'); // Clear logged-in status
   currentUser = null; // Clear current user data
   window.location.href = 'index.html'; // Redirect to login page
}

// Utility function for displaying feedback messages on forms
function displayFeedback(message, elementId, color) {
   const feedback = document.getElementById(elementId);
   feedback.textContent = message;
   feedback.style.color = color;
   feedback.style.display = 'block';
}

// Utility function for displaying transaction feedback messages
function displayTransactionFeedback(message, elementId, color) {
   const feedback = document.getElementById(elementId);
   feedback.textContent = message;
   feedback.style.color = color;
   feedback.style.display = 'block';
}

// Chart.js setup for transaction visualization
let ctx; 
let myChart;

function initializeChart() {
  ctx = document.getElementById('transactionChart').getContext('2d');
  myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ['Deposit', 'Withdraw', 'Transfer'],
          datasets: [{
              label: '# of Transactions',
              data: [0, 0, 0], // Initial data counts for each transaction type.
              backgroundColor: [
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(255, 206, 86, 0.2)'
              ],
              borderColor: [
                  'rgba(75, 192, 192, 1)',
                  'rgba(255, 99, 132, 1)',
                  'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1,
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true,
              }
          }
      }
  });
}

function updateTransactionChart() {
  const transactionCounts = { Deposit: 0, Withdraw: 0, Transfer: 0 };

  transactions.forEach(transaction => {
      transactionCounts[transaction.type]++;
  });

  myChart.data.datasets[0].data[0] = transactionCounts.Deposit;
  myChart.data.datasets[0].data[1] = transactionCounts.Withdraw;
  myChart.data.datasets[0].data[2] = transactionCounts.Transfer;

  myChart.update();
}

// Initialize Chart.js when the page loads (for transactions.html)
window.onload = function() {
    loadUsers(); // Load users from local storage
    
    if (document.getElementById('transactionChart')) {
        initializeChart();
        
        updateTransactionChart(); 
    }
};