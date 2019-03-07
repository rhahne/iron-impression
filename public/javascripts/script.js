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
        $('#design-sort').removeClass('is-active')
        $('#grammar-sort').removeClass('is-active')
        $('#prof-sort').removeClass('is-active')
        $('#allround-sort').removeClass('is-active')
    })
    
    $('#design-sort').click(()=>{
        $('#all-sort').removeClass('is-active')
        $('#design-sort').addClass('is-active')
        $('#grammar-sort').removeClass('is-active')
        $('#prof-sort').removeClass('is-active')
        $('#allround-sort').removeClass('is-active')
    })
    
    $('#grammar-sort').click(()=>{
        $('#all-sort').removeClass('is-active')
        $('#design-sort').removeClass('is-active')
        $('#grammar-sort').addClass('is-active')
        $('#prof-sort').removeClass('is-active')
        $('#allround-sort').removeClass('is-active')
    })

    $('#prof-sort').click(()=>{
        $('#all-sort').removeClass('is-active')
        $('#design-sort').removeClass('is-active')
        $('#grammar-sort').removeClass('is-active')
        $('#prof-sort').addClass('is-active')
        $('#allround-sort').removeClass('is-active')
    })

    $('#allround-sort').click(()=>{
        $('#all-sort').removeClass('is-active')
        $('#design-sort').removeClass('is-active')
        $('#grammar-sort').removeClass('is-active')
        $('#prof-sort').removeClass('is-active')
        $('#allround-sort').addClass('is-active')
    })
})
