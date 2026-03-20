document.addEventListener("DOMContentLoaded", function () {
  // -------------------------
  // Table of contents behavior
  // -------------------------
  var toc = document.getElementById("toc-nav");
  if (toc) {
    var sections = Array.from(
      document.querySelectorAll(".article-content [data-toc-title]")
    );
    if (sections.length) {
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

      function setActive(id) {
        links.forEach(function (link) {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + id
          );
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
    }
  }

  // -------------------------
  // Click-to-zoom image behavior
  // -------------------------
  var images = Array.from(
    document.querySelectorAll(
      ".article-content img.hero-image, .article-content img.inline-image"
    )
  );
  if (!images.length) return;

  var lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";

  var lightboxInner = document.createElement("div");
  lightboxInner.className = "image-lightbox__inner";

  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "image-lightbox__close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = "&times;";

  var imgEl = document.createElement("img");
  imgEl.className = "image-lightbox__img";
  imgEl.alt = "";

  lightboxInner.appendChild(closeBtn);
  lightboxInner.appendChild(imgEl);
  lightbox.appendChild(lightboxInner);
  document.body.appendChild(lightbox);

  var lastFocused = null;

  function openLightbox(src, alt) {
    lastFocused = document.activeElement;
    imgEl.src = src;
    imgEl.alt = alt || "";
    lightbox.classList.add("open");
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    // Clear src to avoid keeping large images in memory.
    imgEl.src = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  images.forEach(function (image) {
    image.style.cursor = "zoom-in";
    image.addEventListener("click", function () {
      var src = image.getAttribute("src");
      if (!src) return;
      openLightbox(src, image.getAttribute("alt"));
    });
  });

  lightbox.addEventListener("click", function (event) {
    // Only close when clicking the overlay, not the inner content.
    if (event.target === lightbox) closeLightbox();
  });

  closeBtn.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox.classList.contains("open")) {
      closeLightbox();
    }
  });
});
