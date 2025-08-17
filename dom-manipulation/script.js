currentFilter = 'all';
    }
}

// ===== SERVER SYNCHRONIZATION SYSTEM =====

// Mock API Configuration
const MOCK_API = {
    BASE_URL: 'https://jsonplaceholder.typicode.com',
    ENDPOINTS: {
        POSTS: '/posts',
        USERS: '/users',
        COMMENTS: '/comments'
    }
};

// Initialize server data (simulation + real API)
function initializeServerData() {
    // Simulate server having some additional quotes
    serverQuotes = [
        ...defaultQuotes,
        { text: "The way to get started is to quit talking and begin doing.", category: "Action" },
        { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
        { text: "Your limitation—it's only your imagination.", category: "Motivation" },
        { text: "Push yourself, because no one else is going to do it for you.", category: "Self-Improvement" },
        { text: "Great things never come from comfort zones.", category: "Growth" }
    ];
}

// Fetch data from JSONPlaceholder API
async function fetchFromJsonPlaceholder(endpoint) {
    try {
        console.log(`Fetching data from JSONPlaceholder: ${endpoint}`);
        
        const response = await fetch(`${MOCK_API.BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Successfully fetched ${data.length} items from JSONPlaceholder`);
        
        return data;
        
    } catch (error) {
        console.error('Error fetching from JSONPlaceholder:', error);
        throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
}

// Post data to JSONPlaceholder API
async function postToJsonPlaceholder(endpoint, data) {
    try {
        console.log(`Posting data to JSONPlaceholder: ${endpoint}`, data);
        
        const response = await fetch(`${MOCK_API.BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer fake-token-for-demo'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Successfully posted data to JSONPlaceholder:', responseData);
        
        return responseData;
        
    } catch (error) {
        console.error('Error posting to JSONPlaceholder:', error);
        throw new Error(`JSONPlaceholder POST error: ${error.message}`);
    }
}

// Update data on JSONPlaceholder API
async function updateOnJsonPlaceholder(endpoint, data) {
    try {
        console.log(`Updating data on JSONPlaceholder: ${endpoint}`, data);
        
        const response = await fetch(`${MOCK_API.BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer fake-token-for-demo'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Successfully updated data on JSONPlaceholder:', responseData);
        
        return responseData;
        
    } catch (error) {
        console.error('Error updating on JSONPlaceholder:', error);
        throw new Error(`JSONPlaceholder PUT error: ${error.message}`);
    }
}

// Transform JSONPlaceholder posts into quote format
function transformPostsToQuotes(posts) {
    return posts.slice(0, 10).map((post, index) => {
        // Create meaningful quotes from post titles and bodies
        const categories = ['Inspiration', 'Wisdom', 'Motivation', 'Life', 'Success'];
        const category = categories[index % categories.length];
        
        // Use post title as quote text (clean it up)
        let quoteText = post.title
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        // Make it more quote-like
        if (!quoteText.endsWith('.') && !quoteText.endsWith('!') && !quoteText.endsWith('?')) {
            quoteText += '.';
        }
        
        return {
            text: quoteText,
            category: category,
            apiSource: 'JSONPlaceholder',
            originalId: post.id
        };
    });
}

// Simulate server API call with real JSONPlaceholder integration
async function simulateServerCall(endpoint, method = 'GET', data = null) {
    return new Promise(async (resolve, reject) => {
        try {
            // Add realistic delay
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
            
            switch (endpoint) {
                case 'quotes':
                    if (method === 'GET') {
                        // 50% chance to fetch from JSONPlaceholder, 50% to use local server simulation
                        if (Math.random() < 0.5) {
                            try {
                                // Fetch from real JSONPlaceholder API
                                const posts = await fetchFromJsonPlaceholder(MOCK_API.ENDPOINTS.POSTS);
                                const apiQuotes = transformPostsToQuotes(posts);
                                
                                // Combine with server quotes
                                const combinedQuotes = [...serverQuotes, ...apiQuotes];
                                
                                // Remove duplicates based on text
                                const uniqueQuotes = [];
                                const seenTexts = new Set();
                                
                                combinedQuotes.forEach(quote => {
                                    const normalizedText = quote.text.toLowerCase().trim();
                                    if (!seenTexts.has(normalizedText)) {
                                        seenTexts.add(normalizedText);
                                        uniqueQuotes.push(quote);
                                    }
                                });
                                
                                serverQuotes = uniqueQuotes;
                                
                                resolve({ 
                                    data: [...serverQuotes], 
                                    lastModified: new Date().toISOString(),
                                    source: 'JSONPlaceholder + Server',
                                    apiData: true
                                });
                                
                            } catch (apiError) {
                                console.warn('JSONPlaceholder API failed, using local simulation:', apiError);
                                // Fallback to local simulation
                                resolve({ 
                                    data: [...serverQuotes], 
                                    lastModified: new Date().toISOString(),
                                    source: 'Local Simulation',
                                    apiData: false
                                });
                            }
                        } else {
                            // Use local server simulation
                            if (Math.random() < 0.3) {
                                const newServerQuote = {
                                    text: `Server insight ${Date.now()}`,
                                    category: "Server Wisdom"
                                };
                                if (!serverQuotes.some(q => q.text === newServerQuote.text)) {
                                    serverQuotes.push(newServerQuote);
                                }
                            }
                            resolve({ 
                                data: [...serverQuotes], 
                                lastModified: new Date().toISOString(),
                                source: 'Local Simulation',
                                apiData: false
                            });
                        }
                    } else if (method === 'POST') {
                        // Post data to server (including JSONPlaceholder API)
                        try {
                            // Transform quotes to post format for JSONPlaceholder
                            const postsToCreate = data.slice(0, 3).map((quote, index) => ({
                                title: quote.text.substring(0, 60) + (quote.text.length > 60 ? '...' : ''),
                                body: `Quote from category: ${quote.category}. Original text: ${quote.text}`,
                                userId: 1 + (index % 10)
                            }));
                            
                            // Post to JSONPlaceholder API
                            const postPromises = postsToCreate.map(post => 
                                postToJsonPlaceholder(MOCK_API.ENDPOINTS.POSTS, post)
                            );
                            
                            const apiResults = await Promise.all(postPromises);
                            console.log(`Successfully posted ${apiResults.length} items to JSONPlaceholder`);
                            
                            // Update local server data
                            serverQuotes = [...data];
                            
                            resolve({ 
                                success: true, 
                                data: serverQuotes,
                                apiResults: apiResults,
                                message: `Posted ${apiResults.length} quotes to JSONPlaceholder API`
                            });
                            
                        } catch (apiError) {
                            console.warn('Failed to post to JSONPlaceholder, using local storage:', apiError);
                            // Fallback to local storage only
                            serverQuotes = [...data];
                            resolve({ 
                                success: true, 
                                data: serverQuotes,
                                apiResults: null,
                                message: 'Saved to local server (API unavailable)'
                            });
                        }
                    } else if (method === 'PUT') {
                        // Update data on server
                        try {
                            // Simulate updating a post on JSONPlaceholder
                            if (data && data.length > 0) {
                                const sampleQuote = data[0];
                                const updateData = {
                                    id: 1,
                                    title: sampleQuote.text.substring(0, 60),
                                    body: `Updated quote: ${sampleQuote.text}`,
                                    userId: 1
                                };
                                
                                const updateResult = await updateOnJsonPlaceholder('/posts/1', updateData);
                                console.log('Successfully updated post on JSONPlaceholder:', updateResult);
                            }
                            
                            serverQuotes = [...data];
                            resolve({ 
                                success: true, 
                                data: serverQuotes,
                                message: 'Data updated on server and JSONPlaceholder'
                            });
                            
                        } catch (apiError) {
                            console.warn('Failed to update on JSONPlaceholder:', apiError);
                            serverQuotes = [...data];
                            resolve({ 
                                success: true, 
                                data: serverQuotes,
                                message: 'Data updated on local server only'
                            });
                        }
                    }
                    break;
                    
                default:
                    reject(new Error('Unknown endpoint'));
            }
        } catch (error) {
            // Simulate occasional network errors
            if (Math.random() < 0.1) {
                reject(new Error('Network connection failed'));
            } else {
                reject(error);
            }
        }
    });
}

// Fetch quotes from server with JSONPlaceholder integration
async function fetchQuotesFromServer() {
    try {
        console.log('Fetching quotes from server (may include JSONPlaceholder data)...');
        
        // Update UI to show fetching state
        updateSyncStatusIndicator('syncing');
        
        // Make API call to fetch quotes (includes JSONPlaceholder integration)
        const response = await simulateServerCall('quotes', 'GET');
        
        // Validate response
        if (!response || !response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid server response format');
        }
        
        // Return the fetched data with metadata
        const result = {
            quotes: response.data,
            lastModified: response.lastModified,
            fetchTime: new Date().toISOString(),
            count: response.data.length,
            source: response.source || 'Unknown',
            includesApiData: response.apiData || false
        };
        
        console.log(`Successfully fetched ${result.count} quotes from ${result.source}`);
        updateSyncStatusIndicator('online');
        
        // Show notification about data source
        if (result.includesApiData) {
            showSyncNotification(`Fetched ${result.count} quotes including live data from JSONPlaceholder API!`, 'success');
        }
        
        return result;
        
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
        updateSyncStatusIndicator('offline');
        
        // Re-throw with more context
        throw new Error(`Failed to fetch quotes from server: ${error.message}`);
    }
}

// Demonstration function to show JSONPlaceholder posts integration
async function demonstrateJsonPlaceholderIntegration() {
    try {
        console.log('Demonstrating JSONPlaceholder integration...');
        
        // Fetch posts from JSONPlaceholder
        const posts = await fetch('https://jsonplaceholder.typicode.com/posts');
        const postsData = await posts.json();
        
        console.log(`Fetched ${postsData.length} posts from JSONPlaceholder`);
        
        // Transform some posts into quotes for demonstration
        const demoQuotes = transformPostsToQuotes(postsData.slice(0, 5));
        
        console.log('Sample quotes created from JSONPlaceholder posts:', demoQuotes);
        
        return demoQuotes;
        
    } catch (error) {
        console.error('JSONPlaceholder demonstration failed:', error);
        return [];
    }
}

// Load sync settings from storage
function loadSyncSettings() {
    try {
        const settings = localStorage.getItem(STORAGE_KEYS.SYNC_SETTINGS);
        if (settings) {
            const parsed = JSON.parse(settings);
            autoSyncEnabled = parsed.autoSync || false;
            syncInterval = parsed.interval || 60000;
            syncIntervalSelect.value = syncInterval;
        }
        
        const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        if (lastSync) {
            lastSyncTime = new Date(lastSync);
        }
    } catch (error) {
        console.error('Error loading sync settings:', error);
    }
}

// Save sync settings to storage
function saveSyncSettings() {
    try {
        const settings = {
            autoSync: autoSyncEnabled,
            interval: syncInterval
        };
        localStorage.setItem(STORAGE_KEYS.SYNC_SETTINGS, JSON.stringify(settings));
        
        if (lastSyncTime) {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime.toISOString());
        }
    } catch (error) {
        console.error('Error saving sync settings:', error);
    }
}

// Update sync status display
function updateSyncStatus() {
    autoSyncStatusElement.textContent = autoSyncEnabled ? 'ON' : 'OFF';
    
    if (lastSyncTime) {
        const timeAgo = getTimeAgo(lastSyncTime);
        lastSyncTimeElement.textContent = `Last sync: ${timeAgo}`;
    }
    
    // Update sync status indicator
    if (isSyncing) {
        syncStatus.className = 'stat-number sync-status syncing';
        syncStatus.textContent = '●';
    } else if (conflictData) {
        syncStatus.className = 'stat-number sync-status conflict';
        syncStatus.textContent = '⚠';
    } else {
        syncStatus.className = 'stat-number sync-status online';
        syncStatus.textContent = '●';
    }
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

// Simulate server API call
async function simulateServerCall(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            try {
                switch (endpoint) {
                    case 'quotes':
                        if (method === 'GET') {
                            // Occasionally introduce "server changes" for conflict simulation
                            if (Math.random() < 0.3) {
                                const newServerQuote = {
                                    text: `Server quote ${Date.now()}`,
                                    category: "Server"
                                };
                                if (!serverQuotes.some(q => q.text === newServerQuote.text)) {
                                    serverQuotes.push(newServerQuote);
                                }
                            }
                            resolve({ data: [...serverQuotes], lastModified: new Date().toISOString() });
                        } else if (method === 'POST') {
                            serverQuotes = [...data];
                            resolve({ success: true, data: serverQuotes });
                        }
                        break;
                    default:
                        reject(new Error('Unknown endpoint'));
                }
            } catch (error) {
                // Simulate occasional network errors
                if (Math.random() < 0.1) {
                    reject(new Error('Network error'));
                } else {
                    reject(error);
                }
            }
        }, 1000 + Math.random() * 2000); // 1-3 second delay
    });
}

