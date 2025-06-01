window.addEventListener('error', function(e) {
    console.error('Unhandled error:', e.error);
    addDebugLog(`Unhandled error: ${e.error.message}`, 'error');
});

// Configuration
let HELLO_GENAI_URL = window.location.origin;
if (window.location.protocol === 'file:') {
    HELLO_GENAI_URL = "http://localhost:8081";
}
const CHAT_API_ENDPOINT = "/api/chat";

// Debug logging
let debugLog = [];
function addDebugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    debugLog.push(logEntry);
    
    if (debugLog.length > 100) {
        debugLog = debugLog.slice(-100);
    }
    
    updateDebugDisplay();
    console.log(logEntry);
}

function updateDebugDisplay() {
    const debugLogElement = document.getElementById('debug-log');
    if (debugLogElement) {
        debugLogElement.textContent = debugLog.join('\n');
        debugLogElement.scrollTop = debugLogElement.scrollHeight;
    }
    
    document.getElementById('debug-api-url').textContent = HELLO_GENAI_URL + CHAT_API_ENDPOINT;
    document.getElementById('debug-appliances').textContent = Array.from(selectedAppliances).join(', ') || 'None';
    document.getElementById('debug-ingredients').textContent = Array.from(selectedIngredients).join(', ') || 'None';
}

// Data
const appliances = [
    "Oven", "Microwave", "Stovetop", "Blender", "Food Processor",
    "Air Fryer", "Slow Cooker", "Instant Pot", "Toaster", "Grill",
    "Stand Mixer", "Hand Mixer"
];
const ingredients = [
    "Chicken Breast", "Ground Beef", "Salmon", "Shrimp", "Eggs", "Milk", "Butter",
    "Cheddar Cheese", "Mozzarella", "Parmesan", "Greek Yogurt", "Bread", "Rice",
    "Pasta", "Quinoa", "Potatoes", "Sweet Potatoes", "Onions", "Garlic", "Tomatoes",
    "Bell Peppers", "Carrots", "Broccoli", "Spinach", "Lettuce", "Cucumber", "Mushrooms",
    "Zucchini", "Eggplant", "Avocado", "Apples", "Bananas", "Lemons", "Limes", "Oranges",
    "Strawberries", "Blueberries", "Olive Oil", "Vegetable Oil", "Coconut Oil", "Flour",
    "Sugar", "Brown Sugar", "Salt", "Black Pepper", "Paprika", "Cumin", "Oregano",
    "Basil", "Thyme", "Rosemary", "Chili Powder", "Soy Sauce", "Honey", "Peanut Butter",
    "Almonds", "Walnuts", "Cashews", "Chickpeas", "Lentils", "Black Beans", "Kidney Beans",
    "Pinto Beans", "Corn", "Frozen Peas", "Frozen Mixed Vegetables", "Chicken Broth",
    "Vegetable Broth", "Canned Tomatoes", "Canned Coconut Milk", "Tortillas", "Pita Bread",
    "Rice Noodles", "Soba Noodles", "Couscous", "Polenta", "Granola", "Oats",
    "Cereal", "Popcorn", "Chocolate Chips", "Vanilla Extract", "Baking Powder",
    "Baking Soda", "Yeast", "Cocoa Powder", "Nutmeg", "Cinnamon", "Ginger", "Mustard",
    "Ketchup", "Mayonnaise", "Hot Sauce", "Barbecue Sauce", "Worcestershire Sauce",
    "Salsa", "Pesto", "Hummus", "Tahini", "Soy Milk", "Almond Milk", "Coconut Milk",
    "Rice Milk", "Oat Milk", "Protein Powder", "Chia Seeds", "Flaxseeds", "Pumpkin Seeds",
    "Sunflower Seeds", "Sesame Seeds", "Dried Fruit", "Coconut Flakes", "Maple Syrup",
    "Agave Syrup", "Apple Cider Vinegar", "Balsamic Vinegar", "Red Wine Vinegar",
    "White Wine Vinegar", "Rice Vinegar", "Fish Sauce", "Tamarind Paste", "Curry Paste",
].sort();

