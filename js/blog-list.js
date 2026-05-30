(function () {
  function formatDate(iso) {
    if (!iso) return "";
    var date = new Date(iso + "T12:00:00");
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function renderPosts(posts, container) {
    if (!posts.length) {
      container.innerHTML =
        '<p class="blog-index-desc">no posts yet — add one in <code>blog/posts/</code>.</p>';
      return;
    }

    posts
      .slice()
      .sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      })
      .forEach(function (post) {
        var row = document.createElement("a");
        row.className = "blog-row blog-row--hint";
        row.href = "blog/post.html?p=" + encodeURIComponent(post.slug);

        var label = document.createElement("span");
        label.className = "blog-row-label";

        var title = document.createElement("span");
        title.className = "blog-row-title";
        title.textContent = post.title;

        var hint = document.createElement("span");
        hint.className = "row-hint";
        hint.setAttribute("aria-hidden", "true");
        hint.textContent = "read more";

        label.appendChild(title);
        label.appendChild(hint);
        row.appendChild(label);
        container.appendChild(row);
      });
  }

  function renderIndexList(posts, container) {
    if (!posts.length) {
      container.innerHTML = "<li><p class=\"blog-index-desc\">no posts yet.</p></li>";
      return;
    }

    posts
      .slice()
      .sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      })
      .forEach(function (post) {
        var item = document.createElement("li");
        item.className = "blog-index-item";

        var link = document.createElement("a");
        link.href = "post.html?p=" + encodeURIComponent(post.slug);
        link.textContent = post.title;

        item.appendChild(link);

        if (post.description) {
          var desc = document.createElement("p");
          desc.className = "blog-index-desc";
          desc.textContent = post.description;
          item.appendChild(desc);
        }

        var date = document.createElement("p");
        date.className = "blog-index-date";
        date.textContent = formatDate(post.date);
        item.appendChild(date);

        container.appendChild(item);
      });
  }

  function loadPosts() {
    return fetch("/blog/posts.json").then(function (res) {
      if (!res.ok) throw new Error("posts.json missing");
      return res.json();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var homeList = document.getElementById("blog-list");
    var indexList = document.getElementById("blog-index-list");

    if (!homeList && !indexList) return;

    loadPosts()
      .then(function (data) {
        var posts = data.posts || [];
        if (homeList) renderPosts(posts, homeList);
        if (indexList) renderIndexList(posts, indexList);
      })
      .catch(function () {
        var msg =
          '<p class="blog-index-desc">could not load blog posts.</p>';
        if (homeList) homeList.innerHTML = msg;
        if (indexList) indexList.innerHTML = "<li>" + msg + "</li>";
      });
  });
})();