// Fetch quotes from server - Main server fetching function
async function fetchQuotesFromServer() {
    try {
        console.log('Fetching quotes from server...');
        
        // Update UI to show fetching state
        updateSyncStatusIndicator('syncing');
        
        // Make API call to fetch quotes
        const response = await simulateServerCall('quotes', 'GET');
        
        // Validate response
        if (!response || !response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid server response format');
        }
        
        // Return the fetched data with metadata
        const result = {
            quotes: response.data,
            lastModified: response.lastModified,
            fetchTime: new Date().toISOString(),
            count: response.data.length
        };
        
        console.log(`Successfully fetched ${result.count} quotes from server`);
        updateSyncStatusIndicator('online');
        
        return result;
        
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
        updateSyncStatusIndicator('offline');
        
        // Re-throw with more context
        throw new Error(`Failed to fetch quotes from server: ${error.message}`);
    }
}

// Update sync status indicator
function updateSyncStatusIndicator(status) {
    const syncStatusElement = document.getElementById('syncStatus');
    if (syncStatusElement) {
        syncStatusElement.className = `stat-number sync-status ${status}`;
        
        switch (status) {
            case 'syncing':
                syncStatusElement.textContent = '●';
                break;
            case 'online':
                syncStatusElement.textContent = '●';
                break;
            case 'offline':
                syncStatusElement.textContent = '●';
                break;
            case 'conflict':
                syncStatusElement.textContent = '⚠';
                break;
            default:
                syncStatusElement.textContent = '●';
        }
    }
}

