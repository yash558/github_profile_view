const APIURL = "https://api.github.com/users/";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

async function getUser(username) {
  try {
    const { data } = await axios(APIURL + username);
    createUserCard(data);
    getRepos(username);
  } catch (err) {
    if (err.response.status == 404) {
      createErrorCard("No profile with this Username");
    }
  }
}

let currentPage = 1;
let reposPerPage = 10;
async function getRepos(username) {
  const reposEl = document.getElementById("repos");

  try {
    const userResponse = await axios(APIURL + username);
    const totalRepos = userResponse.data.public_repos;

    const reposResponse = await axios(
      APIURL +
        username +
        `/repos?sort=created&page=${currentPage}&per_page=${reposPerPage}`
    );
    const reposData = reposResponse.data;

    console.log(reposData);
    addReposToCard(reposData);

    createPagination(totalRepos);
  } catch (err) {
    createErrorCard("Problem Fetching Repos");
  }
}

function createUserCard(user) {
    console.log(user.html_url);
    const cardHTML = `
      <div>
        <div class="card">
          <div>
            <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
          </div>
          <div class="user-info">
            <h2>${user.name}</h2>
            <p>${user.bio}</p>
            <ul>
              <li>${user.followers} <strong>Followers</strong></li>
              <li>${user.following} <strong>Following</strong></li>
              <li>${user.public_repos} <strong>Repos</strong></li>
              <li><a href="${user.html_url}" target="_blank">View Profile</a></li>
            </ul>
          </div>
        </div>
        <div class="repo-list">
          <div id="repos"></div>
        </div>
      </div>
    `;
    main.innerHTML = cardHTML;
  }
  

function createErrorCard(msg) {
  const cardHTML = `
        <div class="card">
            <h1>${msg}</h1>
        </div>
    `;
  main.innerHTML = cardHTML;
}

function addReposToCard(repos) {
  const reposEl = document.getElementById("repos");
  reposEl.innerHTML = "";

  repos.forEach((repo) => {
    const repoContainer = document.createElement("div");
    repoContainer.classList.add("repo-container");

    const repoEl = document.createElement("a");
    repoEl.classList.add("repo");
    repoEl.href = repo.html_url;
    repoEl.target = "_blank";
    repoEl.innerText = repo.name;

    const repoDesc = document.createElement("p");
    repoDesc.classList.add("repo-description");
    repoDesc.innerText = repo.description || "No description available";

    const techStackTags = document.createElement("div");
    techStackTags.classList.add("tech-stack-tags");

    if (repo.language) {
      const langTag = document.createElement("span");
      langTag.classList.add("lang-tag");
      langTag.innerText = repo.language;
      techStackTags.appendChild(langTag);
    }

    if (repo.topics && repo.topics.length > 0) {
      repo.topics.forEach((topic) => {
        const topicTag = document.createElement("span");
        topicTag.classList.add("topic-tag");
        topicTag.innerText = topic;
        techStackTags.appendChild(topicTag);
      });
    }

    repoContainer.appendChild(repoEl);
    repoContainer.appendChild(repoDesc);
    repoContainer.appendChild(techStackTags);
    reposEl.appendChild(repoContainer);
  });
}

function createPagination(totalRepos) {
  const totalPages = Math.ceil(totalRepos / reposPerPage);
  let paginationContainer = document.createElement("div");
  paginationContainer.classList.add("pagination");

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement("span");
    pageLink.classList.add("page-link");
    pageLink.innerText = i;

    const handlePageClick = (pageNumber) => {
      return () => {
        currentPage = pageNumber;
        const user = search.value;
        if (user) {
          getRepos(user);
        }
      };
    };

    pageLink.addEventListener("click", handlePageClick(i));

    if (i === currentPage) {
        pageLink.classList.add("selected");
      }

    paginationContainer.appendChild(pageLink);
  }

  const existingPagination = document.querySelector(".pagination");
  if (existingPagination) {
    existingPagination.remove();
  }

  main.appendChild(paginationContainer);
}

async function updateReposPerPage() {
  const reposEl = document.getElementById("repos");

  reposEl.innerHTML = "";

  reposPerPage = parseInt(document.getElementById("reposPerPageSelect").value);
  currentPage = 1;

  const user = search.value;
  if (user) {
    await getRepos(user);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = search.value;

  if (user) {
    getUser(user);
  }
});
