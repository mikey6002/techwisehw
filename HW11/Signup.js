const emailInput = document.querySelector('#email');
const emailError = document.querySelector('#emailError');
const passwordInput = document.querySelector('#password');
const togglePassword = document.querySelector('#togglePassword');
const confirmPasswordInput = document.querySelector('#check_password');
const passwordError = document.querySelector('#passwordError');
const signupForm = document.querySelector('#signupForm');
console.log(emailInput);
console.log(emailError);
console.log(passwordInput);
console.log(togglePassword);
console.log(confirmPasswordInput)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

emailInput.addEventListener('focusout', () => {
    // something@something.something
    // e.preventDefault();
    console.log(emailInput.value);
    if (emailInput.value === '') {
        emailError.classList.add('hidden');
    } else if (!emailRegex.test(emailInput.value)) {
        emailError.classList.remove('hidden');
    } else {
        emailError.classList.add('hidden');
    }
});
togglePassword.addEventListener('click', () => {
    
    const type = passwordInput.getAttribute('type');
    console.log(type);
    const newType = type === 'password' ? 'text' : 'password';
    console.log(newType);
    passwordInput.setAttribute('type', newType);

});

confirmPasswordInput.addEventListener('input', () => {
    const match = confirmPasswordInput.value === passwordInput.value;
    passwordError.classList.toggle('hidden', match || confirmPasswordInput.value === '' || passwordInput.value === '');
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isPasswordMatch = passwordInput.value === confirmPasswordInput.value;

    if (!isPasswordMatch) {
        console.log("Passwords do not match");
    } else {
        console.log("Passwords match");
    }

    CheckthingsFilled();
});

function checkAgeFunction() {
    if (document.getElementById("checkage").checked) {
        console.log("User is 13+");
    }
    else {
        console.log("User is under 13");
    }
}

function checkTOSFunction() {
    if (document.getElementById("check_TOS").checked) {
        console.log("User agrees to TOS");
    }
    else {
        console.log("User does not agree to TOS");
    }
}

function CheckthingsFilled() {
    const fullName = document.getElementById("Full_Name").value;
    const username = document.getElementById("Username").value;
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const ageChecked = document.getElementById("checkage").checked;
    const tosChecked = document.getElementById("check_TOS").checked;

    let isValid = true;

    if (!fullName) {
        console.log("Full name is not filled");
        isValid = false;
    }
    if (!username) {
        console.log("Username is not filled");
        isValid = false;
    }
    if (!email) {
        console.log("Email is not filled");
        isValid = false;
    }
    if (!password) {
        console.log("Password has not been entered");
        isValid = false;
    }

    if (
        isValid &&
        password === confirmPassword &&
        ageChecked &&
        tosChecked
    ) {
        console.log("The user is eligible");
    } else {
        console.log("The user is ineligible");
    }
}
