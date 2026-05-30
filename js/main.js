function toggleNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;
    navbar.classList.toggle('active');
}

var closeNavbar = document.querySelector('.closenavbar');
if (closeNavbar) {
    closeNavbar.addEventListener('click', function() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;
        navbar.classList.remove('active');
    });
}


