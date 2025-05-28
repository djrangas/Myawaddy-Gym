// Global Variables
let currentPlan = '';
let registrationData = {};
let groupMemberCount = 2;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const registrationModal = document.getElementById('registrationModal');
const successModal = document.getElementById('successModal');
const registrationForm = document.getElementById('registrationForm');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Navigation
function initNavigation() {
    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Smooth Scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Registration Modal
function openRegistration(plan) {
    currentPlan = plan;
    const modalTitle = document.getElementById('modalTitle');
    const planInput = document.getElementById('plan');
    
    // Set plan-specific title and input value
    const planTitles = {
        'basic': 'Basic Plan Registration',
        'premium': 'Premium Plan Registration',
        'group': 'Group Plan Registration'
    };
    
    modalTitle.textContent = planTitles[plan];
    planInput.value = plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
    
    // Show/hide plan-specific fields
    const coachSelection = document.querySelector('.coach-selection');
    const scheduleSelection = document.querySelector('.schedule-selection');
    const groupMembers = document.querySelector('.group-members');
    
    if (plan === 'basic') {
        coachSelection.style.display = 'none';
        scheduleSelection.style.display = 'none';
        groupMembers.style.display = 'none';
        
        // Remove required attributes
        document.getElementById('coach').removeAttribute('required');
        document.getElementById('schedule').removeAttribute('required');
    } else if (plan === 'premium') {
        coachSelection.style.display = 'block';
        scheduleSelection.style.display = 'block';
        groupMembers.style.display = 'none';
        
        // Add required attributes
        document.getElementById('coach').setAttribute('required', '');
        document.getElementById('schedule').setAttribute('required', '');
    } else if (plan === 'group') {
        coachSelection.style.display = 'block';
        scheduleSelection.style.display = 'block';
        groupMembers.style.display = 'block';
        
        // Add required attributes
        document.getElementById('coach').setAttribute('required', '');
        document.getElementById('schedule').setAttribute('required', '');
        
        // Make group member fields required
        document.querySelectorAll('[name^="groupMember"]').forEach(input => {
            input.setAttribute('required', '');
        });
    }
    
    registrationModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeRegistration() {
    registrationModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
}

function closeSuccessModal() {
    successModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function resetForm() {
    registrationForm.reset();
    groupMemberCount = 2;
    
    // Reset group members container
    const container = document.getElementById('groupMembersContainer');
    container.innerHTML = `
        <div class="group-member">
            <input type="text" name="groupMember1" placeholder="Member 1 Full Name">
            <input type="tel" name="groupMember1Phone" placeholder="Phone Number">
        </div>
        <div class="group-member">
            <input type="text" name="groupMember2" placeholder="Member 2 Full Name">
            <input type="tel" name="groupMember2Phone" placeholder="Phone Number">
        </div>
    `;
}

function addGroupMember() {
    groupMemberCount++;
    const container = document.getElementById('groupMembersContainer');
    const memberDiv = document.createElement('div');
    memberDiv.className = 'group-member';
    memberDiv.innerHTML = `
        <input type="text" name="groupMember${groupMemberCount}" placeholder="Member ${groupMemberCount} Full Name" required>
        <input type="tel" name="groupMember${groupMemberCount}Phone" placeholder="Phone Number" required>
        <button type="button" class="btn-remove-member" onclick="removeGroupMember(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(memberDiv);
}

function removeGroupMember(button) {
    if (groupMemberCount > 2) {
        button.parentElement.remove();
        groupMemberCount--;
    }
}

// Form Submission
function handleRegistrationSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(registrationForm);
    registrationData = {};
    
    // Basic form data
    for (let [key, value] of formData.entries()) {
        registrationData[key] = value;
    }
    
    // Add plan pricing
    const planPrices = {
        'Basic Plan': '100,000 MMK',
        'Premium Plan': '500,000 MMK',
        'Group Plan': '1,500,000 MMK'
    };
    registrationData.price = planPrices[registrationData.plan];
    
    // Add group members for group plan
    if (currentPlan === 'group') {
        registrationData.groupMembers = [];
        for (let i = 1; i <= groupMemberCount; i++) {
            const name = formData.get(`groupMember${i}`);
            const phone = formData.get(`groupMember${i}Phone`);
            if (name && phone) {
                registrationData.groupMembers.push({ name, phone });
            }
        }
    }
    
    // Add timestamp
    registrationData.registrationDate = new Date().toLocaleString();
    registrationData.registrationId = 'MGR' + Date.now();
    
    // Store registration data
    storeRegistrationData(registrationData);
    
    // Show success modal
    closeRegistration();
    showSuccessModal();
}

function storeRegistrationData(data) {
    // Get existing registrations
    let registrations = JSON.parse(localStorage.getItem('gymRegistrations') || '[]');
    
    // Add new registration
    registrations.push(data);
    
    // Store back to localStorage
    localStorage.setItem('gymRegistrations', JSON.stringify(registrations));
    
    // Update dashboard data if it exists
    updateDashboardData(data);
}

function updateDashboardData(registration) {
    // Get existing dashboard data
    let dashboardData = JSON.parse(localStorage.getItem('gymDashboardData') || '{}');
    
    // Initialize structure if needed
    if (!dashboardData.monthlyData) {
        dashboardData.monthlyData = {};
    }
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    if (!dashboardData.monthlyData[currentMonth]) {
        dashboardData.monthlyData[currentMonth] = {
            income: 0,
            registrations: 0,
            plans: { basic: 0, premium: 0, group: 0 }
        };
    }
    
    // Update monthly data
    const planType = registration.plan.toLowerCase().replace(' plan', '');
    const income = parseInt(registration.price.replace(/[^0-9]/g, ''));
    
    dashboardData.monthlyData[currentMonth].income += income;
    dashboardData.monthlyData[currentMonth].registrations += 1;
    dashboardData.monthlyData[currentMonth].plans[planType] += 1;
    
    // Store updated data
    localStorage.setItem('gymDashboardData', JSON.stringify(dashboardData));
}

function showSuccessModal() {
    successModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Download Registration
function downloadRegistration() {
    generateRegistrationPNG();
}

function generateRegistrationPNG() {
    // Create canvas for PNG generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 1000;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(0, 0, canvas.width, 100);
    
    // Logo and title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Myawaddy Gym', 50, 60);
    
    // Registration details
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Registration Receipt', 50, 150);
    
    ctx.font = '16px Arial';
    let y = 200;
    const lineHeight = 30;
    
    // Registration ID
    ctx.fillText(`Registration ID: ${registrationData.registrationId}`, 50, y);
    y += lineHeight;
    
    // Date
    ctx.fillText(`Date: ${registrationData.registrationDate}`, 50, y);
    y += lineHeight * 2;
    
    // Personal Information
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Personal Information:', 50, y);
    y += lineHeight;
    
    ctx.font = '16px Arial';
    ctx.fillText(`Name: ${registrationData.fullName}`, 70, y);
    y += lineHeight;
    ctx.fillText(`Email: ${registrationData.email}`, 70, y);
    y += lineHeight;
    ctx.fillText(`Phone: ${registrationData.phone}`, 70, y);
    y += lineHeight;
    ctx.fillText(`Age: ${registrationData.age}`, 70, y);
    y += lineHeight;
    ctx.fillText(`Gender: ${registrationData.gender}`, 70, y);
    y += lineHeight * 2;
    
    // Plan Information
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Plan Information:', 50, y);
    y += lineHeight;
    
    ctx.font = '16px Arial';
    ctx.fillText(`Plan: ${registrationData.plan}`, 70, y);
    y += lineHeight;
    ctx.fillText(`Start Date: ${registrationData.startDate}`, 70, y);
    y += lineHeight;
    ctx.fillText(`Play Month: ${registrationData.playMonth}`, 70, y);
    y += lineHeight;
    ctx.fillText(`Price: ${registrationData.price}`, 70, y);
    y += lineHeight;
    
    if (registrationData.coach) {
        ctx.fillText(`Coach: ${registrationData.coach}`, 70, y);
        y += lineHeight;
    }
    
    if (registrationData.schedule) {
        ctx.fillText(`Schedule: ${registrationData.schedule}`, 70, y);
        y += lineHeight;
    }
    
    // Group members if applicable
    if (registrationData.groupMembers && registrationData.groupMembers.length > 0) {
        y += lineHeight;
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Group Members:', 50, y);
        y += lineHeight;
        
        ctx.font = '16px Arial';
        registrationData.groupMembers.forEach((member, index) => {
            ctx.fillText(`${index + 1}. ${member.name} - ${member.phone}`, 70, y);
            y += lineHeight;
        });
    }
    
    // Fitness goals and experience
    if (registrationData.fitnessGoals) {
        y += lineHeight;
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Fitness Goals:', 50, y);
        y += lineHeight;
        
        ctx.font = '16px Arial';
        const goals = registrationData.fitnessGoals.split('\n');
        goals.forEach(goal => {
            if (goal.trim()) {
                ctx.fillText(goal.trim(), 70, y);
                y += lineHeight;
            }
        });
    }
    
    if (registrationData.previousExperience) {
        y += lineHeight;
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Previous Experience:', 50, y);
        y += lineHeight;
        
        ctx.font = '16px Arial';
        const experience = registrationData.previousExperience.split('\n');
        experience.forEach(exp => {
            if (exp.trim()) {
                ctx.fillText(exp.trim(), 70, y);
                y += lineHeight;
            }
        });
    }

    // Cost and Payment Method
    if (registrationData.price || registrationData.paymentMethod) {
        y += lineHeight;
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Payment Details:', 50, y);
        y += lineHeight;

        ctx.font = '16px Arial';
        if (registrationData.price) {
            ctx.fillText(`Cost: ${registrationData.price} MMK`, 70, y);
            y += lineHeight;
        }

        if (registrationData.paymentMethod) {
            const methodLabel = registrationData.paymentMethod.charAt(0).toUpperCase() + registrationData.paymentMethod.slice(1);
            ctx.fillText(`Payment Method: ${methodLabel}`, 70, y);
            y += lineHeight;
        }
    }

    // Footer
    y += lineHeight * 2;
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(0, y, canvas.width, 2);
    y += 30;
    
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '14px Arial';
    ctx.fillText('Operating Hours: 6:00 AM - 11:00 AM | 3:00 PM - 8:00 PM', 50, y);
    y += 20;
    ctx.fillText('Location: Myawaddy, Karen State, Myanmar', 50, y);
    y += 20;
    ctx.fillText('Phone: +95 9123456789', 50, y);
    
    // Download the image
    const link = document.createElement('a');
    link.download = `MyawaddyGym_Registration_${registrationData.registrationId}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Contact Form
// function initContactForm() {
//     const contactForm = document.querySelector('.contact-form form');
//     if (contactForm) {
//         contactForm.addEventListener('submit', function(e) {
//             e.preventDefault();
            
//             // Get form data
//             const formData = new FormData(this);
//             const contactData = {
//                 name: formData.get('name') || this.querySelector('input[type="text"]').value,
//                 email: formData.get('email') || this.querySelector('input[type="email"]').value,
//                 message: formData.get('message') || this.querySelector('textarea').value,
//                 timestamp: new Date().toLocaleString()
//             };
            
//             // Store contact message
//             let contacts = JSON.parse(localStorage.getItem('gymContacts') || '[]');
//             contacts.push(contactData);
//             localStorage.setItem('gymContacts', JSON.stringify(contacts));
            
//             // Show success message
//             alert('Thank you for your message! We will get back to you soon.');
//             this.reset();
//         });
//     }
// }

function sendMailto() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    const mailtoLink = `mailto:htooaunklinn12@gmail.com?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;

    window.location.href = mailtoLink;

    return false; // prevent default form submission
}

// Initialize animations on scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .plan-card, .coach-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Modal click outside to close
function initModalEvents() {
    // Registration modal
    registrationModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeRegistration();
        }
    });
    
    // Success modal
    successModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeSuccessModal();
        }
    });
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initNavigation();
    // initContactForm();
    initScrollAnimations();
    initModalEvents();
    
    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);
    registrationForm.addEventListener('submit', handleRegistrationSubmit);
    
    // Generate sample dashboard data if none exists
    if (!localStorage.getItem('gymDashboardData')) {
        generateSampleDashboardData();
    }
});

// Generate sample dashboard data
function generateSampleDashboardData() {
    const currentDate = new Date();
    const dashboardData = {
        monthlyData: {}
    };
    
    // Generate data for last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        
        const baseIncome = Math.floor(Math.random() * 10000000) + 5000000; // 5M to 15M MMK
        const registrations = Math.floor(Math.random() * 50) + 20; // 20 to 70 registrations
        
        dashboardData.monthlyData[monthKey] = {
            income: baseIncome,
            registrations: registrations,
            plans: {
                basic: Math.floor(registrations * 0.4),
                premium: Math.floor(registrations * 0.4),
                group: Math.floor(registrations * 0.2)
            },
            expenses: Math.floor(baseIncome * 0.3) // 30% expenses
        };
    }
    
    localStorage.setItem('gymDashboardData', JSON.stringify(dashboardData));
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export functions for use in other files
window.gymUtils = {
    formatCurrency,
    capitalizeFirst,
    scrollToSection
};
