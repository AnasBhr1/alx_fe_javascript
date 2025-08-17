// Quote data structure - using array to store quote objects
let quotes = [];

// Default quotes to initialize the application
const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Hope" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
    { text: "The only impossible journey is the one you never begin.", category: "Journey" },
    { text: "In the middle of difficulty lies opportunity.", category: "Opportunity" },
    { text: "Be yourself; everyone else is already taken.", category: "Authenticity" }
];

// Storage keys for local and session storage
const STORAGE_KEYS = {
    QUOTES: 'dynamicQuoteGenerator_quotes',
    LAST_QUOTE: 'dynamicQuoteGenerator_lastQuote',
    USER_PREFERENCES: 'dynamicQuoteGenerator_preferences',
    SESSION_DATA: 'dynamicQuoteGenerator_sessionData',
    LAST_FILTER: 'dynamicQuoteGenerator_lastFilter'
};

// Current filter state
let currentFilter = 'all';
let filteredQuotes = [];

// DOM element references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const toggleFormBtn = document.getElementById('toggleForm');
const addQuoteForm = document.getElementById('addQuoteForm');
const categorySelect = document.getElementById('categorySelect');
const clearAllBtn = document.getElementById('clearAllQuotes');
const exportBtn = document.getElementById('exportQuotes');
const categoryFilter = document.getElementById('categoryFilter');
const categoryButtons = document.getElementById('categoryButtons');

// Track current quote index to avoid immediate repeats
let lastQuoteIndex = -1;

// Session data for demonstration
let sessionData = {
    quotesViewed: 0,
    sessionStartTime: new Date().toISOString(),
    lastViewedQuote: null,
    selectedCategory: '',
    userInteractions: 0
};

// Initialize the application
function initializeApp() {
    // Load data from storage
    loadQuotesFromStorage();
    loadSessionData();
    loadLastFilter();
    
    // Initialize filtering system
    populateCategories();
    applyCurrentFilter();
    
    updateStats();
    updateCategoryFilter();
    updateStorageStatus();
    
    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    toggleFormBtn.addEventListener('click', toggleAddQuoteForm);
    categorySelect.addEventListener('change', handleCategoryChange);
    clearAllBtn.addEventListener('click', clearAllQuotes);
    exportBtn.addEventListener('click', exportQuotesToJson);
    
    // Form input event listeners for validation
    document.getElementById('newQuoteText').addEventListener('input', validateForm);
    document.getElementById('newQuoteCategory').addEventListener('input', validateForm);
    
    // Enter key support for form inputs
    document.getElementById('newQuoteText').addEventListener('keypress', handleFormKeyPress);
    document.getElementById('newQuoteCategory').addEventListener('keypress', handleFormKeyPress);
    
    // Track user interactions
    document.addEventListener('click', trackUserInteraction);
}

// Advanced DOM manipulation: Show random quote with animations
function showRandomQuote() {
    // Use filtered quotes if a filter is active
    const availableQuotes = currentFilter === 'all' ? quotes : filteredQuotes;
    
    if (availableQuotes.length === 0) {
        if (currentFilter === 'all') {
            displayEmptyState("No quotes available. Add some quotes to get started!");
        } else {
            displayFilteredResults(`No quotes found in "${currentFilter}" category.`, true);
        }
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
    
    // Update session data
    sessionData.quotesViewed++;
    sessionData.lastViewedQuote = selectedQuote;
    saveSessionData();
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
    
    // Save to local storage
    saveQuotes();
    
    // Update filtering system - this will repopulate categories and reapply filters
    populateCategories();
    applyCurrentFilter();
    
    // Update UI elements
    updateStats();
    updateCategoryFilter();
    updateStorageStatus();
    
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
        filteredQuotes = [];
        currentFilter = 'all';
        saveQuotes();
        saveLastFilter();
        populateCategories();
        updateStats();
        updateCategoryFilter();
        updateStorageStatus();
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

// ===== WEB STORAGE FUNCTIONS =====

// Save quotes to local storage
function saveQuotes() {
    try {
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
        console.log('Quotes saved to local storage:', quotes.length, 'quotes');
    } catch (error) {
        console.error('Error saving quotes to local storage:', error);
        showNotification('Error saving quotes to storage!', 'error');
    }
}

// Load quotes from local storage
function loadQuotesFromStorage() {
    try {
        const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
        if (storedQuotes) {
            quotes = JSON.parse(storedQuotes);
            console.log('Quotes loaded from local storage:', quotes.length, 'quotes');
        } else {
            // Initialize with default quotes if no stored data
            quotes = [...defaultQuotes];
            saveQuotes();
            console.log('Initialized with default quotes');
        }
    } catch (error) {
        console.error('Error loading quotes from local storage:', error);
        quotes = [...defaultQuotes];
        showNotification('Error loading stored quotes, using defaults!', 'error');
    }
}

// Save session data to session storage
function saveSessionData() {
    try {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionData));
    } catch (error) {
        console.error('Error saving session data:', error);
    }
}

