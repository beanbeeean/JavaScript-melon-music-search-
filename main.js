// 메인화면 (차트의 기준이 되는 오늘날짜)
let currentTime = document.getElementById("current-time");
function getDate() {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let date = today.getDate();
  currentTime.innerHTML = "As of " + year + "." + month + "." + date;
  // console.log("실행");
}

getDate();
////////////////////////
let charts = [];
let page = 1;
let total_pages = 0;
let chartNum = 1;
let searchingNum = 1;
let keyword = "";
let result = [];
let url;
let rollingData = [];

let searchInput = document.getElementById("search-input");
let searchButton = document.getElementById("search-button");
console.log(searchInput.value);

// 로고를 누를시 Home으로 이동(메인차트로)
let logo = document.getElementById("logo");
const part1 = document.querySelector(".part1");
const part2 = document.querySelector(".part2");
const goHome = () => {
  page = 1;
  part1.style.display = "block";
  part2.style.display = "none";
  searchInput.value = "";
  keyword = "";
  getChart();
};
logo.addEventListener("click", goHome);

// api 호출
const showContents = async () => {
  try {
    let parseObj = new URL(url.toString());
    // console.log(url);
    // console.log(parseObj);
    parseObj.searchParams.set("page", page);
    // console.log("showContent실행");
    let response = await fetch(parseObj);
    let data = await response.json();
    if (data.results) {
      result = data.results.trackmatches.track;
      page = data.results["opensearch:Query"].startPage;
      total_pages = data.results["opensearch:itemsPerPage"];
      // console.log("오류");
      pagination();
      searchRender();
      // console.log("서치실행");
    } else if (data.tracks) {
      charts = data.tracks.track;
      page = data.tracks["@attr"].page;
      // console.log("api로 받은 page값 : ", page);
      total_pages = data.tracks["@attr"].perPage;
      rollingData = charts.slice(0, 5);
      // console.log(rollingData);
      rolling();
      pagination();
      chartRender();
      // console.log("메인실행");
    }
  } catch (e) {
    console.log(e);
  }
};

// 메인 차트 보여주기
const getChart = () => {
  url = `http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=d6cdf0736a800019d8e6ccf8cff76855&format=json`;
  showContents();
};

// search
const searching = () => {
  if (keyword != searchInput.value) {
    page = 1;
  }
  part1.style.display = "none";
  part2.style.display = "block";
  keyword = searchInput.value;
  url = `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${keyword}&api_key=d6cdf0736a800019d8e6ccf8cff76855&format=json`;
  showContents();
};

//함수실행
getChart();
searchButton.addEventListener("click", searching);

// search옆 차트 롤링
const rolling = () => {
  let timer = 2000;

  let first = document.getElementById("first"),
    second = document.getElementById("second"),
    third = document.getElementById("third");
  let move = 2;
  let dataCnt = 1;
  let listCnt = 1;

  // console.log(first);
  first.children[0].innerHTML =
    rollingData.indexOf(rollingData[0]) + 1 + ". " + rollingData[0].name;
  setInterval(() => {
    if (move == 2) {
      first.classList.remove("card_sliding");
      first.classList.add("card_sliding_after");

      second.classList.remove("card_sliding_after");
      second.classList.add("card_sliding");

      third.classList.remove("card_sliding_after");
      third.classList.remove("card_sliding");

      move = 0;
    } else if (move == 1) {
      first.classList.remove("card_sliding_after");
      first.classList.add("card_sliding");

      second.classList.remove("card_sliding_after");
      second.classList.remove("card_sliding");

      third.classList.remove("card_sliding");
      third.classList.add("card_sliding_after");

      move = 2;
    } else if (move == 0) {
      first.classList.remove("card_sliding_after");
      first.classList.remove("card_sliding");

      second.classList.remove("card_sliding");
      second.classList.add("card_sliding_after");

      third.classList.remove("card_sliding_after");
      third.classList.add("card_sliding");

      move = 1;
    }

    if (dataCnt < rollingData.length - 1) {
      document.getElementById("rolling_box").children[
        listCnt
      ].children[0].innerHTML =
        rollingData.indexOf(rollingData[dataCnt]) +
        1 +
        ". " +
        rollingData[dataCnt].name;
      dataCnt++;
    } else if (dataCnt == rollingData.length - 1) {
      document.getElementById("rolling_box").children[
        listCnt
      ].children[0].innerHTML =
        rollingData.indexOf(rollingData[dataCnt]) +
        1 +
        ". " +
        rollingData[dataCnt].name;
      dataCnt = 0;
    }

    if (listCnt < 2) {
      listCnt++;
    } else if (listCnt == 2) {
      listCnt = 0;
    }
  }, timer);
};

