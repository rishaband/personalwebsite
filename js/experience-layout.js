document.addEventListener("DOMContentLoaded", function () {
  var toc = document.getElementById("toc-nav");
  if (!toc) return;

  var sections = Array.from(
    document.querySelectorAll(".article-content [data-toc-title]")
  );
  if (!sections.length) return;

  sections.forEach(function (section, index) {
    if (!section.id) {
      section.id = "section-" + (index + 1);
    }

    var link = document.createElement("a");
    link.href = "#" + section.id;
    link.textContent = section.getAttribute("data-toc-title");
    toc.appendChild(link);
  });

  var links = Array.from(toc.querySelectorAll("a"));
  var linkById = new Map(
    links.map(function (link) {
      return [link.getAttribute("href").slice(1), link];
    })
  );

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-28% 0px -58% 0px",
      threshold: 0,
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(id);
      history.replaceState(null, "", "#" + id);
    });
  });

  setActive(sections[0].id);
});
