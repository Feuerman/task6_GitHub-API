'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
	'use strict';

	var searchURL = 'https://api.github.com/search/repositories',
	    gistURL = 'https://api.github.com/gists',
	    authURL = 'https://api.github.com/user',
	    searchParams = {
		q: '',
		sort: '',
		order: 'asc'
	};

	var searchInput = document.querySelector('.rep-search'),
	    searchTemplate = document.getElementById('rep-template').innerHTML,
	    searchResult = document.querySelector('.rep-content'),
	    gistTemplate = document.getElementById('gist-template').innerHTML,
	    gistResult = document.querySelector('.gist__link'),
	    gistForm = document.querySelector('.gist__form'),
	    profileTemplate = document.getElementById('profile-template').innerHTML,
	    profileResult = document.querySelector('.profile'),
	    authBlock = document.querySelector('.auth-block');

	var authObj = {
		form: document.forms.authForm,
		profile: {
			image: document.querySelector('.profile__image'),
			name: document.querySelector('.profile__name'),
			btnLogout: document.querySelector('.profile__logout')
		}
	};

	/* ---Classes--- */

	var SearchController = function () {
		function SearchController(input, url, params) {
			_classCallCheck(this, SearchController);

			this.input = input;
			this.url = url;
			this.params = params;

			this.request();
		}

		_createClass(SearchController, [{
			key: 'request',
			value: function request() {
				var ajax = new XMLHttpRequest(),
				    that = this;

				var requestStr = function requestStr(obj) {
					var str = '?';
					_.forEach(obj, function (value, key) {
						if (value !== '') {
							str += key + '=' + value + '&';
						}
					});
					return str;
				};

				this.input.addEventListener('keyup', function (event) {
					if (this.value.length > 3) {
						that.params.q = this.value;
						ajax.open('GET', '' + that.url + requestStr(that.params));
						if (auth.isAutorized) {
							ajax.setRequestHeader('Authorization', 'Basic ' + auth.keyBase64);
						};
						ajax.send();
					}
				});

				this.input.addEventListener('keydown', function (event) {
					ajax.abort();
				});

				ajax.onreadystatechange = function () {
					if (this.readyState != 4) return;

					if (this.status != 200) {
						return;
					}

					var searchData = JSON.parse(this.responseText).items.slice(0, 3);

					searchRender.render(searchData);
				};
			}
		}]);

		return SearchController;
	}();

	var GistController = function () {
		function GistController(form, gistURL) {
			_classCallCheck(this, GistController);

			this.form = form;
			this.url = gistURL;

			this.form.onsubmit = this.submitControl.bind(this);
		}

		_createClass(GistController, [{
			key: 'submitControl',
			value: function submitControl(e) {
				e.preventDefault();

				var ajax = new XMLHttpRequest(),
				    that = this;

				var gistName = this.form.gistName.value,
				    gistContent = this.form.gistContent.value,
				    gistObj = this.gistSendObj(gistName, gistContent);

				ajax.open('POST', '' + this.url);
				if (auth.isAutorized) {
					ajax.setRequestHeader('Authorization', 'Basic ' + auth.keyBase64);
				};
				ajax.send(JSON.stringify(gistObj));

				ajax.onreadystatechange = function () {
					if (this.readyState != 4) return;

					if (this.status != 201) {
						console.warn('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'));
						return;
					}

					var gistData = JSON.parse(this.responseText);
					gistRender.render(gistData);
				};
			}
		}, {
			key: 'gistSendObj',
			value: function gistSendObj(file, content) {
				return {
					"files": _defineProperty({}, file, {
						"content": content
					})
				};
			}
		}]);

		return GistController;
	}();

	var Authorization = function () {
		function Authorization(options) {
			_classCallCheck(this, Authorization);

			this.options = options;

			this.form = options.form;
			this.login = options.form.login;
			this.password = options.form.password;
			this.profileImage = options.profile.image;
			this.profileName = options.profile.name;
			this.isAutorized = null;

			this.form.onsubmit = this.formSubmit.bind(this);
		}

		_createClass(Authorization, [{
			key: 'formSubmit',
			value: function formSubmit(e) {
				e.preventDefault();

				if (this.login === null) {
					this.login = this.options.login;
					this.password = this.options.password;
				}

				this.keyBase64 = window.btoa(this.login.value + ':' + this.password.value);

				var ajax = new XMLHttpRequest(),
				    that = this;

				ajax.open('GET', '' + authURL);
				ajax.setRequestHeader('Authorization', 'Basic ' + this.keyBase64);
				ajax.send();

				ajax.onreadystatechange = function () {
					if (this.readyState != 4) return;

					if (this.status != 200) {
						console.warn('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'));
						return;
					}

					that.isAutorized = true;

					var profileData = JSON.parse(this.responseText);
					authRender.render(profileData);

					authBlock.classList.add('auth-block--authorized');
					that.btnLogout = document.querySelector('.profile__logout');
					that.btnLogout.onclick = that.logout.bind(that);
				};
			}
		}, {
			key: 'logout',
			value: function logout() {
				authBlock.classList.remove('auth-block--authorized');
				this.keyBase64 = null;
				this.isAutorized = null;
			}
		}]);

		return Authorization;
	}();

	var Render = function () {
		function Render(elem) {
			var template = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

			_classCallCheck(this, Render);

			this.elem = elem;
			this.template = template;
		}

		_createClass(Render, [{
			key: 'render',
			value: function render(data) {
				var compiled = _.template(this.template);
				this.elem.innerHTML = compiled({ items: data });
			}
		}]);

		return Render;
	}();

	var search = new SearchController(searchInput, searchURL, searchParams),
	    searchRender = new Render(searchResult, searchTemplate),
	    gist = new GistController(gistForm, gistURL),
	    gistRender = new Render(gistResult, gistTemplate),
	    auth = new Authorization(authObj),
	    authRender = new Render(profileResult, profileTemplate);
})();