// Load session data from session storage
function loadSessionData() {
    try {
        const storedSessionData = sessionStorage.getItem(STORAGE_KEYS.SESSION_DATA);
        if (storedSessionData) {
            const parsedData = JSON.parse(storedSessionData);
            // Merge with current session data
            sessionData = { ...sessionData, ...parsedData };
        }
    } catch (error) {
        console.error('Error loading session data:', error);
    }
}

// Update storage status display
function updateStorageStatus() {
    const localStorageElement = document.getElementById('localStorageStatus');
    const sessionStorageElement = document.getElementById('sessionStorageStatus');
    
    // Local storage status
    try {
        const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
        const quotesCount = storedQuotes ? JSON.parse(storedQuotes).length : 0;
        localStorageElement.textContent = `${quotesCount} quotes stored`;
        localStorageElement.style.color = '#28a745';
    } catch (error) {
        localStorageElement.textContent = 'Storage error';
        localStorageElement.style.color = '#dc3545';
    }
    
    // Session storage status
    try {
        sessionStorageElement.textContent = `${sessionData.quotesViewed} quotes viewed this session`;
        sessionStorageElement.style.color = '#17a2b8';
    } catch (error) {
        sessionStorageElement.textContent = 'Session error';
        sessionStorageElement.style.color = '#dc3545';
    }
}

// Handle category change with session storage
function handleCategoryChange() {
    sessionData.selectedCategory = categorySelect.value;
    saveSessionData();
    showRandomQuote();
}

// Track user interactions for session storage
function trackUserInteraction() {
    sessionData.userInteractions++;
    saveSessionData();
}

// ===== DYNAMIC FILTERING SYSTEM =====

// Populate categories dynamically in both dropdown and button filters
function populateCategories() {
    // Get unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))].sort();
    
    // Update dropdown filter
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Update button filters
    categoryButtons.innerHTML = '';
    
    // Add "All" button
    const allButton = createCategoryButton('all', 'All', quotes.length);
    categoryButtons.appendChild(allButton);
    
    // Add category buttons
    categories.forEach(category => {
        const count = quotes.filter(quote => quote.category === category).length;
        const button = createCategoryButton(category.toLowerCase(), category, count);
        categoryButtons.appendChild(button);
    });
    
    // Update filter stats
    updateFilterStats();
}

// Create a category button element
function createCategoryButton(value, text, count) {
    const button = document.createElement('button');
    button.className = 'category-btn';
    button.setAttribute('data-category', value);
    button.onclick = () => selectCategoryFilter(value);
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    
    const countSpan = document.createElement('span');
    countSpan.className = 'count';
    countSpan.textContent = count;
    
    button.appendChild(textSpan);
    button.appendChild(countSpan);
    
    return button;
}

// Main filter function called by dropdown change
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    selectCategoryFilter(selectedCategory);
}

// Apply filter selection (used by both dropdown and buttons)
function selectCategoryFilter(category) {
    currentFilter = category;
    
    // Update dropdown to match
    categoryFilter.value = category;
    
    // Update button states
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Apply the filter
    applyCurrentFilter();
    
    // Save filter preference
    saveLastFilter();
    
    // Update session data
    sessionData.selectedCategory = category;
    saveSessionData();
}

// Apply the current filter and update UI
function applyCurrentFilter() {
    if (currentFilter === 'all') {
        filteredQuotes = [...quotes];
        hideActiveFilter();
    } else {
        filteredQuotes = quotes.filter(quote => 
            quote.category.toLowerCase() === currentFilter.toLowerCase()
        );
        showActiveFilter();
    }
    
    updateFilterStats();
    
    // Show filtered results message if needed
    if (filteredQuotes.length === 0 && currentFilter !== 'all') {
        displayFilteredResults(`No quotes found in "${getCurrentCategoryName()}" category.`, true);
    } else if (currentFilter !== 'all') {
        displayFilteredResults(`Showing ${filteredQuotes.length} quotes from "${getCurrentCategoryName()}" category.`, false);
    }
}

// Get the display name for current category
function getCurrentCategoryName() {
    if (currentFilter === 'all') return 'All Categories';
    return quotes.find(quote => quote.category.toLowerCase() === currentFilter.toLowerCase())?.category || currentFilter;
}

// Show active filter indicator
function showActiveFilter() {
    const activeFilter = document.getElementById('activeFilter');
    const activeFilterName = document.getElementById('activeFilterName');
    
    activeFilterName.textContent = getCurrentCategoryName();
    activeFilter.style.display = 'flex';
}

// Hide active filter indicator
function hideActiveFilter() {
    const activeFilter = document.getElementById('activeFilter');
    activeFilter.style.display = 'none';
}

