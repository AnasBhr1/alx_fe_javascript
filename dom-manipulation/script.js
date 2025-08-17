// Quote data structure - using array to store quote objects
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Hope" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
    { text: "The only impossible journey is the one you never begin.", category: "Journey" },
    { text: "In the middle of difficulty lies opportunity.", category: "Opportunity" },
    { text: "Be yourself; everyone else is already taken.", category: "Authenticity" }
];

// DOM element references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const toggleFormBtn = document.getElementById('toggleForm');
const addQuoteForm = document.getElementById('addQuoteForm');
const categorySelect = document.getElementById('categorySelect');
const clearAllBtn = document.getElementById('clearAllQuotes');

// Track current quote index to avoid immediate repeats
let lastQuoteIndex = -1;

// Initialize the application
function initializeApp() {
    updateStats();
    updateCategoryFilter();
    
    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    toggleFormBtn.addEventListener('click', toggleAddQuoteForm);
    categorySelect.addEventListener('change', showRandomQuote);
    clearAllBtn.addEventListener('click', clearAllQuotes);
    
    // Form input event listeners for validation
    document.getElementById('newQuoteText').addEventListener('input', validateForm);
    document.getElementById('newQuoteCategory').addEventListener('input', validateForm);
    
    // Enter key support for form inputs
    document.getElementById('newQuoteText').addEventListener('keypress', handleFormKeyPress);
    document.getElementById('newQuoteCategory').addEventListener('keypress', handleFormKeyPress);
}

// Advanced DOM manipulation: Show random quote with animations
function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    let availableQuotes = quotes;
    
    // Filter by category if selected
    if (selectedCategory) {
        availableQuotes = quotes.filter(quote => 
            quote.category.toLowerCase() === selectedCategory.toLowerCase()
        );
    }
    
    if (availableQuotes.length === 0) {
        displayEmptyState("No quotes available for the selected category.");
        return;
    }

    // Avoid showing the same quote twice in a row
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * availableQuotes.length);
    } while (randomIndex === lastQuoteIndex && availableQuotes.length > 1);
    
    lastQuoteIndex = randomIndex;
    const selectedQuote = availableQuotes[randomIndex];
    
    // Create quote elements dynamically
    const quoteContainer = document.createElement('div');
    quoteContainer.style.opacity = '0';
    quoteContainer.style.transform = 'translateY(20px)';
    quoteContainer.style.transition = 'all 0.5s ease';
    
    const quoteTextElement = document.createElement('div');
    quoteTextElement.className = 'quote-text';
    quoteTextElement.textContent = `"${selectedQuote.text}"`;
    
    const quoteCategoryElement = document.createElement('div');
    quoteCategoryElement.className = 'quote-category';
    quoteCategoryElement.textContent = `— ${selectedQuote.category}`;
    
    // Clear previous content and add new elements
    quoteDisplay.innerHTML = '';
    quoteContainer.appendChild(quoteTextElement);
    quoteContainer.appendChild(quoteCategoryElement);
    quoteDisplay.appendChild(quoteContainer);
    
    // Trigger animation
    setTimeout(() => {
        quoteContainer.style.opacity = '1';
        quoteContainer.style.transform = 'translateY(0)';
    }, 50);
}

// Display empty state message
function displayEmptyState(message) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.textContent = message;
    quoteDisplay.innerHTML = '';
    quoteDisplay.appendChild(emptyDiv);
}

// Toggle the add quote form visibility
function toggleAddQuoteForm() {
    const isActive = addQuoteForm.classList.contains('active');
    
    if (isActive) {
        addQuoteForm.classList.remove('active');
        toggleFormBtn.textContent = 'Add New Quote';
    } else {
        addQuoteForm.classList.add('active');
        toggleFormBtn.textContent = 'Hide Form';
        document.getElementById('newQuoteText').focus();
    }
}

// Function to create add quote form dynamically (as requested in requirements)
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.innerHTML = `
        <div>
            <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
            <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
            <button onclick="addQuote()">Add Quote</button>
        </div>
    `;
    return formContainer;
}

// Advanced DOM manipulation: Add new quote to the array and update UI
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    // Validation
    if (!quoteText || !quoteCategory) {
        showNotification('Please fill in both quote text and category!', 'error');
        return;
    }
    
    if (quoteText.length < 10) {
        showNotification('Quote text should be at least 10 characters long!', 'error');
        return;
    }
    
    // Check for duplicate quotes
    const isDuplicate = quotes.some(quote => 
        quote.text.toLowerCase() === quoteText.toLowerCase()
    );
    
    if (isDuplicate) {
        showNotification('This quote already exists!', 'error');
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text: quoteText,
        category: quoteCategory.charAt(0).toUpperCase() + quoteCategory.slice(1).toLowerCase()
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Update UI elements
    updateStats();
    updateCategoryFilter();
    
    // Clear form inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Hide form
    addQuoteForm.classList.remove('active');
    toggleFormBtn.textContent = 'Add New Quote';
    
    // Show the new quote
    showRandomQuote();
    
    // Show success notification
    showNotification(`Successfully added quote to "${newQuote.category}" category!`, 'success');
}

// Update statistics display
function updateStats() {
    const totalQuotesElement = document.getElementById('totalQuotes');
    const totalCategoriesElement = document.getElementById('totalCategories');
    
    totalQuotesElement.textContent = quotes.length;
    
    // Count unique categories
    const uniqueCategories = new Set(quotes.map(quote => quote.category.toLowerCase()));
    totalCategoriesElement.textContent = uniqueCategories.size;
    
    // Animate the numbers
    animateNumber(totalQuotesElement, quotes.length);
    animateNumber(totalCategoriesElement, uniqueCategories.size);
}

// Update category filter dropdown
function updateCategoryFilter() {
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))].sort();
    
    // Clear existing options (except "All Categories")
    categorySelect.innerHTML = '<option value="">All Categories</option>';
    
    // Add category options
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Clear all quotes with confirmation
function clearAllQuotes() {
    if (quotes.length === 0) {
        showNotification('No quotes to clear!', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to delete all ${quotes.length} quotes? This cannot be undone.`)) {
        quotes = [];
        updateStats();
        updateCategoryFilter();
        displayEmptyState("All quotes have been cleared. Add some new quotes to get started!");
        showNotification('All quotes have been cleared!', 'success');
    }
}

// Form validation
function validateForm() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    const addButton = addQuoteForm.querySelector('button');
    
    if (quoteText && quoteCategory && quoteText.length >= 10) {
        addButton.style.opacity = '1';
        addButton.style.pointerEvents = 'auto';
    } else {
        addButton.style.opacity = '0.6';
        addButton.style.pointerEvents = 'none';
    }
}

// Handle Enter key in form inputs
function handleFormKeyPress(event) {
    if (event.key === 'Enter') {
        addQuote();
    }
}

// Show notification messages
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Styling
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 25px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Type-specific styling
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
            break;
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animate numbers in statistics
function animateNumber(element, targetNumber) {
    const startNumber = parseInt(element.textContent) || 0;
    const duration = 500;
    const increment = (targetNumber - startNumber) / (duration / 16);
    let currentNumber = startNumber;
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if ((increment > 0 && currentNumber >= targetNumber) || 
            (increment < 0 && currentNumber <= targetNumber)) {
            element.textContent = targetNumber;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(currentNumber);
        }
    }, 16);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);