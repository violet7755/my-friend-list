//功能二: 加為摯友 / 移除摯友
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const friends = JSON.parse(localStorage.getItem('favoriteFriends'))
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
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
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

function removeFromFavorite(id) {
  if (!friends) return

  const friendIndex = friends.findIndex(friend => friend.id === id)
  if (friendIndex === -1) return

  friends.splice(friendIndex, 1)
  localStorage.setItem('favoriteFriends', JSON.stringify(friends))
  renderFriendList(friends)
}

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-info')) {
    showInfoModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
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

// 功能三: 分頁
renderPaginator(friends.length)
renderFriendList(getFriendsByPage(1))