// Perform manual sync
async function performManualSync() {
    if (isSyncing) return;
    
    isSyncing = true;
    manualSyncBtn.disabled = true;
    manualSyncBtn.textContent = '🔄 Syncing...';
    updateSyncStatus();
    
    try {
        await syncWithServer();
        showSyncNotification('Manual sync completed successfully!', 'success');
    } catch (error) {
        console.error('Manual sync failed:', error);
        showSyncNotification(`Sync failed: ${error.message}`, 'error');
    } finally {
        isSyncing = false;
        manualSyncBtn.disabled = false;
        manualSyncBtn.textContent = '🔄 Sync Now';
        updateSyncStatus();
    }
}

// Main sync function
async function syncWithServer() {
    try {
        // Fetch server data using the dedicated function
        const serverResponse = await fetchQuotesFromServer();
        const serverData = serverResponse.quotes;
        
        // Check for conflicts
        const hasConflicts = await detectConflicts(serverData);
        
        if (hasConflicts) {
            // Store conflict data and show resolution UI
            conflictData = {
                serverData: serverData,
                localData: [...quotes],
                timestamp: new Date().toISOString(),
                serverMetadata: {
                    lastModified: serverResponse.lastModified,
                    fetchTime: serverResponse.fetchTime,
                    count: serverResponse.count
                }
            };
            showConflictModal();
            updateSyncStatus();
            return;
        }
        
        // No conflicts - perform simple merge
        await mergeServerData(serverData);
        
        lastSyncTime = new Date();
        saveSyncSettings();
        updateSyncStatus();
        
    } catch (error) {
        throw new Error(`Sync failed: ${error.message}`);
    }
}