// Clear current filter
function clearFilter() {
    selectCategoryFilter('all');
    quoteDisplay.innerHTML = '<div class="empty-state">Click "Show New Quote" to display a random quote!</div>';
}

// Update filter statistics
function updateFilterStats() {
    const visibleQuotes = document.getElementById('visibleQuotes');
    const totalFilterQuotes = document.getElementById('totalFilterQuotes');
    
    if (visibleQuotes && totalFilterQuotes) {
        visibleQuotes.textContent = filteredQuotes.length;
        totalFilterQuotes.textContent = quotes.length;
    }
}

// Display filtered results message
function displayFilteredResults(message, isNoResults) {
    const existingResults = document.querySelector('.filtered-results');
    if (existingResults) {
        existingResults.remove();
    }
    
    const resultsDiv = document.createElement('div');
    resultsDiv.className = `filtered-results ${isNoResults ? 'no-results' : ''}`;
    resultsDiv.textContent = message;
    
    // Insert before quote display
    quoteDisplay.parentNode.insertBefore(resultsDiv, quoteDisplay);
    
    if (isNoResults) {
        displayEmptyState("Try selecting a different category or add some quotes to this category.");
    }
}

// Save last selected filter to localStorage
function saveLastFilter() {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_FILTER, currentFilter);
    } catch (error) {
        console.error('Error saving filter preference:', error);
    }
}

// Load last selected filter from localStorage
function loadLastFilter() {
    try {
        const savedFilter = localStorage.getItem(STORAGE_KEYS.LAST_FILTER);
        if (savedFilter) {
            currentFilter = savedFilter;
        }
    } catch (error) {
        console.error('Error loading filter preference:', error);
        currentFilter = 'all';
    }
}

// ===== JSON IMPORT/EXPORT FUNCTIONS =====

// Export quotes to JSON file
function exportQuotesToJson() {
    try {
        // Create export data with metadata
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalQuotes: quotes.length,
                categories: [...new Set(quotes.map(q => q.category))],
                version: "1.0"
            },
            quotes: quotes
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Create blob and download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `quotes_export_${new Date().toISOString().split('T')[0]}.json`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up URL
        URL.revokeObjectURL(url);
        
        showNotification(`Successfully exported ${quotes.length} quotes!`, 'success');
        
    } catch (error) {
        console.error('Error exporting quotes:', error);
        showNotification('Error exporting quotes!', 'error');
    }
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showNotification('Please select a valid JSON file!', 'error');
        return;
    }
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const fileContent = event.target.result;
            let importedData;
            
            // Parse JSON
            try {
                importedData = JSON.parse(fileContent);
            } catch (parseError) {
                throw new Error('Invalid JSON format');
            }
            
            // Handle different import formats
            let importedQuotes = [];
            
            if (Array.isArray(importedData)) {
                // Direct array of quotes
                importedQuotes = importedData;
            } else if (importedData.quotes && Array.isArray(importedData.quotes)) {
                // Structured format with metadata
                importedQuotes = importedData.quotes;
            } else {
                throw new Error('Invalid file structure');
            }
            
            // Validate quote structure
            const validQuotes = importedQuotes.filter(quote => {
                return quote && 
                       typeof quote.text === 'string' && 
                       typeof quote.category === 'string' &&
                       quote.text.trim().length > 0 && 
                       quote.category.trim().length > 0;
            });
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in file');
            }
            
            // Check for duplicates and add new quotes
            let newQuotesCount = 0;
            let duplicatesCount = 0;
            
            validQuotes.forEach(importedQuote => {
                const isDuplicate = quotes.some(existingQuote => 
                    existingQuote.text.toLowerCase().trim() === importedQuote.text.toLowerCase().trim()
                );
                
                if (!isDuplicate) {
                    quotes.push({
                        text: importedQuote.text.trim(),
                        category: importedQuote.category.trim()
                    });
                    newQuotesCount++;
                } else {
                    duplicatesCount++;
                }
            });
            
            // Save to storage and update UI
            saveQuotes();
            populateCategories(); // Update category filters
            applyCurrentFilter(); // Reapply current filter
            updateStats();
            updateCategoryFilter();
            updateStorageStatus();
            
            // Show success message
            let message = `Successfully imported ${newQuotesCount} new quotes!`;
            if (duplicatesCount > 0) {
                message += ` (${duplicatesCount} duplicates skipped)`;
            }
            showNotification(message, 'success');
            
            // Clear file input
            event.target.value = '';
            
        } catch (error) {
            console.error('Error importing quotes:', error);
            showNotification(`Import failed: ${error.message}`, 'error');
            event.target.value = '';
        }
    };
    
    fileReader.onerror = function() {
        showNotification('Error reading file!', 'error');
        event.target.value = '';
    };
    
    fileReader.readAsText(file);
}