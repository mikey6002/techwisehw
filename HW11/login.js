// const loginForm = document.getElementById('loginForm');
// console.log(loginForm);

// const emailInput = document.getElementById('email');
// const emailError = document.getElementById('emailError');
// const passwordInput = document.getElementById('password');
// const togglePassword = document.getElementById('togglePassword');

const emailInput = document.querySelector('#email');
const emailError = document.querySelector('#emailError');
const passwordInput = document.querySelector('#password');
const togglePassword = document.querySelector('#togglePassword');
const confirmPasswordInput = document.querySelector('#confirmPassword')
const confirmPasswordInputError =document.querySelector("#confirmPasswordError")
const Full_Name = document.querySelector("#Full_Name")
const Username = document.querySelector("#Username")



console.log(emailInput);
console.log(emailError);
console.log(passwordInput);
console.log(togglePassword);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


emailInput.addEventListener('focusout', (e) => {
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
})

confirmPasswordInput

togglePassword.addEventListener('click', () => {
    
    const type = passwordInput.getAttribute('type');
    console.log(type);
    const newType = type === 'password' ? 'text' : 'password';
    console.log(newType);
    passwordInput.setAttribute('type', newType);

})


const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(e);

    const emailValue = emailInput.value;
    const passwordValue = passwordInput.value;
    if (passwordInput.value != check_password.value){
        e.preventDefault();
        console.log("Passwords do not match")
    }
    

    console.log(emailValue);
    console.log(passwordValue);
    
    
})
