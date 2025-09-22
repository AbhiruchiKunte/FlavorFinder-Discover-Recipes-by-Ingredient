document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links ');
    const ingredientsInput = document.getElementById('ingredients-input');
    const searchBtn = document.getElementById('search-btn');
    const recipesContainer = document.getElementById('recipes-container');
    const loader = document.getElementById('loader');
    const messageElement = document.getElementById('message');
    const resultsTitle = document.getElementById('results-title');

    // New DOM elements for the review section
    const reviewForm = document.getElementById('review-form');
    const reviewText = document.getElementById('review-text');
    const reviewerName = document.getElementById('reviewer-name');
    const reviewerGender = document.getElementById('reviewer-gender');
    const testimonialsGrid = document.getElementById('testimonials-grid');
    
    // DOM elements for newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterEmailInput = newsletterForm.querySelector('input[type="email"]');

    // --- Spoonacular API Configuration ---
    // Use the environment variable from Vite's import.meta.env
    const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

    // --- Static Testimonial Data ---
    const staticTestimonials = [
        {
            name: 'Priya S.',
            review: "I've saved so much time and money using FlavorFinder. The recipes are fantastic and easy to follow. A must-have app for home cooks!",
            gender: 'female'
        },
        {
            name: 'Ankit R.',
            review: "This is a brilliant concept. I can finally use up all the random ingredients in my fridge without any waste. Highly recommended!",
            gender: 'male'
        },
        {
            name: 'Sarah J.',
            review: "I love the clean design and the variety of recipes. It's so intuitive and has made cooking fun again for me and my family.",
            gender: 'female'
        }
    ];

    // --- Event Listeners ---
    // Toggle mobile navigation menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Handle recipe search on button click
    searchBtn.addEventListener('click', () => {
        const ingredients = ingredientsInput.value.trim();
        fetchRecipes(ingredients);
    });

    // Handle recipe search on 'Enter' key press
    ingredientsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const ingredients = ingredientsInput.value.trim();
            fetchRecipes(ingredients);
        }
    });

    // Handle review form submission
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const reviewContent = reviewText.value.trim();
        const name = reviewerName.value.trim() || 'Anonymous';
        const gender = reviewerGender.value;

        if (reviewContent) {
            addTestimonial(name, reviewContent, gender);
            reviewForm.reset();
            alert('Thank you for your review! It has been added.');
        }
    });
    
    // Handle newsletter subscription
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterEmailInput.value;
        if (email && newsletterEmailInput.checkValidity()) {
            alert('Successfully subscribed to our newsletter! Thank you!');
            newsletterEmailInput.value = '';
        } else {
            alert('Please enter a valid email address to subscribe.');
        }
    });

    // --- Core Logic ---
    /**
     * Fetches recipes from the Spoonacular API based on a list of ingredients.
     * @param {string} ingredients A comma-separated string of ingredients.
     */
    const fetchRecipes = async (ingredients) => {
        if (!ingredients) {
            showMessage('Please enter at least one ingredient.', 'warning');
            return;
        }

        // Prepare the UI for a new search
        hideMessage();
        showLoader();
        recipesContainer.innerHTML = '';
        hideResultsTitle();

        const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=12&apiKey=${SPOONACULAR_API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Check for a specific API error, like exceeding the daily limit
                if (response.status === 402) {
                    throw new Error('API request limit reached. Please try again tomorrow.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            const data = await response.json();
            displayRecipes(data);
        } catch (error) {
            console.error('Fetch error: ', error);
            hideLoader();
            showMessage(error.message, 'error');
        }
    };

    /**
     * Displays the fetched recipes on the page.
     * @param {Array} recipes An array of recipe objects from the API.
     */
    const displayRecipes = (recipes) => {
        hideLoader();
        showResultsTitle();
        
        if (recipes.length === 0) {
            showMessage('No recipes found with these ingredients. Try different ones!', 'info');
            return;
        }

        recipes.forEach((recipe, index) => {
            const recipeCard = document.createElement('a');
            recipeCard.classList.add('recipe-card');
            recipeCard.href = `https://spoonacular.com/recipes/${recipe.title.replace(/\s/g, '-')}-${recipe.id}`;
            recipeCard.target = "_blank"; // Open link in a new tab
            recipeCard.style.animationDelay = `${index * 0.1}s`;

            // Display ingredient counts
            const usedIngredientsCount = recipe.usedIngredientCount;
            const missedIngredientsCount = recipe.missedIngredientCount;
            const unusedIngredientsCount = recipe.unusedIngredients.length;

            let ingredientsMessage = `You have ${usedIngredientsCount} of the ingredients.`;
            if (missedIngredientsCount > 0) {
                ingredientsMessage += ` Missing ${missedIngredientsCount}.`;
            } else {
                ingredientsMessage += ` You have all the ingredients! 🎉`;
            }

            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/A32D4B/F5F0E6?text=Image+Not+Found';">
                <div class="recipe-card-overlay">
                    <h3>${recipe.title}</h3>
                    <p>${ingredientsMessage}</p>
                </div>
            `;            
            recipesContainer.appendChild(recipeCard);
        });
    };

    document.getElementById("seePlansBtn").addEventListener("click", function() {
      alert("Redirecting to all meal plans...");
      // window.location.href = "meal-plans.html";
    });

    /**
     * Adds a new testimonial card to the testimonials grid.
     * @param {string} name The reviewer's name.
     * @param {string} review The review text.
     * @param {string} gender The reviewer's gender ('male', 'female', or 'none').
     */
    const addTestimonial = (name, review, gender, isStatic = false) => {
        const testimonialCard = document.createElement('div');
        testimonialCard.classList.add('testimonial-card');

        const seed = name.split(' ')[0] + Date.now();
        let genderParam = '';
        if (gender === 'male' || gender === 'female') {
            genderParam = `&gender=${gender}`;
        }
        
        const avatarUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(seed)}${genderParam}`;

        testimonialCard.innerHTML = `
            <span class="quote-icon">❝</span>
            <p>"${review}"</p>
            <div class="user-info">
                <img src="${avatarUrl}" alt="User photo of ${name}" class="user-photo">
                <div class="author">- ${name}</div>
            </div>
        `;

        // Add a small animation for new, dynamically added reviews
        if (!isStatic) {
            testimonialCard.style.opacity = '0';
            testimonialCard.style.transform = 'translateY(20px)';
            setTimeout(() => {
                testimonialCard.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                testimonialCard.style.opacity = '1';
                testimonialCard.style.transform = 'translateY(0)';
            }, 100);
        }

        testimonialsGrid.appendChild(testimonialCard);
    };

    /**
     * Loads the predefined static testimonials from the array.
     */
    const loadStaticTestimonials = () => {
        testimonialsGrid.innerHTML = '';
        staticTestimonials.forEach(testimonial => {
            addTestimonial(testimonial.name, testimonial.review, testimonial.gender, true);
        });
    };

    // --- UI Utility Functions ---
    const showLoader = () => {
        loader.style.display = 'block';
    };

    const hideLoader = () => {
        loader.style.display = 'none';
    };

    const showMessage = (text, type = 'info') => {
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        messageElement.className = `message ${type}`;
    };

    const hideMessage = () => {
        messageElement.style.display = 'none';
    };

    const showResultsTitle = () => {
        resultsTitle.style.display = 'block';
    };

    const hideResultsTitle = () => {
        resultsTitle.style.display = 'none';
    };

    // Initial load of static testimonials
    loadStaticTestimonials();
});