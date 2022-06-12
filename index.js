const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const friends = []
// 功能三: 分頁
let filteredFriends = []
const FRIENDS_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderFriendList(data) {
  let rawHTML = ''
  data.forEach(item => {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${item.avatar}" class="card-img-top" alt="info-avatar">
        <div class="card-body">
          <h5 class="card-title">${item.name} ${item.surname}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-info" data-toggle="modal" data-target="#info-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

// 功能三: 分頁
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getFriendsByPage(page) {
  const data = filteredFriends.length ? filteredFriends : friends
  const startIndex = (page - 1) * FRIENDS_PER_PAGE
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
}

function showInfoModal(id) {
  // get elements
  const modalTitle = document.querySelector('#info-modal-title')
  const modalBody = document.querySelector('#info-modal-body')

  // send request to show api
  axios.get(INDEX_URL + id).then(response => {
    const data = response.data
    // insert data into modal ui
    modalTitle.innerText = `${data.name} ${data.surname}`
    modalBody.innerHTML = `
    <div class="row">
            <div class="col-sm-4" id="info-modal-image">
              <img
                src="${data.avatar}"
                alt="info-avatar" class="img-fluid" />
            </div>
            <div class="col-sm-8">
              <p id="modal-age">age: ${data.age}</p>
              <p id="modal-gender">gender: ${data.gender}</p>
              <p id="modal-region">region: ${data.region}</p>
              <p id="modal-birthday">birthday: ${data.birthday}</p>
              <p id="modal-email">email: ${data.email}</p>            
            </div>
          </div>
    `
  })
}

// 功能二: 加為摯友 / 移除摯友
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  const friend = friends.find(friend => friend.id === id)
  if (list.some(friend => friend.id === id)) {
    return alert('此好友已經在最愛清單中！')
  }
  list.push(friend)
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-info')) {
    showInfoModal(event.target.dataset.id)
    // 功能二: 加為摯友
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//listen to search form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(keyword) || friend.surname.toLowerCase().includes(keyword)
  )

  if (filteredFriends.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的結果`)
  }
  // 功能三: 分頁
  renderPaginator(filteredFriends.length)
  renderFriendList(getFriendsByPage(1))
})

// 功能三: 分頁
// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderFriendList(getFriendsByPage(page))
})

// send request to index api
axios
  .get(INDEX_URL)
  .then(response => {
    friends.push(...response.data.results)
    // 功能三: 分頁
    renderPaginator(friends.length)
    renderFriendList(getFriendsByPage(1))
  })
  .catch(err => console.log(err))