// Detect conflicts between local and server data
async function detectConflicts(serverData) {
    // Simple conflict detection: check if server has different quotes
    const localTexts = new Set(quotes.map(q => q.text.toLowerCase().trim()));
    const serverTexts = new Set(serverData.map(q => q.text.toLowerCase().trim()));
    
    // Check if server has quotes we don't have or if counts differ significantly
    const serverOnlyQuotes = serverData.filter(sq => 
        !localTexts.has(sq.text.toLowerCase().trim())
    );
    
    const localOnlyQuotes = quotes.filter(lq => 
        !serverTexts.has(lq.text.toLowerCase().trim())
    );
    
    // Conflict exists if both sides have unique data
    return serverOnlyQuotes.length > 0 && localOnlyQuotes.length > 0;
}

// Merge server data with local data
async function mergeServerData(serverData) {
    const localTexts = new Set(quotes.map(q => q.text.toLowerCase().trim()));
    const newQuotes = serverData.filter(sq => 
        !localTexts.has(sq.text.toLowerCase().trim())
    );
    
    if (newQuotes.length > 0) {
        quotes.push(...newQuotes);
        saveQuotes();
        populateCategories();
        applyCurrentFilter();
        updateStats();
        updateCategoryFilter();
        updateStorageStatus();
        
        showSyncNotification(`Added ${newQuotes.length} new quotes from server!`, 'success');
    }
    
    // Update server with our local data using POST
    try {
        const postResponse = await simulateServerCall('quotes', 'POST', quotes);
        
        if (postResponse.apiResults) {
            showSyncNotification(
                `✅ ${postResponse.message} - Posted ${postResponse.apiResults.length} quotes to JSONPlaceholder!`,
                'success'
            );
        } else {
            showSyncNotification(`✅ ${postResponse.message}`, 'success');
        }
        
        console.log('Successfully synchronized local data with server');
        
    } catch (error) {
        console.warn('Failed to update server with local data:', error);
        showSyncNotification(`⚠️ Local data updated but server sync failed: ${error.message}`, 'warning');
    }
}

