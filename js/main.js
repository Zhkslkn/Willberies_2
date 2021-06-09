const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

// cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');
const more = document.querySelector('.more');
const navigationLink = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');

const getGoods = async () => {
	const result = await fetch('db/db.json');
	if(!result.ok) {
		throw 'Ошибочка вышла: ' + result.status;
	}
	return await result.json();	
};

const cart = {
	cartGoods: [],
	countQuantity() {
		cartCount.textContent = this.cartGoods.reduce((num, item) => {
			return num + item.count;
		}, 0);
	},
	renderCart(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({ id, name, price, count }) => {
			const trGood = document.createElement('tr');
			trGood.className = "cart-item";
			trGood.dataset.id = id;

			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price * count}$</td>
				<td><button class="cart-btn-delete">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((summ, item) => {
			return summ + (item.price * item.count);
		}, 0);

		cardTableTotal.textContent = totalPrice + '$';
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCart();
		this.countQuantity();
	},
	minusGood(id){
		for(const item of this.cartGoods){
			if(item.id === id){
				if(item.count <= 1){
					this.deleteGood(id);
				} else{
					item.count--;	
				}
				break;
			}
		}
		this.renderCart();
		this.countQuantity();
	},
	plusGood(id){
		for(const item of this.cartGoods){
			if(item.id === id){
				item.count++;
				break;
			}
		}
		this.renderCart();
		this.countQuantity();
	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item => item.id === id);
		if(goodItem) {
			this.plusGood(id);
		} else{
			getGoods()
			.then(data => data.find(item => item.id === id))
			.then(({ id, name, price }) => {
				this.cartGoods.push({
					id, 
					name, 
					price,
					count: 1
				});
				this.countQuantity();
			});
		}
	},
};

document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');
	
	// let counter = 0;
	if(addToCart){
		cart.addCartGoods(addToCart.dataset.id);
		// cartCount.textContent = counter;
	}

	// for(const item of cart.cartGoods){
	// 	if(item.id){
	// 		counter += item.count;
	// 		break;
	// 	}
	// }

});

cartTableGoods.addEventListener('click', event => {
	const target = event.target;
	if (target.classList.contains('cart-btn-delete')) {
		const id = target.closest('.cart-item');
		cart.deleteGood(id.dataset.id);
	}
	if (target.classList.contains('cart-btn-minus')) {
		const id = target.closest('.cart-item');
		cart.minusGood(id.dataset.id);
	}
	if (target.classList.contains('cart-btn-plus')) {
		const id = target.closest('.cart-item');
		cart.plusGood(id.dataset.id);
	}
});

const openModal = () => {
	cart.renderCart();
	modalCart.classList.add('show');
};

const closeModal = () => {
	modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);


// scroll smooth

{
	const scrollLinks = document.querySelectorAll('a.scroll-link');

	for(const scrollLink of scrollLinks){
		scrollLink.addEventListener('click', event => {
			event.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		});
	}
};

// goods 

const createCard = function(objCard) {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';
	card.innerHTML = `
	<div class="goods-card">
		${objCard.label ? `<span class="label">${objCard.label}</span>` : ''}
		<img src="db/${objCard.img}" alt="${objCard.name}" class="goods-image">
		<h3 class="goods-title">"${objCard.name}"</h3>
		<p class="goods-description">${objCard.description}</p>
		<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
			<span class="button-price">$${objCard.price}</span>
		</button>
	</div>
	`;

	return card;
};

const renderCards = function (data) {
	longGoodsList.textContent = '';
	const cards = data.map(createCard);
	longGoodsList.append(...cards);
	document.body.classList.add('show-goods');
};

more.addEventListener('click', event => {
	getGoods().then(renderCards);
});	

const filterCards = function(field, value) {
	getGoods()
	.then(data => data.filter(good => good[field] === value))
	.then(renderCards);
};

navigationLink.forEach(function (link) {
	link.addEventListener('click', event => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		filterCards(field, value);
		if( link.textContent === 'All') {getGoods().then(renderCards);}
	});
});