const animations = ['pot-animation', 'toaster-animation', 'blender-animation', 'microwave-animation'];
const applianceAnimations = {
    "Stovetop": "pot-animation",
    "Toaster": "toaster-animation",
    "Blender": "blender-animation",
    "Microwave": "microwave-animation"
};
let lastAnimations = [];

// State
let selectedAppliances = new Set();
let selectedIngredients = new Set();
let isLoading = false;

// DOM Elements
const appliancesContainer = document.getElementById('appliances-container');
const ingredientInput = document.getElementById('ingredient-input');
const ingredientDropdown = document.getElementById('ingredient-dropdown');
const selectedIngredientsContainer = document.getElementById('selected-ingredients');
const noIngredientsText = document.getElementById('no-ingredients-text');
const getSuggestionBtn = document.getElementById('get-suggestion-btn');
const chefResponse = document.getElementById('chef-response');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const buttonText = document.getElementById('button-text');
const applianceCount = document.getElementById('appliance-count');
const ingredientCount = document.getElementById('ingredient-count');
const ingredientError = document.getElementById('ingredient-error');
const cookingAnimationContainer = document.getElementById('cooking-animation-container');
const debugButton = document.getElementById('debug-button');
const debugPopup = document.getElementById('debug-popup');
const closeDebug = document.getElementById('close-debug');

// Functions
function renderAppliances() {
    appliancesContainer.innerHTML = '';
    appliances.forEach(appliance => {
        const button = document.createElement('button');
        button.textContent = appliance;
        button.className = 'appliance-button py-3 px-4 rounded-lg font-medium border-2 border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500';
        
        if (selectedAppliances.has(appliance)) {
            button.classList.add('selected');
        }
        
        button.addEventListener('click', () => toggleAppliance(appliance));
        appliancesContainer.appendChild(button);
    });
}

function toggleAppliance(appliance) {
    if (selectedAppliances.has(appliance)) {
        selectedAppliances.delete(appliance);
        addDebugLog(`Removed appliance: ${appliance}`);
    } else {
        selectedAppliances.add(appliance);
        addDebugLog(`Added appliance: ${appliance}`);
    }
    updateCounts();
    renderAppliances();
    updateButtonState();
}