// Show conflict resolution modal
function showConflictModal() {
    const modal = document.getElementById('conflictModal');
    const comparison = document.getElementById('conflictComparison');
    
    if (conflictData) {
        const serverCount = conflictData.serverData.length;
        const localCount = conflictData.localData.length;
        const serverOnlyCount = conflictData.serverData.filter(sq => 
            !conflictData.localData.some(lq => lq.text.toLowerCase().trim() === sq.text.toLowerCase().trim())
        ).length;
        const localOnlyCount = conflictData.localData.filter(lq => 
            !conflictData.serverData.some(sq => sq.text.toLowerCase().trim() === lq.text.toLowerCase().trim())
        ).length;
        
        comparison.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="padding: 15px; border: 2px solid #28a745; border-radius: 10px;">
                    <h4 style="color: #28a745; margin: 0 0 10px 0;">🖥️ Server Data</h4>
                    <p>Total quotes: <strong>${serverCount}</strong></p>
                    <p>Server-only quotes: <strong>${serverOnlyCount}</strong></p>
                </div>
                <div style="padding: 15px; border: 2px solid #007bff; border-radius: 10px;">
                    <h4 style="color: #007bff; margin: 0 0 10px 0;">💻 Local Data</h4>
                    <p>Total quotes: <strong>${localCount}</strong></p>
                    <p>Local-only quotes: <strong>${localOnlyCount}</strong></p>
                </div>
            </div>
            <p><strong>Recommendation:</strong> Choose "Merge Both" to keep all quotes from both sources.</p>
        `;
    }
    
    modal.style.display = 'flex';
}

// Close conflict modal
function closeConflictModal() {
    const modal = document.getElementById('conflictModal');
    modal.style.display = 'none';
}

// Resolve conflict based on user choice
async function resolveConflict(strategy) {
    if (!conflictData) return;
    
    try {
        switch (strategy) {
            case 'local':
                // Keep local data, upload to server
                const uploadResponse = await simulateServerCall('quotes', 'POST', quotes);
                
                if (uploadResponse.apiResults) {
                    showSyncNotification(
                        `✅ Kept local changes and posted ${uploadResponse.apiResults.length} quotes to JSONPlaceholder!`,
                        'success'
                    );
                } else {
                    showSyncNotification('✅ Kept local changes and updated server!', 'success');
                }
                break;
                
            case 'server':
                // Use server data, replace local
                quotes = [...conflictData.serverData];
                saveQuotes();
                populateCategories();
                applyCurrentFilter();
                updateStats();
                updateCategoryFilter();
                updateStorageStatus();
                showSyncNotification('Replaced local data with server data!', 'warning');
                break;
                
            case 'merge':
                // Merge both datasets
                const serverTexts = new Set(conflictData.serverData.map(q => q.text.toLowerCase().trim()));
                const localTexts = new Set(quotes.map(q => q.text.toLowerCase().trim()));
                
                // Add server quotes that we don't have
                const newServerQuotes = conflictData.serverData.filter(sq => 
                    !localTexts.has(sq.text.toLowerCase().trim())
                );
                
                // Add local quotes that server doesn't have
                const newLocalQuotes = quotes.filter(lq => 
                    !serverTexts.has(lq.text.toLowerCase().trim())
                );
                
                // Combine all quotes
                quotes = [...conflictData.serverData, ...newLocalQuotes];
                
                // Remove duplicates (extra safety)
                const uniqueQuotes = [];
                const seenTexts = new Set();
                
                quotes.forEach(quote => {
                    const normalizedText = quote.text.toLowerCase().trim();
                    if (!seenTexts.has(normalizedText)) {
                        seenTexts.add(normalizedText);
                        uniqueQuotes.push(quote);
                    }
                });
                
                quotes = uniqueQuotes;
                
                saveQuotes();
                
                // Sync merged data with server using PUT method
                const syncResponse = await simulateServerCall('quotes', 'PUT', quotes);
                showSyncNotification(`✅ ${syncResponse.message} - Total: ${quotes.length} quotes`, 'success');
                
                populateCategories();
                applyCurrentFilter();
                updateStats();
                updateCategoryFilter();
                updateStorageStatus();
                break;
        }
        
        lastSyncTime = new Date();
        conflictData = null;
        saveSyncSettings();
        updateSyncStatus();
        closeConflictModal();
        
    } catch (error) {
        console.error('Error resolving conflict:', error);
        showSyncNotification(`Error resolving conflict: ${error.message}`, 'error');
    }
}

// Toggle auto sync
function toggleAutoSync() {
    autoSyncEnabled = !autoSyncEnabled;
    saveSyncSettings();
    updateSyncStatus();
    
    if (autoSyncEnabled) {
        startAutoSync();
        showSyncNotification('Auto sync enabled!', 'success');
    } else {
        stopAutoSync();
        showSyncNotification('Auto sync disabled!', 'warning');
    }
}

// Start auto sync
function startAutoSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
    }
    
    syncTimer = setInterval(async () => {
        if (!isSyncing) {
            try {
                await syncWithServer();
                console.log('Auto sync completed');
            } catch (error) {
                console.error('Auto sync failed:', error);
                // Don't show notifications for auto sync failures to avoid spam
            }
        }
    }, syncInterval);
}

// Stop auto sync
function stopAutoSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}

// Update sync interval
function updateSyncInterval() {
    syncInterval = parseInt(syncIntervalSelect.value);
    saveSyncSettings();
    
    if (autoSyncEnabled) {
        startAutoSync(); // Restart with new interval
    }
    
    showSyncNotification(`Sync interval updated to ${syncInterval / 1000} seconds`, 'success');
}

// Force server data (replace local with server)
async function forceServerData() {
    if (isSyncing) return;
    
    const confirmed = confirm('This will replace ALL local quotes with server data. This cannot be undone. Continue?');
    if (!confirmed) return;
    
    isSyncing = true;
    forceServerBtn.disabled = true;
    forceServerBtn.textContent = '⬇️ Downloading...';
    updateSyncStatus();
    
    try {
        // Use the dedicated fetchQuotesFromServer function
        const serverResponse = await fetchQuotesFromServer();
        quotes = [...serverResponse.quotes];
        
        saveQuotes();
        populateCategories();
        applyCurrentFilter();
        updateStats();
        updateCategoryFilter();
        updateStorageStatus();
        
        lastSyncTime = new Date();
        saveSyncSettings();
        
        showSyncNotification(`Local data replaced with ${serverResponse.count} server quotes!`, 'warning');
        
    } catch (error) {
        console.error('Force sync failed:', error);
        showSyncNotification(`Force sync failed: ${error.message}`, 'error');
    } finally {
        isSyncing = false;
        forceServerBtn.disabled = false;
        forceServerBtn.textContent = '⬇️ Force Server Data';
        updateSyncStatus();
    }
}

// Show sync notification
function showSyncNotification(message, type = 'success') {
    // Remove existing sync notifications
    const existingNotifications = document.querySelectorAll('.sync-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `sync-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Test JSONPlaceholder API integration
async function testJsonPlaceholderAPI() {
    const testBtn = document.getElementById('testApiBtn');
    const originalText = testBtn.textContent;
    
    testBtn.disabled = true;
    testBtn.textContent = '🧪 Testing API...';
    
    try {
        console.log('Testing JSONPlaceholder API integration...');
        showSyncNotification('Testing JSONPlaceholder API connection...', 'info');
        
        // Test 1: GET request
        console.log('🔍 Testing GET request...');
        const posts = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!posts.ok) {
            throw new Error(`GET failed: HTTP ${posts.status}: ${posts.statusText}`);
        }
        
        const postsData = await posts.json();
        console.log(`✅ GET Success: Fetched ${postsData.length} posts from JSONPlaceholder`);
        
        // Test 2: POST request
        console.log('📤 Testing POST request...');
        const testPostData = {
            title: 'Test Quote from Dynamic Quote Generator',
            body: 'This is a test post created by the Dynamic Quote Generator to demonstrate POST functionality with proper headers.',
            userId: 1
        };
        
        const postResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(testPostData)
        });
        
        if (!postResponse.ok) {
            throw new Error(`POST failed: HTTP ${postResponse.status}: ${postResponse.statusText}`);
        }
        
        const postResult = await postResponse.json();
        console.log('✅ POST Success:', postResult);
        
        // Test 3: PUT request
        console.log('📝 Testing PUT request...');
        const testPutData = {
            id: 1,
            title: 'Updated Quote from Dynamic Quote Generator',
            body: 'This demonstrates PUT functionality with proper Content-Type headers.',
            userId: 1
        };
        
        const putResponse = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testPutData)
        });
        
        if (!putResponse.ok) {
            throw new Error(`PUT failed: HTTP ${putResponse.status}: ${putResponse.statusText}`);
        }
        
        const putResult = await putResponse.json();
        console.log('✅ PUT Success:', putResult);
        
        // Transform a few posts to quotes for demonstration
        const testQuotes = transformPostsToQuotes(postsData.slice(0, 3));
        
        // Show comprehensive results
        showSyncNotification(
            `✅ Complete API Test Success!\n` +
            `GET: ${postsData.length} posts\n` +
            `POST: Created post ID ${postResult.id}\n` +
            `PUT: Updated post ID ${putResult.id}\n` +
            `Quotes: ${testQuotes.length} samples created`,
            'success'
        );
        
        // Log sample data with headers information
        console.log('📊 API Test Results:', {
            getResults: { count: postsData.length, sample: postsData[0] },
            postResult: postResult,
            putResult: putResult,
            sampleQuotes: testQuotes,
            headersUsed: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });
        
        // Optionally add one test quote to demonstrate
        if (testQuotes.length > 0 && confirm('Add a sample quote from JSONPlaceholder to your collection?')) {
            const sampleQuote = testQuotes[0];
            sampleQuote.text = `[API Test] ${sampleQuote.text}`;
            sampleQuote.apiTestTimestamp = new Date().toISOString();
            quotes.push(sampleQuote);
            saveQuotes();
            populateCategories();
            applyCurrentFilter();
            updateStats();
            updateCategoryFilter();
            updateStorageStatus();
            
            showSyncNotification('Sample quote from JSONPlaceholder added to your collection!', 'success');
        }
        
    } catch (error) {
        console.error('❌ JSONPlaceholder API test failed:', error);
        showSyncNotification(`❌ API Test Failed: ${error.message}`, 'error');
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = originalText;
    }
}// Quote data structure - using array to store quote objects
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
    LAST_FILTER: 'dynamicQuoteGenerator_lastFilter',
    LAST_SYNC: 'dynamicQuoteGenerator_lastSync',
    SYNC_SETTINGS: 'dynamicQuoteGenerator_syncSettings'
};

