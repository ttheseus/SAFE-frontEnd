function navigateToPage(page) {
    console.log("Navigating to:", page);
    window.location.href = page;
}

window.addEventListener('DOMContentLoaded', function () {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*                                               PRELIMINARY SETUP CODE                                                  *//
    /*                                                                                                                         */

    document.getElementById('createBtn').addEventListener('click', function() {
        navigateToPage('create.html');
    });

    document.getElementById('editBtn').addEventListener('click', function() {
        navigateToPage('edit.html');
    });

});