function renderSelectedIngredients() {
    const ingredientTags = selectedIngredientsContainer.querySelectorAll('.ingredient-tag');
    ingredientTags.forEach(tag => tag.remove());
    if (selectedIngredients.size === 0) {
        noIngredientsText.style.display = 'block';
    } else {
        noIngredientsText.style.display = 'none';
        selectedIngredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                <span>${ingredient}</span>
                <span class="remove-btn" data-ingredient="${ingredient}">×</span>
            `;
            tag.querySelector('.remove-btn').addEventListener('click', () => removeIngredient(ingredient));
            selectedIngredientsContainer.appendChild(tag);
        });
    }
}

function addIngredient(ingredient) {
    if (selectedIngredients.size >= 10) {
        showError("Maximum 10 ingredients allowed.");
        return;
    }
    
    if (!selectedIngredients.has(ingredient)) {
        selectedIngredients.add(ingredient);
        addDebugLog(`Added ingredient: ${ingredient}`);
        ingredientInput.value = '';
        hideDropdown();
        renderSelectedIngredients();
        updateCounts();
        updateButtonState();
    }
}

function removeIngredient(ingredient) {
    selectedIngredients.delete(ingredient);
    addDebugLog(`Removed ingredient: ${ingredient}`);
    renderSelectedIngredients();
    updateCounts();
    updateButtonState();
}

function filterIngredients() {
    const query = ingredientInput.value.toLowerCase().trim();
    
    if (query.length === 0) {
        hideDropdown();
        return;
    }
    const filtered = ingredients.filter(ingredient => 
        ingredient.toLowerCase().includes(query) && !selectedIngredients.has(ingredient)
    );
    if (filtered.length > 0) {
        showDropdown(filtered);
    } else {
        hideDropdown();
    }
}

function showDropdown(items) {
    ingredientDropdown.innerHTML = '';
    items.slice(0, 8).forEach(ingredient => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = ingredient;
        div.addEventListener('click', () => addIngredient(ingredient));
        ingredientDropdown.appendChild(div);
    });
    ingredientDropdown.classList.remove('hidden');
}

function hideDropdown() {
    ingredientDropdown.classList.add('hidden');
}

function updateCounts() {
    applianceCount.textContent = selectedAppliances.size;
    ingredientCount.textContent = selectedIngredients.size;
}

function updateButtonState() {
    const hasMinIngredients = selectedIngredients.size >= 2;
    getSuggestionBtn.disabled = !hasMinIngredients || isLoading;
    
    if (selectedIngredients.size < 2) {
        ingredientError.classList.remove('hidden');
    } else {
        ingredientError.classList.add('hidden');
    }
}

function constructPrompt() {
    const appliancesList = selectedAppliances.size > 0 
        ? Array.from(selectedAppliances).join(', ')
        : 'basic kitchen tools';
    
    const ingredientsList = Array.from(selectedIngredients).join(', ');
    
    const prompt = `The kitchen appliances I have are: ${appliancesList} and the ingredients I have are: ${ingredientsList}. What can I cook with these?`;
    
    document.getElementById('debug-prompt').textContent = prompt;
    
    return prompt;
}

function determineAnimation() {
    if (selectedAppliances.size === 1) {
        const appliance = Array.from(selectedAppliances)[0];
        if (applianceAnimations[appliance]) {
            return applianceAnimations[appliance];
        }
    }
    let availableAnimations = animations;
    if (lastAnimations.length >= 2 && lastAnimations[0] === lastAnimations[1]) {
        availableAnimations = animations.filter(a => a !== lastAnimations[0]);
    }
    return availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
}

function createAnimation(type) {
    cookingAnimationContainer.innerHTML = '';
    
    const animationWrapper = document.createElement('div');
    animationWrapper.className = `animation-wrapper ${type}`;
    
    switch(type) {
        case 'pot-animation':
            animationWrapper.innerHTML = `
                <div class="pot">
                    <div class="pot-top"></div>
                </div>
                <div class="steam steam-1"></div>
                <div class="steam steam-2"></div>
                <div class="steam steam-3"></div>
            `;
            break;
            
        case 'toaster-animation':
            animationWrapper.innerHTML = `
                <div class="toaster">
                    <div class="toaster-slot"></div>
                </div>
                <div class="bread bread-1"></div>
                <div class="bread bread-2"></div>
            `;
            break;
            
        case 'blender-animation':
            animationWrapper.innerHTML = `
                <div class="blender">
                    <div class="blender-base"></div>
                    <div class="blender-jar">
                        <div class="blade-container">
                            <div class="blade blade-1"></div>
                            <div class="blade blade-2"></div>
                        </div>
                    </div>
                    <div class="blender-top"></div>
                </div>
            `;
            break;
            
        case 'microwave-animation':
            animationWrapper.innerHTML = `
                <div class="microwave">
                    <div class="microwave-door">
                        <div class="microwave-window">
                            <div class="cup"></div>
                        </div>
                    </div>
                    <div class="microwave-controls"></div>
                    <div class="microwave-light"></div>
                </div>
            `;
            break;
    }
    
    cookingAnimationContainer.appendChild(animationWrapper);
}

async function getSuggestion() {
    if (selectedIngredients.size < 2) {
        showError("Please select at least 2 ingredients.");
        return;
    }
    
    setLoading(true);
    hideError();
    const startTime = Date.now();
    addDebugLog('Starting API request...');
    
    try {
        const prompt = constructPrompt();
        addDebugLog(`Constructed prompt: ${prompt.substring(0, 100)}...`);
        
        const requestUrl = `${HELLO_GENAI_URL}${CHAT_API_ENDPOINT}`;
        addDebugLog(`Making request to: ${requestUrl}`);
        
        const requestBody = { message: prompt };
        addDebugLog(`Request body: ${JSON.stringify(requestBody)}`);
        
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
            mode: 'cors',
        });
        
        const responseTime = Date.now() - startTime;
        document.getElementById('debug-response-time').textContent = `${responseTime}ms`;
        
        addDebugLog(`Response status: ${response.status} (${responseTime}ms)`);
        document.getElementById('debug-status').textContent = response.status;
        
        if (!response.ok) {
            const errorText = await response.text();
            addDebugLog(`Response error: ${errorText}`, 'error');
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        addDebugLog(`Response data: ${JSON.stringify(data).substring(0, 200)}...`);
        
        if (data.response) {
            chefResponse.textContent = data.response;
            addDebugLog('Successfully displayed response');
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error('Unexpected response format from server');
        }
    } catch (error) {
        addDebugLog(`Error: ${error.message}`, 'error');
        console.error('Error getting suggestion:', error);
        showError(`Failed to get cooking suggestion: ${error.message}`);
        
        chefResponse.innerHTML = `
            <div class="text-center text-gray-500 mt-16">
                <div class="text-4xl mb-4">😔</div>
                <p>Sorry, I couldn't get a cooking suggestion right now. Please try again.</p>
            </div>
        `;
    } finally {
        setLoading(false);
    }
}

async function testConnection() {
    addDebugLog('Testing connection...');
    
    try {
        const response = await fetch(`${HELLO_GENAI_URL}/health`, {
            method: 'GET',
            mode: 'cors',
        });
        
        if (response.ok) {
            const data = await response.json();
            addDebugLog(`Health check successful: ${JSON.stringify(data)}`);
        } else {
            addDebugLog(`Health check failed: ${response.status}`, 'error');
        }
    } catch (error) {
        addDebugLog(`Connection test failed: ${error.message}`, 'error');
    }
}

function setLoading(loading) {
    isLoading = loading;
    updateButtonState();
    
    if (loading) {
        cookingAnimationContainer.classList.remove('hidden');
        chefResponse.classList.add('hidden');
        
        const animationType = determineAnimation();
        createAnimation(animationType);
        lastAnimations.unshift(animationType);
        if (lastAnimations.length > 2) {
            lastAnimations.pop();
        }
        
        buttonText.textContent = 'Cooking up ideas...';
    } else {
        buttonText.textContent = 'Get Cooking Suggestion';
        cookingAnimationContainer.classList.add('hidden');
        chefResponse.classList.remove('hidden');
    }
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(hideError, 5000);
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function openDebug() {
    debugPopup.classList.remove('hidden');
    updateDebugDisplay();
}

function closeDebugPanel() {
    debugPopup.classList.add('hidden');
}

function clearDebugLog() {
    debugLog = [];
    updateDebugDisplay();
    addDebugLog('Debug log cleared');
}

// Event Listeners
ingredientInput.addEventListener('input', filterIngredients);
ingredientInput.addEventListener('focus', filterIngredients);
ingredientInput.addEventListener('blur', () => {
    setTimeout(hideDropdown, 200);
});

getSuggestionBtn.addEventListener('click', getSuggestion);

debugButton.addEventListener('click', openDebug);
closeDebug.addEventListener('click', closeDebugPanel);
document.getElementById('test-connection').addEventListener('click', testConnection);
document.getElementById('clear-debug-log').addEventListener('click', clearDebugLog);

debugPopup.addEventListener('click', (e) => {
    if (e.target === debugPopup) {
        closeDebugPanel();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    addDebugLog('Application initialized');
    addDebugLog(`API URL: ${HELLO_GENAI_URL}${CHAT_API_ENDPOINT}`);
    
    cookingAnimationContainer.classList.add('hidden');
    
    renderAppliances();
    renderSelectedIngredients();
    updateCounts();
    updateButtonState();
    updateDebugDisplay();
});