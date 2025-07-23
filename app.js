// app.js
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    // Highlight navbar
    document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
    let nav = document.getElementById('nav-' + sectionId);
    if (nav) nav.classList.add('active');
}
window.showSection = showSection;