// Current filter state
let currentFilter = 'all';
let filteredQuotes = [];

// Server sync state
let autoSyncEnabled = false;
let syncInterval = 60000; // Default 1 minute
let syncTimer = null;
let lastSyncTime = null;
let isSyncing = false;
let serverQuotes = []; // Simulated server data
let conflictData = null;

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

// Sync-related DOM elements
const manualSyncBtn = document.getElementById('manualSync');
const toggleAutoSyncBtn = document.getElementById('toggleAutoSync');
const forceServerBtn = document.getElementById('forceServerData');
const syncIntervalSelect = document.getElementById('syncInterval');
const syncStatus = document.getElementById('syncStatus');
const lastSyncTimeElement = document.getElementById('lastSyncTime');
const autoSyncStatusElement = document.getElementById('autoSyncStatus');

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
    loadSyncSettings();
    
    // Initialize server data simulation
    initializeServerData();
    
    // Demonstrate JSONPlaceholder integration on startup
    demonstrateJsonPlaceholderIntegration();
    
    // Initialize filtering system
    populateCategories();
    applyCurrentFilter();
    
    updateStats();
    updateCategoryFilter();
    updateStorageStatus();
    updateSyncStatus();
    
    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    toggleFormBtn.addEventListener('click', toggleAddQuoteForm);
    categorySelect.addEventListener('change', handleCategoryChange);
    clearAllBtn.addEventListener('click', clearAllQuotes);
    exportBtn.addEventListener('click', exportQuotesToJson);
    
    // Sync event listeners
    manualSyncBtn.addEventListener('click', performManualSync);
    toggleAutoSyncBtn.addEventListener('click', toggleAutoSync);
    forceServerBtn.addEventListener('click', forceServerData);
    syncIntervalSelect.addEventListener('change', updateSyncInterval);
    
    // Add test API button listener
    const testApiBtn = document.getElementById('testApiBtn');
    if (testApiBtn) {
        testApiBtn.addEventListener('click', testJsonPlaceholderAPI);
    }
    
    // Form input event listeners for validation
    document.getElementById('newQuoteText').addEventListener('input', validateForm);
    document.getElementById('newQuoteCategory').addEventListener('input', validateForm);
    
    // Enter key support for form inputs
    document.getElementById('newQuoteText').addEventListener('keypress', handleFormKeyPress);
    document.getElementById('newQuoteCategory').addEventListener('keypress', handleFormKeyPress);
    
    // Track user interactions
    document.addEventListener('click', trackUserInteraction);
    
    // Start auto sync if enabled
    if (autoSyncEnabled) {
        startAutoSync();
    }
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
        const quotesWithTimestamp = {
            quotes: quotes,
            lastModified: new Date().toISOString(),
            version: Date.now()
        };
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotesWithTimestamp));
        console.log('Quotes saved to local storage:', quotes.length, 'quotes');
    } catch (error) {
        console.error('Error saving quotes to local storage:', error);
        showNotification('Error saving quotes to storage!', 'error');
    }
}

// Load quotes from local storage
function loadQuotesFromStorage() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEYS.QUOTES);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
                // Legacy format - just quotes array
                quotes = parsedData;
            } else if (parsedData.quotes) {
                // New format with metadata
                quotes = parsedData.quotes;
            }
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