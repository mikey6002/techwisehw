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
const confirmPasswordInput = document.querySelector('#confirmPassword');
const confirmPasswordInputError =document.getElementById('check_password');
const Full_Name = document.querySelector("#Full_Name").value;
const Username = document.querySelector("#Username").value;



console.log(emailInput);
console.log(emailError);
console.log(passwordInput);
console.log(togglePassword);
console.log(confirmPasswordInputError)

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

    //double check this
    if (passwordInput == document.getElementById('check_password').value){
        console.log("Passwords match")
    }else{
        console.log("passwords do not match")
    }


    console.log(emailValue);
    console.log(passwordValue);
    
    
})


function checkAgeFunction(){
    var checkBox = document. getElementById("checkage")
    if(checkBox.checked == true){
        console.log("User is 13+")
    }
}


function checkTOSFunction(){
    var checkBox = document. getElementById("check_TOS")
    if(checkBox.checked == true){
        console.log("User agrees to TOS")
    }
}

function CheckthingsFilled(){
    var agecheck = document. getElementById("checkage");
    var tos = document. getElementById("check_TOS");
    var password = document.getElementById("password").value;
    var confirmpassword = document.getElementById("check_password").value;
    var username = document.getElementById("Username").value;
    var full_name = document.getElementById("Full_Name").value;
    isValid = true

    if (password == ""){
        console.log("password has not been entered")
        isValid = false
    }
    if(username ==""){
        console.log("user name is not filled")
        isValid = false
    }
    if(full_name==""){
        console.log("full name is not filled")
        isValid = false
    }

    if (password == confirmpassword == true && isValid == true){
        if(agecheck.checked && tos.checked==true ){
            console.log("The user is eligiable")
        }else{
            console.log("User is not eligible")
        }

    }

}