// 차트 렌더링
const chartRender = () => {
  let chartHTML = "";
  if (page == 1) {
    chartNum = 1;
  } else {
    chartNum = (page - 1) * 50 + 1;
  }

  chartHTML = `<div class="row main-header pt-3 pb-3">
            <div class="col-lg-1 col-sm-1 text-center">Rank</div>
            <div class="col-lg-5 col-sm-4 text-center">Track</div>
            <div class="col-lg-2 col-sm-2 text-center">Artist</div>
            <div class="col-lg-2 col-sm-3 text-center">Playcount</div>
            <div class="col-lg-2 col-sm-2 text-center">Listeners</div>
          </div>
          `;

  chartHTML += charts
    .map((item) => {
      return `<div class="row pt-4 pb-4 main-card">
            <div class="col-lg-1 col-sm-1 text-center ranking">${chartNum++}</div>
            <div class="col-lg-5 col-sm-4 text-center">${item.name}</div>
            <div class="col-lg-2 col-sm-2 text-center">${item.artist.name}</div>
            <div class="col-lg-2 col-sm-3 text-center play-count">
              <i class="fas fa-play play-icon"></i>${item.playcount}
            </div>
            <div class="col-lg-2 col-sm-2 text-center listners-count">
              <i class="fas fa-headphones"></i>${item.listeners}
            </div>
          </div>
          `;
    })
    .join("");

  document.getElementById("main-charts-view").innerHTML = chartHTML;
};

// 검색 렌더링
const searchRender = () => {
  let searchHTML = "";
  if (page == 1) {
    searchingNum = 1;
  } else {
    searchingNum = (page - 1) * 30 + 1;
  }
  searchHTML = `<div class="row pt-2 pb-2 search-header">
                  <div class="col-lg-1 col-sm-1">NO</div>
                  <div class="col-lg-5 col-sm-5 text-center">Track</div>
                  <div class="col-lg-3 col-sm-3 text-center">Artist</div>
                  <div class="col-lg-3 col-sm-3 text-center">Listeners</div>
                </div>`;

  searchHTML += result
    .map((item) => {
      return `<div class="row pt-3 pb-3 search-card">
              <div class="col-lg-1 col-sm-1">${searchingNum++}</div>
              <div class="col-lg-5 col-sm-5">${item.name}</div>
              <div class="col-lg-3 col-sm-3">${item.artist}</div>
              <div class="col-lg-3 col-sm-3 listners-count text-center">
                <i class="fas fa-headphones"></i>${item.listeners}
              </div>
            </div>`;
    })
    .join("");
  document.getElementById("searching-view").innerHTML = searchHTML;
};

// 페이지네이션
const pagination = () => {
  // console.log("페이지네이션 실행");
  let paginationHTML = ``;
  let pageGroup = Math.ceil(page / 5);
  let last = pageGroup * 5;
  let first = last - 4;
  // console.log(first);
  if (first >= 6) {
    paginationHTML = `<li class="page-item" onclick="moveToPage(1)">
                        <a class="page-link" href='#'>&lt;&lt;</a>
                      </li>
                      <li class="page-item" onclick="moveToPage(${page - 1})">
                        <a class="page-link" href='#'>&lt;</a>
                      </li>`;
  }
  for (let i = first; i < last + 1; i++) {
    paginationHTML += `
    <li class="page-item ${
      page == i ? "active" : ""
    }"><a class="page-link" href="#" onclick="moveToPage(${i})">${i}</a></li>`;
  }
  if (last < total_pages) {
    paginationHTML += `<li class="page-item" onclick="moveToPage(${
      Number(page) + 1
    })">
                        <a  class="page-link" href='#'>&gt;</a>
                       </li>
                       <li class="page-item" onclick="moveToPage(${total_pages})">
                        <a class="page-link" href='#'>&gt;&gt;</a>
                       </li>`;
  }

  if (part2.style.display == "block") {
    document.querySelector(".testing").innerHTML = paginationHTML;
  } else if (part1.style.display == "block") {
    document.querySelector(".pagination").innerHTML = paginationHTML;
  } else {
    return;
  }
};

const moveToPage = (pageNum) => {
  page = pageNum;
  if (part2.style.display == "block") {
    searching();
  } else {
    getChart();
  }
};
