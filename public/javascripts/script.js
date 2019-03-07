// NavBar Burger
document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {

        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {

                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);

                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }
});


// CV Overview Sorting
$(document).ready(() => {
    $('#all-sort').click(()=>{
        $('#all-sort').addClass('is-active')
        $('#web-sort').removeClass('is-active')
        $('#ui-sort').removeClass('is-active')
    })
    
    $('#web-sort').click(()=>{
        $('#web-sort').addClass('is-active')
        $('#all-sort').removeClass('is-active')
        $('#ui-sort').removeClass('is-active')
    })
    
    $('#ui-sort').click(()=>{
        $('#ui-sort').addClass('is-active')
        $('#web-sort').removeClass('is-active')
        $('#all-sort').removeClass('is-active')
    })
})
