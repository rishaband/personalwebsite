(function () {
  function parseFrontmatter(raw) {
    var match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) {
      return { meta: {}, body: raw };
    }

    var meta = {};
    match[1].split("\n").forEach(function (line) {
      var idx = line.indexOf(":");
      if (idx === -1) return;
      var key = line.slice(0, idx).trim();
      var value = line.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      meta[key] = value;
    });

    return { meta: meta, body: match[2] };
  }

  function formatDate(iso) {
    if (!iso) return "";
    var date = new Date(iso + "T12:00:00");
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function estimateReadMinutes(text) {
    var words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  function wrapMarkdownSections(container) {
    var children = Array.from(container.children);
    container.innerHTML = "";

    var intro = document.createElement("div");
    intro.className = "article-intro";
    var currentSection = null;

    children.forEach(function (child) {
      if (child.tagName === "H2") {
        currentSection = document.createElement("section");
        currentSection.className = "section";
        currentSection.setAttribute("data-toc-title", child.textContent.trim());
        currentSection.appendChild(child);
        container.appendChild(currentSection);
        return;
      }

      if (currentSection) {
        currentSection.appendChild(child);
      } else {
        intro.appendChild(child);
      }
    });

    if (intro.childNodes.length) {
      container.insertBefore(intro, container.firstChild);
    }
  }

  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("p") || "").trim();
  }

  function renderPost(slug) {
    var titleEl = document.getElementById("post-title");
    var metaEl = document.getElementById("post-meta");
    var heroEl = document.getElementById("post-hero");
    var bodyEl = document.getElementById("article-body");

    if (!slug) {
      document.title = "blog";
      if (titleEl) titleEl.textContent = "post not found";
      if (metaEl) metaEl.textContent = "missing slug in url";
      return;
    }

    fetch("/blog/posts/" + encodeURIComponent(slug) + ".md")
      .then(function (res) {
        if (!res.ok) throw new Error("not found");
        return res.text();
      })
      .then(function (raw) {
        var parsed = parseFrontmatter(raw);
        var meta = parsed.meta;
        var title = meta.title || slug;
        var author = meta.author || "rishab anand";
        var dateLabel = formatDate(meta.date);
        var readMinutes =
          meta.readMinutes || String(estimateReadMinutes(parsed.body));

        document.title = title;
        if (titleEl) titleEl.textContent = title;

        var metaParts = [author];
        if (dateLabel) metaParts.push(dateLabel);
        metaParts.push(readMinutes + " min read");
        if (metaEl) metaEl.textContent = metaParts.join(" · ");

        if (heroEl && meta.hero) {
          heroEl.src = meta.hero;
          heroEl.alt = meta.heroAlt || title;
          heroEl.hidden = false;
        } else if (heroEl) {
          heroEl.hidden = true;
        }

        if (!window.marked) {
          throw new Error("marked.js failed to load");
        }

        marked.setOptions({
          breaks: true,
          gfm: true,
        });

        bodyEl.innerHTML = marked.parse(parsed.body);
        bodyEl.querySelectorAll("img").forEach(function (img) {
          img.classList.add("inline-image");
        });

        wrapMarkdownSections(bodyEl);

        if (window.initArticleLayout) {
          window.initArticleLayout();
        }
      })
      .catch(function () {
        document.title = "blog";
        if (titleEl) titleEl.textContent = "post not found";
        if (metaEl) metaEl.textContent = "";
        if (bodyEl) {
          bodyEl.innerHTML =
            '<p class="blog-post-error">could not load this post. check the slug or add <code>blog/posts/' +
            slug +
            ".md</code>.</p>";
        }
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("article-body")) return;
    renderPost(getSlug());
  });
})();
