function toggleNavbar() {
    var navbar = document.getElementById('navbar');
    navbar.classList.toggle('active');
}

document.querySelector('.closenavbar').addEventListener('click', function() {
    var navbar = document.getElementById('navbar');
    navbar.classList.remove('active');
});


